import { test } from "node:test";
import assert from "node:assert/strict";
import type Anthropic from "@anthropic-ai/sdk";
import { runAgentLoop, type AgentLoopDeps, type AgentLoopResult } from "../src/agentLoop.js";
import { ToolRegistry } from "../src/registry.js";
import { ContextManager } from "../src/context.js";
import { HookBus } from "../src/hooks/hookBus.js";
import { SessionMemory } from "../src/sessionMemory.js";
import { CostTracker } from "../src/costTracker.js";
import type { Analytics } from "../src/analytics.js";
import type { AgentConfig, Tool } from "../src/types.js";

// src/agentLoop.ts 此前零测试：把 partition() 里的
//   const concurrent = tool?.isReadOnly === true;
// 改成 const concurrent = true;（WriteFile / Edit / RunCommand 全被并发启动，
// 同轮两个 Edit 打同一文件会互相覆盖），整套测试仍然全绿。本文件补上这一层。
//
// 做法：用假 Anthropic client（只实现 messages.stream()）回放预置响应，驱动**真实**的
// runAgentLoop。全程不联网、不读 ANTHROPIC_API_KEY、不写文件（sessionFile 留空，
// saveSession 直接短路）。并发/串行用带时序记录的假工具证明，不靠猜。

// ============================================================
// 假 Anthropic client
// ============================================================

function textBlock(text: string): Anthropic.TextBlock {
  return { type: "text", text, citations: null };
}

function toolUseBlock(
  id: string,
  name: string,
  input: Record<string, unknown> = {},
): Anthropic.ToolUseBlock {
  return { type: "tool_use", id, name, input };
}

function assistantMessage(content: Anthropic.ContentBlock[]): Anthropic.Message {
  return {
    id: "msg_test",
    type: "message",
    role: "assistant",
    model: "claude-sonnet-4-20250514",
    content,
    stop_reason: "end_turn",
    stop_sequence: null,
    usage: {
      input_tokens: 10,
      output_tokens: 5,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
    },
  };
}

/** 模型只说话，不调工具 —— 循环该在这一轮结束。 */
function sayMessage(text: string): Anthropic.Message {
  return assistantMessage([textBlock(text)]);
}

/** 模型发起一组工具调用（顺序即模型给出的原顺序）。 */
function callMessage(
  calls: { id: string; name: string; input?: Record<string, unknown> }[],
): Anthropic.Message {
  return assistantMessage(
    calls.map((call) => toolUseBlock(call.id, call.name, call.input ?? {})),
  );
}

interface ApiCall {
  system: string;
  toolNames: string[];
}

/** 按轮次回放脚本；脚本用完就让模型自然收尾，避免测试跑飞。 */
function scripted(messages: Anthropic.Message[]): (turn: number) => Anthropic.Message {
  return (turn) => messages[turn] ?? sayMessage("(script exhausted)");
}

function fakeClient(
  next: (turn: number) => Anthropic.Message,
  apiCalls: ApiCall[],
): Anthropic {
  let turn = 0;
  return {
    messages: {
      stream(params: { system: string; tools: { name: string }[] }) {
        apiCalls.push({
          system: params.system,
          toolNames: params.tools.map((tool) => tool.name),
        });
        const message = next(turn++);
        const stream = {
          on(event: string, callback: (text: string) => void) {
            if (event === "text") {
              for (const block of message.content) {
                if (block.type === "text") callback(block.text);
              }
            }
            return stream;
          },
          async finalMessage(): Promise<Anthropic.Message> {
            return message;
          },
        };
        return stream;
      },
    },
  } as unknown as Anthropic;
}

// ============================================================
// 带时序记录的假工具
// ============================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface ProbeOptions {
  name: string;
  isReadOnly: boolean;
  /** 故意拉长执行窗口，好观察不同工具有没有重叠 */
  delayMs?: number;
  /** 非空时抛异常，用来走「工具执行异常」分支 */
  throws?: string;
  /** 该工具每次调用都返回 isError；要在同一工具上混排成功/失败见 failThisCall */
  isError?: boolean;
}

/** 输入里带这个开关时，该次调用单独按失败返回（同一工具混排成功/失败用）。 */
const FAIL_FLAG = "failThisCall";

/** 一组共享时序探针的假工具：记录执行顺序、并发峰值和实际被执行的工具。 */
function createProbe() {
  const events: string[] = [];
  const executed: string[] = [];
  let active = 0;
  let peak = 0;

  return {
    events,
    executed,
    /** 同时并发执行的工具数峰值：只读批应为批内工具数，串行批恒为 1 */
    get peakConcurrency(): number {
      return peak;
    },
    tool(options: ProbeOptions): Tool {
      return {
        name: options.name,
        description: `probe tool ${options.name}`,
        inputSchema: { type: "object", properties: {}, required: [] },
        isReadOnly: options.isReadOnly,
        async execute(
          args: Record<string, unknown>,
        ): Promise<{ content: string; isError: boolean }> {
          executed.push(options.name);
          active++;
          peak = Math.max(peak, active);
          events.push(`${options.name}:start`);
          try {
            if (options.delayMs) await sleep(options.delayMs);
            if (options.throws) throw new Error(options.throws);
            const failed = options.isError === true || args[FAIL_FLAG] === true;
            return {
              content: failed ? `${options.name} failed` : `${options.name} done`,
              isError: failed,
            };
          } finally {
            events.push(`${options.name}:end`);
            active--;
          }
        },
      };
    },
  };
}

// ============================================================
// 测试夹具
// ============================================================

interface AnalyticsEvent {
  name: string;
  meta: Record<string, unknown>;
}

interface ToolResultRecord {
  id: string;
  content: string;
  isError: boolean;
}

/** PostToolUse 广播的现场记录：审计钩子看到的就是这些。 */
interface PostToolUseRecord {
  toolName: string;
  isError: boolean;
}

/** 循环会打印工具调用日志，测试里静音掉，免得淹没 TAP 输出。 */
async function silenced<T>(fn: () => Promise<T>): Promise<T> {
  const log = console.log;
  const error = console.error;
  console.log = () => {};
  console.error = () => {};
  try {
    return await fn();
  } finally {
    console.log = log;
    console.error = error;
  }
}

/** 脚本可以是一串预置响应，也可以是按轮次现算的函数（测 maxTurns 时要无限脚本）。 */
type Script = Anthropic.Message[] | ((turn: number) => Anthropic.Message);

function createHarness(script: Script) {
  const apiCalls: ApiCall[] = [];
  const client = fakeClient(
    typeof script === "function" ? script : scripted(script),
    apiCalls,
  );
  const registry = new ToolRegistry();
  // 不传 sessionFile：saveSession() 直接短路，测试不落任何文件
  const context = new ContextManager("SYSTEM PROMPT", client);
  const hookBus = new HookBus();
  const sessionMemory = new SessionMemory();
  const analyticsEvents: AnalyticsEvent[] = [];

  // 常驻审计钩子：所有测试都能看到"这次调用发生过、结果是成败"。
  // 没有它，runOne 里漏掉某条 PostToolUse 广播不会有任何测试变红。
  const postToolUse: PostToolUseRecord[] = [];
  hookBus.register({
    name: "test-audit",
    event: "PostToolUse",
    callback: (input) => {
      if (input.event !== "PostToolUse") return;
      postToolUse.push({ toolName: input.toolName, isError: input.isError });
    },
  });

  const deps: AgentLoopDeps = {
    hookBus,
    sessionMemory,
    costTracker: new CostTracker(),
    analytics: {
      logEvent(name: string, meta: Record<string, unknown>): void {
        analyticsEvents.push({ name, meta });
      },
    } as unknown as Analytics,
  };

  const config: AgentConfig = {
    model: "claude-sonnet-4-20250514",
    maxTokens: 1024,
    cwd: "/tmp/mini-agent-loop-test",
    enablePermissionCheck: false,
    permissionMode: "default",
  };

  return {
    registry,
    context,
    hookBus,
    sessionMemory,
    analyticsEvents,
    postToolUse,
    apiCalls,
    run(options: { onText?: (text: string) => void; abortSignal?: AbortSignal } = {}) {
      return silenced<AgentLoopResult>(() =>
        runAgentLoop(
          client,
          registry,
          context,
          config,
          deps,
          options.onText,
          options.abortSignal,
        ),
      );
    },
    /** 按出现顺序收集回填进上下文的所有 tool_result */
    toolResults(): ToolResultRecord[] {
      const records: ToolResultRecord[] = [];
      for (const message of context.getMessages()) {
        if (!Array.isArray(message.content)) continue;
        for (const block of message.content) {
          if (block.type !== "tool_result") continue;
          records.push({
            id: block.tool_use_id,
            content:
              typeof block.content === "string"
                ? block.content
                : JSON.stringify(block.content),
            isError: block.is_error === true,
          });
        }
      }
      return records;
    },
  };
}

// ============================================================
// 第 5 章：按 isReadOnly 分区调度
// ============================================================

test("只读工具编进同一并发批、有副作用工具独占串行批，批与批保持原顺序", async () => {
  const probe = createProbe();
  const harness = createHarness([
    callMessage([
      { id: "t1", name: "ReadA" },
      { id: "t2", name: "ReadB" },
      { id: "t3", name: "WriteX" },
      { id: "t4", name: "ReadC" },
    ]),
    sayMessage("全部完成"),
  ]);
  harness.registry.register(probe.tool({ name: "ReadA", isReadOnly: true, delayMs: 20 }));
  harness.registry.register(probe.tool({ name: "ReadB", isReadOnly: true, delayMs: 20 }));
  harness.registry.register(probe.tool({ name: "WriteX", isReadOnly: false, delayMs: 20 }));
  harness.registry.register(probe.tool({ name: "ReadC", isReadOnly: true, delayMs: 20 }));

  const result = await harness.run();
  assert.equal(result.reason, "end_turn");

  // 并发的确实重叠：只读批里两个工具同时在跑
  assert.deepEqual(probe.events.slice(0, 2).sort(), ["ReadA:start", "ReadB:start"]);
  // 串行的确实不重叠：并发峰值恰好等于只读批的大小，写工具从不与人共处一室
  assert.equal(
    probe.peakConcurrency,
    2,
    `并发峰值应为 2（只读批大小），实际时序：${probe.events.join(" ")}`,
  );

  const at = (event: string): number => probe.events.indexOf(event);
  assert.ok(at("WriteX:start") > at("ReadA:end"), "写工具必须等只读批全部结束");
  assert.ok(at("WriteX:start") > at("ReadB:end"), "写工具必须等只读批全部结束");
  assert.ok(at("ReadC:start") > at("WriteX:end"), "下一批必须等写工具结束");

  assert.deepEqual(
    harness.toolResults().map((item) => item.id),
    ["t1", "t2", "t3", "t4"],
  );
});

test("tool_result 回填顺序与 tool_use 顺序一致（不是执行完成顺序）", async () => {
  const probe = createProbe();
  const harness = createHarness([
    callMessage([
      { id: "w1", name: "WriteX" },
      { id: "r1", name: "SlowRead" },
      { id: "r2", name: "FastRead" },
    ]),
    sayMessage("完成"),
  ]);
  harness.registry.register(probe.tool({ name: "WriteX", isReadOnly: false }));
  // 慢的先被请求、后完成：如果按完成顺序回填，这里就会露馅
  harness.registry.register(probe.tool({ name: "SlowRead", isReadOnly: true, delayMs: 30 }));
  harness.registry.register(probe.tool({ name: "FastRead", isReadOnly: true }));

  await harness.run();

  assert.ok(
    probe.events.indexOf("FastRead:end") < probe.events.indexOf("SlowRead:end"),
    "前提没成立：FastRead 应当先于 SlowRead 完成",
  );
  assert.deepEqual(
    harness.toolResults().map((item) => item.id),
    ["w1", "r1", "r2"],
  );
});

// ============================================================
// 第 12 章：PreToolUse 钩子拦截
// ============================================================

test("PreToolUse 返回 block 时工具不执行，并回填一条 is_error 的 tool_result", async () => {
  const probe = createProbe();
  const harness = createHarness([
    callMessage([
      { id: "t1", name: "ReadA" },
      { id: "t2", name: "WriteX", input: { file_path: "/tmp/x.ts" } },
    ]),
    sayMessage("已按拦截结果调整"),
  ]);
  harness.registry.register(probe.tool({ name: "ReadA", isReadOnly: true }));
  harness.registry.register(probe.tool({ name: "WriteX", isReadOnly: false }));
  harness.hookBus.register({
    name: "test-permission",
    event: "PreToolUse",
    matcher: "WriteX",
    callback: () => ({ block: true, reason: "本次会话禁止写文件" }),
  });

  const result = await harness.run();
  assert.equal(result.reason, "end_turn");

  // 被拦的工具 execute 一次都没被调用
  assert.deepEqual(probe.executed, ["ReadA"]);

  const results = harness.toolResults();
  assert.deepEqual(results.map((item) => item.id), ["t1", "t2"]);
  assert.equal(results[0]?.isError, false);
  assert.equal(results[1]?.isError, true);
  assert.match(results[1]?.content ?? "", /Blocked by hook: 本次会话禁止写文件/);

  // 被拦的工具不该产生 analytics 埋点、也不该广播 PostToolUse（它压根没执行）
  assert.deepEqual(
    harness.analyticsEvents.map((event) => event.meta.tool_name),
    ["ReadA"],
  );
  assert.deepEqual(harness.postToolUse, [{ toolName: "ReadA", isError: false }]);
});

// ============================================================
// 异常路径：未知工具 / 工具抛异常
// ============================================================

test("未知工具名回填 is_error，循环不崩、继续下一轮", async () => {
  const probe = createProbe();
  const harness = createHarness([
    callMessage([
      { id: "t1", name: "NoSuchTool" },
      { id: "t2", name: "ReadA" },
    ]),
    sayMessage("换个工具重来"),
  ]);
  harness.registry.register(probe.tool({ name: "ReadA", isReadOnly: true }));

  const result = await harness.run();
  assert.equal(result.reason, "end_turn");
  assert.equal(result.finalResponse, "换个工具重来");

  const results = harness.toolResults();
  assert.equal(results[0]?.isError, true);
  assert.match(results[0]?.content ?? "", /Unknown tool "NoSuchTool"/);
  assert.equal(results[1]?.isError, false);
});

test("工具 execute 抛异常时回填 is_error 的 tool_result，异常不冒泡出循环", async () => {
  const probe = createProbe();
  const harness = createHarness([
    callMessage([{ id: "t1", name: "Boom" }, { id: "t2", name: "ReadA" }]),
    sayMessage("已处理异常"),
  ]);
  harness.registry.register(
    probe.tool({ name: "Boom", isReadOnly: false, throws: "disk on fire" }),
  );
  harness.registry.register(probe.tool({ name: "ReadA", isReadOnly: true }));

  const result = await harness.run();
  assert.equal(result.reason, "end_turn");

  const results = harness.toolResults();
  assert.equal(results[0]?.isError, true);
  assert.match(results[0]?.content ?? "", /Tool execution error: disk on fire/);
  // 抛异常没有中断后续工具
  assert.deepEqual(probe.executed, ["Boom", "ReadA"]);

  // 抛异常这条路径同样要走完两个副作用挂点：审计要的正是"这次调用失败了"。
  // 直接 return 会让审计流水缺一块、失败率统计永远偏低，所以在这里钉死。
  assert.deepEqual(harness.postToolUse, [
    { toolName: "Boom", isError: true },
    { toolName: "ReadA", isError: false },
  ]);
  assert.deepEqual(harness.analyticsEvents, [
    { name: "tool_use", meta: { tool_name: "Boom", is_error: true } },
    { name: "tool_use", meta: { tool_name: "ReadA", is_error: false } },
  ]);
});

// ============================================================
// 终止条件
// ============================================================

test("达到 maxTurns 时以 max_turns 退出（第 31 轮开头判定）", async () => {
  const probe = createProbe();
  // 模型每一轮都要求再调一次工具，永远不收尾
  const harness = createHarness((turn) =>
    callMessage([{ id: `t${turn}`, name: "ReadA" }]),
  );
  harness.registry.register(probe.tool({ name: "ReadA", isReadOnly: true }));

  const result = await harness.run();
  assert.equal(result.reason, "max_turns");
  assert.equal(result.turnCount, 31); // maxTurns = 30，第 31 轮开头才判定
  assert.equal(harness.apiCalls.length, 30, "第 31 轮不应再打 API");
  assert.equal(probe.executed.length, 30);
});

test("abortSignal 已 abort 时立即以 aborted 退出，一次 API 都不打", async () => {
  const harness = createHarness([sayMessage("不该被读到")]);
  const controller = new AbortController();
  controller.abort();

  const result = await harness.run({ abortSignal: controller.signal });
  assert.equal(result.reason, "aborted");
  assert.equal(result.turnCount, 0);
  assert.deepEqual(harness.apiCalls, []);
});

test("模型不再调工具时以 end_turn 退出，文本经 onText 流出并作为 finalResponse", async () => {
  const harness = createHarness([sayMessage("这是最终回答")]);
  const streamed: string[] = [];

  const result = await harness.run({ onText: (text) => streamed.push(text) });

  assert.equal(result.reason, "end_turn");
  assert.equal(result.finalResponse, "这是最终回答");
  assert.equal(result.turnCount, 1);
  assert.deepEqual(streamed, ["这是最终回答"]);
});

// ============================================================
// 第 8 / 19 章：工具执行的两个副作用挂点
// ============================================================

test("第 19 章埋点只记工具名与成败，不带任何输入参数", async () => {
  const probe = createProbe();
  const harness = createHarness([
    callMessage([
      { id: "t1", name: "ReadA", input: { file_path: "/Users/me/secret.ts" } },
      { id: "t2", name: "Failing", input: { command: "cat /etc/passwd" } },
    ]),
    sayMessage("完成"),
  ]);
  harness.registry.register(probe.tool({ name: "ReadA", isReadOnly: true }));
  harness.registry.register(
    probe.tool({ name: "Failing", isReadOnly: false, isError: true }),
  );

  await harness.run();

  assert.deepEqual(harness.analyticsEvents, [
    { name: "tool_use", meta: { tool_name: "ReadA", is_error: false } },
    { name: "tool_use", meta: { tool_name: "Failing", is_error: true } },
  ]);
  const serialized = JSON.stringify(harness.analyticsEvents);
  assert.ok(!serialized.includes("secret.ts"));
  assert.ok(!serialized.includes("/etc/passwd"));

  // 成功路径也必须广播 PostToolUse，且 isError 与工具的实际结果一致
  assert.deepEqual(harness.postToolUse, [
    { toolName: "ReadA", isError: false },
    { toolName: "Failing", isError: true },
  ]);
});

test("第 8 章回写：只有真正成功的写文件 / 命令才进会话笔记", async () => {
  const probe = createProbe();
  const harness = createHarness([
    callMessage([
      { id: "t1", name: "WriteFile", input: { file_path: "src/a.ts" } },
      { id: "t2", name: "RunCommand", input: { command: "npm test" } },
    ]),
    callMessage([
      { id: "t3", name: "Edit", input: { file_path: "src/b.ts" } },
      // 失败的命令要如实记成 failed —— 它是下一步诊断的证据，不能记成成功
      { id: "t4", name: "RunCommand", input: { command: "npm run build", failThisCall: true } },
    ]),
    sayMessage("完成"),
  ]);
  harness.registry.register(probe.tool({ name: "WriteFile", isReadOnly: false }));
  harness.registry.register(probe.tool({ name: "RunCommand", isReadOnly: false }));
  // 失败的编辑不该被记成"已改动文件"
  harness.registry.register(
    probe.tool({ name: "Edit", isReadOnly: false, isError: true }),
  );

  await harness.run();

  const snapshot = harness.sessionMemory.snapshot();
  assert.deepEqual(snapshot.changedFiles, ["src/a.ts"]);
  assert.deepEqual(
    snapshot.commands.map((item) => ({ command: item.command, ok: item.ok })),
    [
      { command: "npm test", ok: true },
      { command: "npm run build", ok: false },
    ],
  );
});
