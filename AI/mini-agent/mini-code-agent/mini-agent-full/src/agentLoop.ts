// src/agentLoop.ts
// 对应 Claude Code: src/query.ts 的 queryLoop() 函数（第 241-1729 行）
//
// 这是 mini-agent-full 的循环：在基线（mini-agent/）的串行版之上，合并了
//   第 5 章 —— 按 isReadOnly 分区调度（只读并发、有副作用串行）
//   第 7 章 —— 每次 API 响应后累计成本
//   第 8 章 —— 每轮重建 SessionMemory 提示块 + 工具成功后回写笔记
//   第 12 章 —— 权限检查退居为 PreToolUse 钩子，循环只负责广播
//   第 19 章 —— 工具调用埋点（只记工具名与成败，绝不记参数）
// 循环里已经没有任何权限判断逻辑：拦不拦由钩子说了算。

import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam, AgentConfig } from "./types.js";
import type { ToolRegistry } from "./registry.js";
import type { ContextManager } from "./context.js";
import type { HookBus } from "./hooks/hookBus.js";
import type { SessionMemory } from "./sessionMemory.js";
import type { CostTracker } from "./costTracker.js";
import type { Analytics, SafeMetaValue } from "./analytics.js";

/**
 * Agent 循环的返回原因。
 * 对应 Claude Code: Terminal 类型（src/query/transitions.ts）
 */
export type StopReason =
  | "end_turn"        // 模型自然结束
  | "max_turns"       // 达到最大轮次
  | "error"           // 发生错误
  | "aborted"         // 用户中断
  | "permission_denied"; // 权限拒绝（第 12 章起改由钩子拦截，循环不再直接产出它）

export interface AgentLoopResult {
  reason: StopReason;
  finalResponse?: string;
  turnCount: number;
}

/**
 * 循环运行期需要的协作者。
 *
 * 第 7 / 8 / 12 / 19 章各自要求"给 runAgentLoop 的签名加一个参数"，四章加完就是
 * 六个位置参数。这里收成一个 deps 对象，函数体开头解构出来——这样各章正文里
 * `costTracker.add(...)` / `hookBus.emit(...)` / `sessionMemory.toPromptBlock()` /
 * `analytics.logEvent(...)` 那些代码行仍然一字不变。
 */
export interface AgentLoopDeps {
  /** 第 12 章：生命周期事件总线（权限、审计、上下文注入都挂在它上面） */
  hookBus: HookBus;
  /** 第 8 章：当前会话的工作笔记 */
  sessionMemory: SessionMemory;
  /** 第 7 章：token 分桶与花费累计 */
  costTracker: CostTracker;
  /** 第 19 章：产品分析事件 sink */
  analytics: Analytics;
}

/**
 * 核心 Agent 循环。
 *
 * 这就是整个 Agent 的核心：一个 while(true)。
 * 对应 Claude Code: queryLoop()（src/query.ts 第 241 行起）
 */
export async function runAgentLoop(
  client: Anthropic,
  registry: ToolRegistry,
  context: ContextManager,
  config: AgentConfig,
  deps: AgentLoopDeps,
  onText?: (text: string) => void,
  abortSignal?: AbortSignal,
): Promise<AgentLoopResult> {
  const { hookBus, sessionMemory, costTracker, analytics } = deps;

  const maxTurns = 30; // 对应 Claude Code: QueryParams.maxTurns
  let turnCount = 0;

  // 第 12 章的 SessionStart 广播**不在这里**。正文说"接在循环最开头"，但
  // runAgentLoop 是每条用户消息调用一次的——放在这里会变成"每回合广播一次"，
  // 十轮对话就往历史里塞十份一模一样的 <session-context>。SessionStart 顾名
  // 思义是一次会话一次，所以它挪到了 bootstrap()（见 emitSessionStart）。

  // 对应 Claude Code: query.ts 第 307 行 "while (true)"
  while (true) {
    // ============================================================
    // 阶段 0：检查中断信号
    // ============================================================
    if (abortSignal?.aborted) {
      return { reason: "aborted", turnCount };
    }

    // ============================================================
    // 阶段 1：上下文管理（压缩检查）
    // 对应 Claude Code: query.ts 第 400-470 行
    // ============================================================
    await context.maybeCompact();

    // ============================================================
    // 阶段 2：调用 API（流式）
    // 对应 Claude Code: query.ts 第 659-863 行
    // ============================================================
    turnCount++;

    if (turnCount > maxTurns) {
      return { reason: "max_turns", turnCount };
    }

    const { messages, systemPrompt } = context.getContext();

    // 第 8 章：笔记必须每轮重建。若在 new ContextManager() 时就拼进 systemPrompt，
    // 冻结的只是启动那一刻的空记忆，之后 recordFile() 再多也进不了 prompt。
    const systemPromptWithMemory = [
      systemPrompt,
      sessionMemory.toPromptBlock(),
    ].join("\n\n");

    let response: Anthropic.Message;
    try {
      // 流式调用 API
      const stream = client.messages.stream({
        model: config.model,
        max_tokens: config.maxTokens,
        system: systemPromptWithMemory,
        messages,
        tools: registry.toAPIFormat(),
      });

      // 处理流式文本输出
      stream.on("text", (text) => {
        if (onText) {
          onText(text);
        }
      });

      response = await stream.finalMessage();
      // 第 7 章：锚点必须是 finalMessage() 之后——usage 此刻才是最终值。
      // 放进 stream.on("text") 回调会逐 token 触发，重复累加。
      costTracker.add(response.usage, config.model);
    } catch (err) {
      const error = err as Error;

      // 处理 API 错误
      // 对应 Claude Code: query.ts 第 955-997 行的错误处理
      if (error.message?.includes("prompt is too long")) {
        // prompt-too-long：尝试强制压缩
        console.error("\n[Error] Prompt too long. Attempting emergency compaction...");
        context.addMessage({
          role: "user",
          content: "(Context was too long and has been automatically compressed.)",
        });
        continue;
      }

      if (
        error.message?.includes("rate_limit") ||
        error.message?.includes("overloaded")
      ) {
        // 速率限制：等待后重试
        console.error("\n[Error] Rate limited. Waiting 10s...");
        await sleep(10_000);
        turnCount--; // 不计入轮次
        continue;
      }

      console.error(`\n[Error] API call failed: ${error.message}`);
      return { reason: "error", turnCount };
    }

    // ============================================================
    // 阶段 3：解析响应
    // 对应 Claude Code: query.ts 第 828-845 行
    // ============================================================
    context.addMessage({
      role: "assistant",
      content: response.content,
    });

    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );

    const textBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === "text",
    );

    // ============================================================
    // 阶段 4：如果没有工具调用，循环结束
    // 对应 Claude Code: query.ts 第 1062 行
    // ============================================================
    if (toolUseBlocks.length === 0) {
      const finalText = textBlocks.map((b) => b.text).join("");
      return {
        reason: "end_turn",
        finalResponse: finalText,
        turnCount,
      };
    }

    // ============================================================
    // 阶段 5：分区调度执行（第 5 章）
    // 对应 Claude Code: toolOrchestration.ts → partitionToolCalls()
    // 只读工具并发跑，有副作用的工具串行跑；批与批之间保持模型给出的原顺序。
    // ============================================================

    /** 执行单个工具调用，返回一条 tool_result */
    const runOne = async (
      toolUse: Anthropic.ToolUseBlock,
    ): Promise<MessageParam> => {
      const tool = registry.get(toolUse.name);

      if (!tool) {
        // 工具未找到
        return makeToolResult(
          toolUse.id,
          `Error: Unknown tool "${toolUse.name}"`,
          true,
        );
      }

      // 冻结本次调用快照：检查、展示和执行都只用这一份（第 11 章的不变量）。
      const executionInput = structuredClone(
        toolUse.input as Record<string, unknown>,
      );

      // 第 12 章：执行前广播 PreToolUse。循环不知道"权限"是什么概念——
      // 它只知道"钩子说要拦，那就拦"。权限检查是总线上的一个钩子。
      const pre = await hookBus.emit({
        event: "PreToolUse",
        toolName: toolUse.name,
        toolInput: executionInput,
        isReadOnly: tool.isReadOnly,
      });

      if (pre.blocked) {
        console.log(
          `\n[Hook] Blocked ${toolUse.name}: ${pre.blockReason ?? "(no reason)"}`,
        );
        return makeToolResult(
          toolUse.id,
          `Blocked by hook: ${pre.blockReason ?? "operation not permitted"}`,
          true,
        );
      }

      // 打印工具调用信息
      const inputPreview = JSON.stringify(executionInput).slice(0, 200);
      console.log(`\n[Tool] ${toolUse.name}(${inputPreview})`);

      // 执行工具
      // 对应 Claude Code: toolExecution.ts → executeTool()
      try {
        // 真正执行的必须是刚才检查/展示的同一份输入
        const result = await tool.execute(executionInput, config.cwd);

        // 打印结果摘要
        const preview = result.content.slice(0, 200);
        console.log(
          `[Tool] ${result.isError ? "ERROR" : "OK"}: ${preview}${result.content.length > 200 ? "..." : ""}`,
        );

        // 第 8 章：只有拿到 result 才知道工具是否真的成功，所以回写点在这里。
        if (
          !result.isError &&
          (toolUse.name === "WriteFile" || toolUse.name === "Edit") &&
          typeof executionInput.file_path === "string"
        ) {
          sessionMemory.recordFile(executionInput.file_path);
        }

        if (
          toolUse.name === "RunCommand" &&
          typeof executionInput.command === "string"
        ) {
          sessionMemory.recordCommand(
            executionInput.command,
            !result.isError,
            result.content,
          );
        }

        // 第 19 章：只记工具名和成败，绝不记 input / file_path / command——那些是 PII。
        analytics.logEvent("tool_use", {
          tool_name: toolUse.name as SafeMetaValue,
          is_error: result.isError,
        });

        // 第 12 章：审计、格式化这类"事后"逻辑的挂点
        await hookBus.emit({
          event: "PostToolUse",
          toolName: toolUse.name,
          toolInput: executionInput,
          isError: result.isError,
        });

        return makeToolResult(toolUse.id, result.content, result.isError);
      } catch (err) {
        // 工具执行异常。注意这条路径也要发 PostToolUse 与埋点——审计要的正是
        // "这次调用失败了"，漏掉的话审计流水会缺一块，且失败率统计永远偏低。
        const error = err as Error;
        console.error(`[Tool] Exception: ${error.message}`);

        analytics.logEvent("tool_use", {
          tool_name: toolUse.name as SafeMetaValue,
          is_error: true,
        });

        await hookBus.emit({
          event: "PostToolUse",
          toolName: toolUse.name,
          toolInput: executionInput,
          isError: true,
        });

        return makeToolResult(
          toolUse.id,
          `Tool execution error: ${error.message}`,
          true,
        );
      }
    };

    const toolResults: MessageParam[] = [];
    for (const batch of partition(toolUseBlocks, registry)) {
      if (batch.concurrent) {
        // 并发批：一起跑，结果按原顺序回填
        const results = await Promise.all(batch.blocks.map(runOne));
        toolResults.push(...results);
      } else {
        // 串行批：逐个跑（通常只有一个有副作用的工具）
        for (const block of batch.blocks) {
          toolResults.push(await runOne(block));
        }
      }
    }

    // ============================================================
    // 阶段 6：将工具结果注入上下文，进入下一轮
    // 对应 Claude Code: query.ts 第 1715-1717 行
    // ============================================================
    context.addMessages(toolResults);

    // 保存会话（每轮工具执行后）
    await context.saveSession(config.cwd);
  }
}

// ============================================================
// 辅助函数
// ============================================================

/** 一批工具调用：要么整批并发，要么整批串行 */
interface Batch {
  concurrent: boolean;
  blocks: Anthropic.ToolUseBlock[];
}

/**
 * 把工具调用按 isReadOnly 切成交替的"并发批 / 串行批"（第 5 章）。
 * 复用已有的 isReadOnly 字段——它语义上就等于"是否并发安全"，不另造概念。
 */
function partition(
  blocks: Anthropic.ToolUseBlock[],
  registry: ToolRegistry,
): Batch[] {
  const batches: Batch[] = [];
  for (const block of blocks) {
    const tool = registry.get(block.name);
    // 只读 = 并发安全；找不到工具时保守按不安全处理（fail-closed）
    const concurrent = tool?.isReadOnly === true;
    const last = batches[batches.length - 1];
    if (concurrent && last?.concurrent) {
      last.blocks.push(block); // 并入当前并发批
    } else {
      batches.push({ concurrent, blocks: [block] }); // 开新批
    }
  }
  return batches;
}

/**
 * 把 tool_use_id + content + is_error 包成一条 tool_result 消息，
 * 避免每个分支手写一遍相同结构。
 */
function makeToolResult(
  toolUseId: string,
  content: string,
  isError: boolean,
): MessageParam {
  return {
    role: "user",
    content: [
      { type: "tool_result", tool_use_id: toolUseId, content, is_error: isError },
    ],
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
