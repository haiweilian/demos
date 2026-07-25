import { test } from "node:test";
import assert from "node:assert/strict";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { Readable } from "node:stream";
import { HookBus } from "../src/hooks/hookBus.js";
import type { Hook } from "../src/hooks/types.js";
import {
  makePermissionHook,
  projectInfoHook,
  auditHook,
} from "../src/hooks/builtins.js";

const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

/**
 * 用替身 stdin 跑一段会触发交互确认的逻辑。
 * askUserConfirmation 直接读 process.stdin，测试里换成一个替身流，
 * 这样既能验证 ask 分支，又不会把 readline 挂在真实 stdin 上不放。
 * 收尾时 destroy 替身：钩子被掐断时 readline 还挂在它身上，销毁掉才不留监听器。
 */
async function withFakeStdin<T>(fake: Readable, fn: () => Promise<T>): Promise<T> {
  const original = Object.getOwnPropertyDescriptor(process, "stdin")!;
  Object.defineProperty(process, "stdin", {
    value: fake as unknown as NodeJS.ReadStream,
    configurable: true,
  });
  const originalLog = console.log;
  console.log = () => {}; // 吞掉确认提示，保持测试输出干净
  try {
    return await fn();
  } finally {
    console.log = originalLog;
    Object.defineProperty(process, "stdin", original);
    fake.destroy();
  }
}

/** 预置一个答案的 stdin 替身：用来跑通 ask 分支。 */
function withStdin<T>(answer: string, fn: () => Promise<T>): Promise<T> {
  return withFakeStdin(Readable.from([answer]), fn);
}

/**
 * 永不作答、也不结束的 stdin 替身：模拟"用户走开了"。
 * 一旦钩子真的走到 askUserConfirmation，它返回的 Promise 就永远悬着，
 * 于是"真的放行"和"其实去问人了"能被区分开。
 */
function withSilentStdin<T>(fn: () => Promise<T>): Promise<T> {
  return withFakeStdin(new Readable({ read() {} }), fn);
}

/** 给一段逻辑设一个观察窗口：超过 ms 还没返回就返回 null（判定为"卡住了"）。 */
async function raceWindow<T>(ms: number, p: Promise<T>): Promise<T | null> {
  let timer: NodeJS.Timeout | undefined;
  const guard = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), ms);
  });
  try {
    return await Promise.race([p, guard]);
  } finally {
    clearTimeout(timer);
  }
}

/** 捕获 console.error（emit 里钩子失败的日志），顺便让测试输出保持干净 */
async function captureStderr(fn: () => Promise<void>): Promise<string[]> {
  const lines: string[] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => {
    lines.push(args.map(String).join(" "));
  };
  try {
    await fn();
  } finally {
    console.error = original;
  }
  return lines;
}

async function makeTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "mini-agent-hooks-"));
}

// ============================================================
// HookBus：注册、匹配、聚合
// ============================================================

test("无钩子时走快速路径，返回空聚合结果", async () => {
  const bus = new HookBus();
  const result = await bus.emit({ event: "Stop", finalText: "done" });
  assert.deepEqual(result, { blocked: false, additionalContexts: [] });
});

test("同一事件的钩子按注册顺序串行触发", async () => {
  const bus = new HookBus();
  const order: string[] = [];
  const mk = (name: string, delay: number): Hook => ({
    name,
    event: "PreToolUse",
    async callback() {
      await sleep(delay);
      order.push(name);
    },
  });
  // 第一个故意睡得更久：串行执行下它仍然先完成
  bus.register(mk("first", 20));
  bus.register(mk("second", 0));

  await bus.emit({ event: "PreToolUse", isReadOnly: false, toolName: "RunCommand", toolInput: {} });
  assert.deepEqual(order, ["first", "second"]);
});

test("只触发对应事件桶里的钩子", async () => {
  const bus = new HookBus();
  const fired: string[] = [];
  bus.register({
    name: "pre",
    event: "PreToolUse",
    callback() {
      fired.push("pre");
    },
  });
  bus.register({
    name: "post",
    event: "PostToolUse",
    callback() {
      fired.push("post");
    },
  });

  await bus.emit({ event: "PreToolUse", isReadOnly: false, toolName: "ReadFile", toolInput: {} });
  assert.deepEqual(fired, ["pre"]);
});

test("matcher 精确名匹配：不命中的工具事件跳过该钩子", async () => {
  const bus = new HookBus();
  const fired: string[] = [];
  bus.register({
    name: "only-write",
    event: "PreToolUse",
    matcher: "WriteFile",
    callback() {
      fired.push("only-write");
    },
  });
  bus.register({
    name: "star",
    event: "PreToolUse",
    matcher: "*",
    callback() {
      fired.push("star");
    },
  });
  bus.register({
    name: "no-matcher",
    event: "PreToolUse",
    callback() {
      fired.push("no-matcher");
    },
  });

  await bus.emit({ event: "PreToolUse", isReadOnly: false, toolName: "RunCommand", toolInput: {} });
  assert.deepEqual(fired, ["star", "no-matcher"]);

  fired.length = 0;
  await bus.emit({ event: "PreToolUse", isReadOnly: false, toolName: "WriteFile", toolInput: {} });
  assert.deepEqual(fired, ["only-write", "star", "no-matcher"]);
});

test("非工具事件忽略 matcher", async () => {
  const bus = new HookBus();
  let fired = false;
  bus.register({
    name: "session",
    event: "SessionStart",
    matcher: "WriteFile", // 对 SessionStart 无意义，应被忽略
    callback() {
      fired = true;
    },
  });

  await bus.emit({ event: "SessionStart", cwd: process.cwd() });
  assert.equal(fired, true);
});

test("PreToolUse 返回 block 能拦截，并带上 reason", async () => {
  const bus = new HookBus();
  bus.register({
    name: "blocker",
    event: "PreToolUse",
    callback() {
      return { block: true, reason: "不许跑这个" };
    },
  });

  const result = await bus.emit({
    event: "PreToolUse",
    isReadOnly: false,
    toolName: "RunCommand",
    toolInput: { command: "whoami" },
  });
  assert.equal(result.blocked, true);
  assert.equal(result.blockReason, "不许跑这个");
});

test("拦截优先：一个放行一个拦截，整体拦截且后续钩子照跑", async () => {
  const bus = new HookBus();
  let tailRan = false;
  bus.register({
    name: "allow",
    event: "PreToolUse",
    callback() {
      /* 什么都不返回 = 放行 */
    },
  });
  bus.register({
    name: "deny",
    event: "PreToolUse",
    callback() {
      return { block: true, reason: "危险" };
    },
  });
  bus.register({
    name: "tail",
    event: "PreToolUse",
    callback() {
      tailRan = true;
    },
  });

  const result = await bus.emit({
    event: "PreToolUse",
    isReadOnly: false,
    toolName: "RunCommand",
    toolInput: {},
  });
  assert.equal(result.blocked, true);
  assert.equal(result.blockReason, "危险");
  assert.equal(tailRan, true, "拦截不应中断后续钩子的执行");
});

test("additionalContext 多个钩子累加、谁也不覆盖谁", async () => {
  const bus = new HookBus();
  bus.register({
    name: "ctx-a",
    event: "SessionStart",
    callback() {
      return { additionalContext: "A" };
    },
  });
  bus.register({
    name: "ctx-b",
    event: "SessionStart",
    callback() {
      return { additionalContext: "B" };
    },
  });

  const result = await bus.emit({ event: "SessionStart", cwd: process.cwd() });
  assert.deepEqual(result.additionalContexts, ["A", "B"]);
  assert.equal(result.blocked, false);
});

// ============================================================
// HookBus：容错（抛错 / 超时）
// ============================================================

test("钩子抛错被隔离：记日志、不拦截、后续钩子照跑", async () => {
  const bus = new HookBus();
  let tailRan = false;
  bus.register({
    name: "boom",
    event: "PreToolUse",
    callback() {
      throw new Error("钩子内部炸了");
    },
  });
  bus.register({
    name: "tail",
    event: "PreToolUse",
    callback() {
      tailRan = true;
      return { additionalContext: "ok" };
    },
  });

  let result!: Awaited<ReturnType<HookBus["emit"]>>;
  const logs = await captureStderr(async () => {
    result = await bus.emit({
      event: "PreToolUse",
      isReadOnly: false,
      toolName: "RunCommand",
      toolInput: {},
    });
  });

  assert.equal(result.blocked, false, "抛错 ≠ 想拦截");
  assert.deepEqual(result.additionalContexts, ["ok"]);
  assert.equal(tailRan, true);
  assert.equal(logs.length, 1);
  assert.match(logs[0]!, /\[Hook\] "boom" failed: 钩子内部炸了/);
});

test("异步钩子 reject 同样被隔离", async () => {
  const bus = new HookBus();
  bus.register({
    name: "reject",
    event: "PostToolUse",
    async callback() {
      throw new Error("async 失败");
    },
  });

  let result!: Awaited<ReturnType<HookBus["emit"]>>;
  const logs = await captureStderr(async () => {
    result = await bus.emit({
      event: "PostToolUse",
      toolName: "RunCommand",
      toolInput: {},
      isError: false,
    });
  });

  assert.equal(result.blocked, false);
  assert.match(logs[0]!, /"reject" failed: async 失败/);
});

test("超时：普通旁路钩子被单独掐断，主线不卡死、后续钩子照跑（超时 ≠ 拦截）", async () => {
  const bus = new HookBus();
  let tailRan = false;
  // 用可注入的短超时代替默认 5000ms，测试不必真的等 5 秒
  bus.register({
    name: "slow",
    event: "PreToolUse",
    timeoutMs: 20,
    async callback() {
      await sleep(300);
    },
  });
  bus.register({
    name: "tail",
    event: "PreToolUse",
    callback() {
      tailRan = true;
    },
  });

  const startedAt = Date.now();
  let result!: Awaited<ReturnType<HookBus["emit"]>>;
  const logs = await captureStderr(async () => {
    result = await bus.emit({
      event: "PreToolUse",
      isReadOnly: false,
      toolName: "RunCommand",
      toolInput: {},
    });
  });
  const elapsed = Date.now() - startedAt;

  assert.ok(elapsed < 250, `emit 应在超时后立即返回，实际耗时 ${elapsed}ms`);
  assert.equal(result.blocked, false, "超时 ≠ 拦截");
  assert.equal(tailRan, true);
  assert.match(logs[0]!, /"slow" failed: Hook "slow" timed out after 20ms/);
});

test("超时预算是单钩子级别：放宽 timeoutMs 后同一个钩子能跑完", async () => {
  const bus = new HookBus();
  let finished = false;
  bus.register({
    name: "slow-but-allowed",
    event: "PreToolUse",
    timeoutMs: 500,
    async callback() {
      await sleep(50);
      finished = true;
      return { additionalContext: "跑完了" };
    },
  });

  const result = await bus.emit({
    event: "PreToolUse",
    isReadOnly: false,
    toolName: "RunCommand",
    toolInput: {},
  });
  assert.equal(finished, true);
  assert.deepEqual(result.additionalContexts, ["跑完了"]);
});

test("timeoutMs 为 Infinity 表示不设上限：钩子不会被定时器掐断", async () => {
  const bus = new HookBus();
  bus.register({
    name: "no-deadline",
    event: "PreToolUse",
    timeoutMs: Number.POSITIVE_INFINITY,
    async callback() {
      await sleep(60); // 远超 setTimeout(Infinity) 被截断后的 1ms
      return { additionalContext: "跑完了" };
    },
  });

  let result!: Awaited<ReturnType<HookBus["emit"]>>;
  const logs = await captureStderr(async () => {
    result = await bus.emit({
      event: "PreToolUse",
      isReadOnly: false,
      toolName: "RunCommand",
      toolInput: {},
    });
  });

  // setTimeout(fn, Infinity) 会被 Node 截成 1ms 立刻触发，withTimeout 必须短路掉
  assert.deepEqual(logs, [], "无上限的钩子不该产生超时日志");
  assert.deepEqual(result.additionalContexts, ["跑完了"]);
});

// ============================================================
// HookBus：fail-closed 安全闸门
// ============================================================

test("failClosed 钩子超时 → 按拦截处理（闸门坏了不能等于放行）", async () => {
  const bus = new HookBus();
  let tailRan = false;
  bus.register({
    name: "gate",
    event: "PreToolUse",
    failClosed: true,
    timeoutMs: 20,
    async callback() {
      await sleep(300); // 永远等不到结论
    },
  });
  bus.register({
    name: "tail",
    event: "PreToolUse",
    callback() {
      tailRan = true;
    },
  });

  let result!: Awaited<ReturnType<HookBus["emit"]>>;
  const logs = await captureStderr(async () => {
    result = await bus.emit({
      event: "PreToolUse",
      isReadOnly: false,
      toolName: "RunCommand",
      toolInput: {},
    });
  });

  assert.equal(result.blocked, true, "fail-closed 钩子超时必须拦截");
  assert.match(result.blockReason ?? "", /gate/);
  assert.match(result.blockReason ?? "", /timed out after 20ms/);
  assert.equal(tailRan, true, "拦截不应中断后续钩子");
  assert.equal(logs.length, 1);
});

test("failClosed 钩子抛错 → 同样按拦截处理", async () => {
  const bus = new HookBus();
  bus.register({
    name: "gate",
    event: "PreToolUse",
    failClosed: true,
    callback() {
      throw new Error("闸门自己炸了");
    },
  });

  let result!: Awaited<ReturnType<HookBus["emit"]>>;
  await captureStderr(async () => {
    result = await bus.emit({
      event: "PreToolUse",
      isReadOnly: false,
      toolName: "RunCommand",
      toolInput: {},
    });
  });

  assert.equal(result.blocked, true);
  assert.match(result.blockReason ?? "", /闸门自己炸了/);
});

// ============================================================
// 内置钩子
// ============================================================

test("permissionHook：危险命令走 deny 分支被拦下（reason 来自 permissions.ts）", async () => {
  const bus = new HookBus();
  // bypass 模式也拦得住，证明黑名单不可绕过 + 走的是钩子链路
  bus.register(makePermissionHook("bypass"));

  const result = await bus.emit({
    event: "PreToolUse",
    isReadOnly: false,
    toolName: "RunCommand",
    toolInput: { command: "rm -rf /tmp/cache" },
  });
  assert.equal(result.blocked, true);
  assert.equal(
    result.blockReason,
    "危险命令被拦截：递归强制删除（rm -rf）可能永久损毁数据",
  );
});

test("permissionHook：受限路径写入被拦，普通命令在 bypass 下放行", async () => {
  const bus = new HookBus();
  bus.register(makePermissionHook("bypass"));

  const denied = await bus.emit({
    event: "PreToolUse",
    isReadOnly: false,
    toolName: "WriteFile",
    toolInput: { file_path: "/etc/passwd", content: "x" },
  });
  assert.equal(denied.blocked, true);
  assert.match(denied.blockReason ?? "", /禁止写入受限路径/);

  const allowed = await bus.emit({
    event: "PreToolUse",
    isReadOnly: false,
    toolName: "RunCommand",
    toolInput: { command: "ls -la" },
  });
  assert.equal(allowed.blocked, false);
});

test("permissionHook：只读工具直接放行（不会误触发交互确认）", async () => {
  const bus = new HookBus();
  bus.register(makePermissionHook("default"));

  // 只读工具没有副作用，钩子第一行就返回，不会走到 ask。
  // 装一个"永不作答"的 stdin：真放行 → 立刻返回；偷偷去问人 → 一直悬着。
  // 光断言 blocked===false 是假绿——超时被吞、闸门失灵也满足它。
  let result: Awaited<ReturnType<HookBus["emit"]>> | null = null;
  const logs = await captureStderr(async () => {
    result = await withSilentStdin(() =>
      raceWindow(
        300,
        bus.emit({
          event: "PreToolUse",
          isReadOnly: true,
          toolName: "ReadFile",
          toolInput: { file_path: "a.txt" },
        }),
      ),
    );
  });

  assert.notEqual(result, null, "只读工具不该触发交互确认（emit 卡住了）");
  assert.deepEqual(logs, [], "放行必须是钩子自己返回的，不能是超时/报错被吞掉");
  assert.equal(result!.blocked, false);
});

// 权限钩子是安全闸门，不是旁路钩子：它的"没结论"必须等于"不放行"。
test("permissionHook：人机确认豁免超时预算，并标记 failClosed", () => {
  const hook = makePermissionHook("default");
  // 不设 timeoutMs 就会落到总线默认的 5000ms —— 用户犹豫超过 5 秒，
  // withTimeout 会 reject，emit 只打一行日志就 continue，工具照常执行（fail-open）。
  assert.equal(
    Number.isFinite(hook.timeoutMs ?? 5000),
    false,
    "等用户按键的钩子不能有超时上限",
  );
  assert.equal(hook.failClosed, true, "闸门失灵必须按拦截处理");
});

test("permissionHook：ask 分支下用户没作答就超时 → 不放行（fail-closed）", async () => {
  const bus = new HookBus();
  // 故意把无上限的预算改成 20ms，模拟"有人给闸门配了超时"这种误配置：
  // 修复前这里会返回 blocked=false（用户从没批准，工具却照跑）。
  bus.register({ ...makePermissionHook("default"), timeoutMs: 20 });

  let result!: Awaited<ReturnType<HookBus["emit"]>>;
  await captureStderr(async () => {
    result = await withSilentStdin(() =>
      bus.emit({
        event: "PreToolUse",
        isReadOnly: false,
        toolName: "RunCommand",
        toolInput: { command: "npm publish" },
      }),
    );
  });

  assert.equal(result.blocked, true, "没等到用户批准，绝不能放行");
  assert.match(result.blockReason ?? "", /builtin:permission/);
});

// 第 11 章的权限合同：未被专门识别的副作用工具默认 ask，而不是 allow。
// 下面两条用替身 stdin 把交互确认跑完，验证 fail-closed 的两个方向。
test("permissionHook：未知副作用工具默认 ask —— 用户拒绝则拦截（fail-closed）", async () => {
  const bus = new HookBus();
  bus.register(makePermissionHook("bypass")); // 连 bypass 都不能让未知写工具溜过去

  const result = await withStdin("n\n", () =>
    bus.emit({
      event: "PreToolUse",
      isReadOnly: false,
      toolName: "mcp__remote__write_doc", // 名字未知，但 isReadOnly=false
      toolInput: { doc: "x" },
    }),
  );
  assert.equal(result.blocked, true);
  assert.match(result.blockReason ?? "", /执行有副作用的工具 mcp__remote__write_doc/);
});

test("permissionHook：未知副作用工具默认 ask —— 用户批准则放行", async () => {
  const bus = new HookBus();
  bus.register(makePermissionHook("default"));

  const result = await withStdin("y\n", () =>
    bus.emit({
      event: "PreToolUse",
      isReadOnly: false,
      toolName: "mcp__remote__write_doc",
      toolInput: { doc: "x" },
    }),
  );
  assert.equal(result.blocked, false);
});

test("projectInfoHook：有 README 就注入头几行，没有则不补充", async () => {
  const dir = await makeTempDir();
  try {
    const bus = new HookBus();
    bus.register(projectInfoHook);

    // 没有 README：不补充上下文
    const empty = await bus.emit({ event: "SessionStart", cwd: dir });
    assert.deepEqual(empty.additionalContexts, []);

    // 写一个 12 行的 README，只应取前 10 行
    const lines = Array.from({ length: 12 }, (_, i) => `line-${i + 1}`);
    await fs.writeFile(path.join(dir, "README.md"), lines.join("\n"), "utf-8");

    const withReadme = await bus.emit({ event: "SessionStart", cwd: dir });
    assert.equal(withReadme.additionalContexts.length, 1);
    const ctx = withReadme.additionalContexts[0]!;
    assert.match(ctx, /^Project README \(first lines\):\n/);
    assert.ok(ctx.includes("line-10"));
    assert.ok(!ctx.includes("line-11"), "只取前 10 行");
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test("auditHook：PostToolUse 追加流水行，且不影响放行决策", async () => {
  const dir = await makeTempDir();
  const originalCwd = process.cwd();
  // auditHook 按相对路径写 audit.log，切到临时目录避免污染仓库
  process.chdir(dir);
  try {
    const bus = new HookBus();
    bus.register(auditHook);

    const result = await bus.emit({
      event: "PostToolUse",
      toolName: "RunCommand",
      toolInput: { command: "ls" },
      isError: false,
    });
    assert.equal(result.blocked, false);
    assert.deepEqual(result.additionalContexts, []);

    // 非目标工具不记流水
    await bus.emit({
      event: "PostToolUse",
      toolName: "ReadFile",
      toolInput: { file_path: "a.txt" },
      isError: false,
    });

    const log = await fs.readFile(path.join(dir, "audit.log"), "utf-8");
    const entries = log.trim().split("\n");
    assert.equal(entries.length, 1);
    const entry = JSON.parse(entries[0]!) as {
      tool: string;
      args: string;
      error: boolean;
      ts: string;
    };
    assert.equal(entry.tool, "RunCommand");
    assert.equal(entry.error, false);
    assert.equal(entry.args, JSON.stringify({ command: "ls" }));
    assert.ok(Number.isFinite(Date.parse(entry.ts)));
  } finally {
    process.chdir(originalCwd);
    await fs.rm(dir, { recursive: true, force: true });
  }
});
