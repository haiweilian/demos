// src/cli.ts
// 对应 Claude Code:
//   src/entrypoints/cli.tsx（启动入口）
//   src/screens/REPL.tsx（Ink 交互界面）
//   src/ink.ts（Ink 应用管理）
//
// 第 19 章把"开机仪式"抽进了 bootstrap()，所以这里只剩入口该干的三件事：
// 读输入、转交核心、渲染输出。命令分发器额外承担第 9 / 16 章的两条用户入口。

import * as readline from "readline";
import type { AgentConfig } from "./types.js";
import { bootstrap, type AgentRuntime } from "./bootstrap.js";
import { runAgentLoop } from "./agentLoop.js";
import { activateSkill } from "./skills/activate.js";
import { selectMemories, type ProjectMemoryKind } from "./projectMemory.js";
import { askUserConfirmation } from "./permissions.js";

/** REPL 的可变状态。抽成对象是为了让模块级的 handleCommand 也能改它。 */
interface CliState {
  /** 下一条用户输入是否应当开启一个新任务（第 8 章 SessionMemory.beginTask） */
  needsNewTask: boolean;
}

/**
 * 启动 CLI 交互循环。
 */
export async function startCLI(config: AgentConfig): Promise<void> {
  // 开机仪式：client / registry / context / flags / analytics / cost /
  // sessionMemory / memoryStore / hookBus / skills 全在这一步备好。
  const runtime = await bootstrap(config);
  const { client, registry, context: contextManager } = runtime;

  if (contextManager.getMessages().length > 0) {
    console.log("[Session] Previous session restored. Type /clear to start fresh.");
  }

  // 创建 readline 接口
  // Claude Code 使用 Ink（React for CLI）构建 UI，
  // 我们用 Node.js 原生的 readline 模块。
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "\n> ",
  });

  // 中断控制器
  let currentAbort: AbortController | null = null;
  let rlClosed = false;
  const state: CliState = { needsNewTask: true };

  const promptIfOpen = (): void => {
    if (!rlClosed) {
      rl.prompt();
    }
  };

  rl.on("close", () => {
    rlClosed = true;
  });

  // 处理 Ctrl+C
  rl.on("SIGINT", () => {
    if (currentAbort) {
      console.log("\n[Interrupted]");
      currentAbort.abort();
      currentAbort = null;
      promptIfOpen();
    } else {
      console.log("\nGoodbye!");
      process.exit(0);
    }
  });

  /** 跑一轮 Agent 循环，并把运行期依赖一次性交给它 */
  const runOneTurn = async (): Promise<void> => {
    currentAbort = new AbortController();
    try {
      const result = await runAgentLoop(
        client,
        registry,
        contextManager,
        config,
        {
          hookBus: runtime.hookBus,
          sessionMemory: runtime.sessionMemory,
          costTracker: runtime.cost,
          analytics: runtime.analytics,
        },
        (text) => process.stdout.write(text), // 流式输出回调
        currentAbort.signal,
      );

      // 打印结果状态
      if (result.reason === "end_turn") {
        // 正常结束，文本已流式输出
        console.log(""); // 换行
      } else if (result.reason === "max_turns") {
        console.log(`\n[Stopped after ${result.turnCount} turns]`);
      } else if (result.reason === "error") {
        console.log("\n[Agent stopped due to error]");
      }

      // 保存会话
      await contextManager.saveSession(config.cwd);
    } catch (err) {
      console.error("\n[Fatal error]:", (err as Error).message);
    }
    currentAbort = null;
  };

  // 打印欢迎信息
  printWelcome(config);
  promptIfOpen();

  // 主交互循环
  // 对应 Claude Code 的 REPL 组件事件循环
  for await (const line of rl) {
    const input = line.trim();

    if (!input) {
      promptIfOpen();
      continue;
    }

    // 处理内置命令与 Skill 命令
    // 对应 Claude Code: src/commands.ts
    if (input.startsWith("/")) {
      const handled = await handleCommand(input, runtime, config, state);
      if (handled === "exit") {
        break;
      }
      if (handled === "run-agent") {
        // 第 16 章：Skill 指令已注入，立刻跑一轮让模型响应它
        await runOneTurn();
      }
      promptIfOpen();
      continue;
    }

    // 第 8 章：一段连续对话属于同一个任务，任务边界由用户显式切换
    if (state.needsNewTask) {
      runtime.sessionMemory.beginTask(input);
      state.needsNewTask = false;
    }

    // 添加用户消息到上下文
    contextManager.addMessage({
      role: "user",
      content: input,
    });

    await runOneTurn();
    promptIfOpen();
  }

  // 退出前保存
  await contextManager.saveSession(config.cwd);
  await runtime.analytics.shutdown(); // 第 19 章：把剩余事件冲出去
  console.log("Session saved. Goodbye!");
  rl.close();
}

// ============================================================
// 命令分发
// ============================================================

/**
 * 分发一条 `/命令`。
 *
 * 返回值：
 *   "exit"      —— 退出 REPL
 *   "run-agent" —— 已往对话里注入内容，立刻跑一轮 Agent 循环
 *   undefined   —— 处理完毕，等下一次输入
 */
async function handleCommand(
  input: string,
  runtime: AgentRuntime,
  config: AgentConfig,
  state: CliState,
): Promise<"exit" | "run-agent" | void> {
  const [cmd, ...rest] = input.split(/\s+/);
  const args = rest.join(" ");

  switch (cmd) {
    case "/help":
    case "/clear":
    case "/compact":
    case "/status":
    case "/new-task":
    case "/exit":
    case "/quit":
      return handleBuiltinCommand(cmd, runtime, config, state);

    case "/remember":
      return handleRemember(rest, runtime, config);

    case "/memories":
      return handleMemories(runtime, config);

    case "/forget":
      return handleForget(rest, runtime, config);

    case "/skills": {
      // 第 16 章：列出所有可用 Skill（用户侧的"菜单"）
      for (const s of runtime.skills.getAll()) {
        console.log(`  /${s.name}  ${s.description} (${s.source})`);
      }
      return;
    }

    default: {
      // 兜底：把 /foo 当成一个 Skill 调用来解析
      // 这就是"合流"——用户 /review 与模型 Skill(review) 走同一逻辑
      const name = cmd!.slice(1); // 去掉开头的 /
      const skill = runtime.skills.get(name);
      if (!skill) {
        console.log(
          `Unknown command: ${cmd}. Type /help for commands, /skills for skills.`,
        );
        return;
      }

      // `/review src/cli.ts` 也是在下达一个任务，任务边界要和普通输入一视同仁。
      // 漏掉这一步的话，这一轮改的文件、跑的命令全记在空任务名下，
      // 而下一条普通消息又会把它们 beginTask 清掉（第 8 章的任务边界失效）。
      if (state.needsNewTask) {
        runtime.sessionMemory.beginTask(input);
        state.needsNewTask = false;
      }

      // 复用与 SkillTool 完全相同的求值与拼装逻辑（activateSkill 是唯一真相源）。
      // 注意注入动作由这里做、而不是由 activateSkill 做：模型侧走 SkillTool，
      // 正文得落进 tool_result 块里；用户侧走这条命令，发生在两轮之间，
      // 追加一条独立的 user 消息才是合法的。
      const instructions = await activateSkill(skill, args);
      runtime.context.addMessage({ role: "user", content: instructions });
      console.log(`[Skill] Activated "${skill.name}". Running...`);
      // 返回特殊标记，让主循环知道：这一轮要跑 Agent Loop（而不是等下一次输入）
      return "run-agent";
    }
  }
}

function handleBuiltinCommand(
  cmd: string,
  runtime: AgentRuntime,
  config: AgentConfig,
  state: CliState,
): "exit" | void {
  const context = runtime.context;

  switch (cmd) {
    case "/help":
      console.log(`
Available commands:
  /help              Show this help message
  /clear             Clear conversation history
  /compact           Manually trigger context compaction
  /status            Show session status, cost and working notes
  /new-task          Start a new task (resets session memory scope)
  /skills            List available skills
  /remember <kind> <text>   Save a project memory (constraint|preference|correction|environment)
  /memories          List project memories for this directory
  /forget <id>       Delete one project memory by id
  /<skill> [args]    Invoke a skill directly
  /exit              Exit the agent
`);
      break;

    case "/clear":
      // 对应 Claude Code: /clear 命令
      // 清空消息但保留系统提示
      context.clearMessages();
      state.needsNewTask = true; // 会话清空了，下一句话就是新任务
      console.log("[Cleared] Conversation history cleared.");
      break;

    case "/compact":
      // 对应 Claude Code: /compact 命令
      console.log("[Compacting...]");
      context.maybeCompact().then((compacted) => {
        if (!compacted) {
          console.log("[Compact] No compaction needed.");
        }
      });
      break;

    case "/new-task":
      state.needsNewTask = true;
      console.log("[Task] Next message starts a new task.");
      break;

    case "/status": {
      const memory = runtime.sessionMemory.snapshot();
      console.log(`
Session status:
  Working directory: ${config.cwd}
  Model: ${config.model}
  Messages: ${context.getMessages().length}
  Estimated tokens: ~${context.getEstimatedTokens()}
  Permission check: ${config.enablePermissionCheck ? "enabled" : "disabled"}
─── Cost ───
${runtime.cost.summary()}
Session memory:
  Task: ${memory.currentTask || "(none)"}
  Phase: ${memory.phase}
  Changed files: ${memory.changedFiles.length}
  Recent commands: ${memory.commands.length}
  Next steps: ${memory.nextSteps.length}
`);
      break;
    }

    case "/exit":
    case "/quit":
      return "exit";
  }
}

/**
 * 第 9 章：`/remember <kind> <text>`。
 *
 * 只有用户主动输入命令才写——不做自动抽取。牺牲一点自动化，换来清晰的
 * 用户意图和可审计性，对长期记忆很值得。
 */
async function handleRemember(
  rest: string[],
  runtime: AgentRuntime,
  config: AgentConfig,
): Promise<void> {
  const [kind, ...words] = rest;
  const allowedKinds = new Set([
    "constraint",
    "preference",
    "correction",
    "environment",
  ]);
  const text = words.join(" ").trim();

  if (!kind || !allowedKinds.has(kind) || !text) {
    console.log(
      "Usage: /remember <constraint|preference|correction|environment> <text>",
    );
    return;
  }

  console.log(`[Memory] Will save: [${kind}] ${JSON.stringify(text)}`);
  try {
    const item = await runtime.memoryStore.append({
      projectRoot: config.cwd,
      kind: kind as ProjectMemoryKind,
      text,
      source: "user",
    });
    console.log(`[Memory] Saved as ${item.id}`);
  } catch (error) {
    console.error(`[Memory] Not saved: ${(error as Error).message}`);
  }
}

/**
 * 第 9 章：列出当前项目的记忆。遗忘的前提是先能看见。
 *
 * 按 selectMemories 的顺序打印，让"你看到的先后"与"注入模型时的优先级"一致——
 * 否则用户照着列表删，很容易删错那条。时间戳也要打，两条同类记忆冲突时
 * 它是唯一能分辨新旧的线索。
 */
async function handleMemories(
  runtime: AgentRuntime,
  config: AgentConfig,
): Promise<void> {
  const items = selectMemories(
    await runtime.memoryStore.listForProject(config.cwd),
    Number.MAX_SAFE_INTEGER, // 列表要全，不是注入时的 top-N
  );
  if (items.length === 0) {
    console.log("[Memory] No memories for this project yet.");
    return;
  }
  for (const item of items) {
    console.log(
      `  ${item.id}  ${item.createdAt}  [${item.kind}] ${item.text}`,
    );
  }
}

/**
 * 第 9 章：按 id 删除一条记忆。只有新增没有删除的系统最后一定自相矛盾。
 *
 * 删除前必须把要删的那句话原样打出来再确认——id 是一串 uuid，粘贴时错一位
 * 就会命中另一条，而删除是原子替换、没有回收站。这里复用第 11 章那套
 * 一次性确认处理器（书稿 9.9 节末尾提到的正是这条复用路径）。
 */
async function handleForget(
  rest: string[],
  runtime: AgentRuntime,
  config: AgentConfig,
): Promise<void> {
  const id = rest[0]?.trim();
  if (!id) {
    console.log("Usage: /forget <id>   (run /memories to see ids)");
    return;
  }

  const items = await runtime.memoryStore.listForProject(config.cwd);
  const target = items.find((item) => item.id === id);
  if (!target) {
    console.log(`[Memory] No memory with id ${id}.`);
    return;
  }

  const behavior = await askUserConfirmation(
    {
      behavior: "ask",
      reason: `删除记忆 [${target.kind}] ${JSON.stringify(target.text)}（${target.createdAt}）`,
    },
    "ForgetMemory",
  );
  if (behavior !== "allow") {
    console.log("[Memory] Kept.");
    return;
  }

  const removed = await runtime.memoryStore.forget(config.cwd, id);
  console.log(
    removed ? `[Memory] Forgot ${id}.` : `[Memory] No memory with id ${id}.`,
  );
}

// ============================================================
// 欢迎信息
// ============================================================

function printWelcome(config: AgentConfig): void {
  console.log(`
╔══════════════════════════════════════╗
║       MiniAgent (full) v1.0.0        ║
║   A minimal AI coding assistant      ║
╚══════════════════════════════════════╝

Model:   ${config.model}
CWD:     ${config.cwd}
Session: ${config.sessionFile ?? "(none)"}

Type your request, or /help for commands.
Press Ctrl+C to interrupt, Ctrl+C again to exit.
`);
}
