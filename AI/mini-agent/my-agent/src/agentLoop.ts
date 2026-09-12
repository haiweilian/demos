// src/agentLoop.ts
// 对应 Claude Code: src/query.ts 的 queryLoop() 函数（第 241-1729 行）

import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam, AgentConfig } from "./types.js";
import type { ToolRegistry } from "./registry.js";
import type { ContextManager } from "./context.js";
import {
  checkCommandPermission,
  checkWritePermission,
  askUserConfirmation,
  type PermissionDecision,
} from "./permissions.js";

/**
 * Agent 循环的返回原因。
 * 对应 Claude Code: Terminal 类型（src/query/transitions.ts）
 */
export type StopReason =
  | "end_turn"        // 模型自然结束
  | "max_turns"       // 达到最大轮次
  | "error"           // 发生错误
  | "aborted"         // 用户中断
  | "permission_denied"; // 权限拒绝

export interface AgentLoopResult {
  reason: StopReason;
  finalResponse?: string;
  turnCount: number;
}

/**
 * 核心 Agent 循环。
 *
 * 这就是整个 Agent 的核心：一个 while(true)。
 * 对应 Claude Code: queryLoop()（src/query.ts 第 241 行起）
 *
 * Claude Code 的 queryLoop 是一个 AsyncGenerator，每一步都 yield
 * StreamEvent 给上层消费者（UI 层）。我们简化为直接打印输出。
 *
 * Claude Code 的循环逻辑（简化版）：
 *   while (true) {
 *     1. 预处理：snip → microcompact → contextCollapse → autoCompact
 *     2. API 调用：callModel() 流式读取
 *     3. 解析响应：提取 tool_use blocks
 *     4. 如果没有 tool_use → 执行 stop hooks → 退出
 *     5. 执行工具：runTools() / StreamingToolExecutor
 *     6. 收集 tool_result → 注入附件
 *     7. 更新状态 → continue
 *   }
 */
export async function runAgentLoop(
  client: Anthropic,
  registry: ToolRegistry,
  context: ContextManager,
  config: AgentConfig,
  onText?: (text: string) => void,
  abortSignal?: AbortSignal,
): Promise<AgentLoopResult> {
  const maxTurns = 30; // 对应 Claude Code: QueryParams.maxTurns
  let turnCount = 0;

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
    //   snipCompact → microcompact → contextCollapse → autoCompact
    // ============================================================
    await context.maybeCompact();

    // ============================================================
    // 阶段 2：调用 API（流式）
    // 对应 Claude Code: query.ts 第 659-863 行
    //   deps.callModel() 包装了 Anthropic SDK 的 messages.create
    // ============================================================
    turnCount++;

    if (turnCount > maxTurns) {
      return { reason: "max_turns", turnCount };
    }

    const { messages, systemPrompt } = context.getContext();

    let response: Anthropic.Message;
    try {
      // 流式调用 API
      const stream = client.messages.stream({
        model: config.model,
        max_tokens: config.maxTokens,
        system: systemPrompt,
        messages,
        tools: registry.toAPIFormat(),
      });

      // 处理流式文本输出
      // 对应 Claude Code 的 StreamEvent yield 机制
      stream.on("text", (text) => {
        if (onText) {
          onText(text);
        }
      });

      response = await stream.finalMessage();
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
        // 对应 Claude Code: src/services/api/withRetry.ts
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
    //   从 assistant message 中提取 tool_use blocks
    // ============================================================

    // 将 assistant 消息添加到上下文
    context.addMessage({
      role: "assistant",
      content: response.content,
    });

    // 提取文本和工具调用
    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );

    const textBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === "text",
    );

    // ============================================================
    // 阶段 4：如果没有工具调用，循环结束
    // 对应 Claude Code: query.ts 第 1062 行
    //   if (!needsFollowUp) { ... return { reason: 'completed' } }
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
    // 阶段 5：执行工具
    // 对应 Claude Code: query.ts 第 1380-1408 行
    //   runTools() 或 StreamingToolExecutor
    //
    // Claude Code 将工具分为两批：
    //   - isConcurrencySafe=true → 并行执行（如读文件、搜索）
    //   - isConcurrencySafe=false → 串行执行（如写文件、命令）
    // 我们简化为串行执行所有工具。
    // ============================================================
    const toolResults: MessageParam[] = [];

    for (const toolUse of toolUseBlocks) {
      const tool = registry.get(toolUse.name);

      if (!tool) {
        // 工具未找到
        // 对应 Claude Code: toolExecution.ts 中的工具查找失败处理
        toolResults.push({
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: `Error: Unknown tool "${toolUse.name}"`,
              is_error: true,
            },
          ],
        });
        continue;
      }

      // 权限检查
      // 对应 Claude Code: toolExecution.ts → canUseTool → checkPermissions
      if (config.enablePermissionCheck && !tool.isReadOnly) {
        const args = toolUse.input as Record<string, unknown>;
        let decision: PermissionDecision = { behavior: "allow", reason: "" };

        if (tool.name === "RunCommand" && args.command) {
          decision = checkCommandPermission(args.command as string, config.permissionMode);
        } else if (tool.name === "WriteFile" && args.file_path) {
          decision = checkWritePermission(args.file_path as string, config.permissionMode);
        }

        // ask 决策 → 交给交互处理器问人（可能阻塞，等用户按键）
        let behavior = decision.behavior;
        if (behavior === "ask") {
          behavior = await askUserConfirmation(decision, tool.name);
        }

        // deny（含用户拒绝）→ 不执行，把拒绝当成 tool_result 回送给模型
        if (behavior === "deny") {
          console.log(`\n[Permission] Denied: ${decision.reason}`);
          toolResults.push({
            role: "user",
            content: [
              {
                type: "tool_result",
                tool_use_id: toolUse.id,
                content: `Permission denied: ${decision.reason}`,
                is_error: true,
              },
            ],
          });
          continue;
        }
      }

      // 打印工具调用信息
      const inputPreview = JSON.stringify(toolUse.input).slice(0, 200);
      console.log(`\n[Tool] ${toolUse.name}(${inputPreview})`);

      // 执行工具
      // 对应 Claude Code: toolExecution.ts → executeTool()
      try {
        const result = await tool.execute(
          toolUse.input as Record<string, unknown>,
          config.cwd,
        );

        // 打印结果摘要
        const preview = result.content.slice(0, 200);
        console.log(
          `[Tool] ${result.isError ? "ERROR" : "OK"}: ${preview}${result.content.length > 200 ? "..." : ""}`,
        );

        toolResults.push({
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: result.content,
              is_error: result.isError,
            },
          ],
        });
      } catch (err) {
        // 工具执行异常
        // 对应 Claude Code: toolExecution.ts 的 catch 块
        const error = err as Error;
        console.error(`[Tool] Exception: ${error.message}`);

        toolResults.push({
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: `Tool execution error: ${error.message}`,
              is_error: true,
            },
          ],
        });
      }
    }

    // ============================================================
    // 阶段 6：将工具结果注入上下文，进入下一轮
    // 对应 Claude Code: query.ts 第 1715-1717 行
    //   messages: [...messagesForQuery, ...assistantMessages, ...toolResults]
    // ============================================================
    context.addMessages(toolResults);

    // 保存会话（每轮工具执行后）
    await context.saveSession(config.cwd);
  }
}

// ============================================================
// 辅助函数
// ============================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
