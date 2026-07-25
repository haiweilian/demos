// src/context.ts
// 对应 Claude Code:
//   src/services/compact/compact.ts（压缩逻辑）
//   src/services/compact/autoCompact.ts（自动触发）
//   src/utils/messages.ts（消息工具函数）

import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam, ConversationContext, SessionData } from "./types.js";
import * as fs from "fs/promises";
import * as path from "path";

/**
 * 上下文管理器。
 *
 * Claude Code 的上下文管理是一个复杂的多层系统：
 *
 * 1. autoCompact -- 基于 token 阈值的自动压缩
 * 2. microcompact -- 小粒度的工具结果压缩
 * 3. snipCompact -- 基于历史片段的裁剪
 * 4. reactiveCompact -- 收到 API prompt-too-long 后的反应式压缩
 * 5. contextCollapse -- 上下文折叠（分组压缩）
 *
 * 我们实现最基础的版本：估算 token 数 + 摘要压缩。
 */

/** token 估算：1 个英文 token ≈ 4 字符，中文 ≈ 1.5 字符 */
function estimateTokens(text: string): number {
  // 粗略估算，Claude Code 有专门的 tokenEstimation.ts
  // 使用 API 的 countTokens 做精确计算
  const asciiChars = text.replace(/[^\x00-\x7F]/g, "").length;
  const nonAsciiChars = text.length - asciiChars;
  return Math.ceil(asciiChars / 4 + nonAsciiChars / 1.5);
}

/** 估算消息数组的总 token 数 */
function estimateMessagesTokens(messages: MessageParam[]): number {
  let total = 0;
  for (const msg of messages) {
    if (typeof msg.content === "string") {
      total += estimateTokens(msg.content);
    } else if (Array.isArray(msg.content)) {
      for (const block of msg.content) {
        if ("text" in block && typeof block.text === "string") {
          total += estimateTokens(block.text);
        }
      }
    }
  }
  return total;
}

/** 压缩阈值（token 数） */
const COMPACT_THRESHOLD = 80_000;

/** 压缩后保留的最近消息数 */
const KEEP_RECENT_MESSAGES = 10;

export class ContextManager {
  private messages: MessageParam[] = [];
  private systemPrompt: string;
  private sessionFile: string | undefined;
  private client: Anthropic;

  constructor(
    systemPrompt: string,
    client: Anthropic,
    sessionFile?: string,
  ) {
    this.systemPrompt = systemPrompt;
    this.client = client;
    this.sessionFile = sessionFile;
  }

  /** 获取当前上下文 */
  getContext(): ConversationContext {
    return {
      messages: [...this.messages],
      systemPrompt: this.systemPrompt,
    };
  }

  /** 获取消息列表（只读引用） */
  getMessages(): readonly MessageParam[] {
    return this.messages;
  }

  /** 添加消息 */
  addMessage(message: MessageParam): void {
    this.messages.push(message);
  }

  /** 添加多条消息 */
  addMessages(messages: MessageParam[]): void {
    this.messages.push(...messages);
  }

  /** 获取估算 token 数 */
  getEstimatedTokens(): number {
    return estimateMessagesTokens(this.messages);
  }

  /**
   * 检查是否需要压缩，如果需要则执行。
   *
   * 对应 Claude Code:
   *   autoCompact()（src/services/compact/autoCompact.ts）
   *   compact()    （src/services/compact/compact.ts）
   *
   * Claude Code 的 autoCompact 会在每次 query loop 迭代开始时检查，
   * 如果 token 数超过阈值，就通过一个独立的 fork agent 生成摘要。
   * 摘要后的消息列表替换原消息列表，形成一个"压缩边界"。
   */
  async maybeCompact(): Promise<boolean> {
    const tokenCount = this.getEstimatedTokens();

    if (tokenCount < COMPACT_THRESHOLD) {
      return false;
    }

    console.log(
      `\n[Context] Token count ~${tokenCount} exceeds threshold ${COMPACT_THRESHOLD}. Compacting...`,
    );

    // 分离需要压缩的旧消息和保留的新消息
    const messagesToCompress = this.messages.slice(
      0,
      -KEEP_RECENT_MESSAGES,
    );
    const recentMessages = this.messages.slice(-KEEP_RECENT_MESSAGES);

    if (messagesToCompress.length === 0) {
      return false;
    }

    // 用模型生成摘要
    // 对应 Claude Code: runForkedAgent() 用独立上下文生成摘要
    try {
      const summaryContent = this.buildSummaryContent(messagesToCompress);

      const response = await this.client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system:
          "You are a conversation summarizer. Summarize the conversation history below into a concise but comprehensive summary. " +
          "Focus on: what files were read/modified, what commands were run, what problems were found, what solutions were applied, " +
          "and any important context. Keep technical details like file paths and error messages.",
        messages: [
          {
            role: "user",
            content: `Summarize this conversation:\n\n${summaryContent}`,
          },
        ],
      });

      const summaryText =
        response.content[0]?.type === "text"
          ? response.content[0].text
          : "Summary unavailable.";

      // 用摘要消息替换旧消息
      // 对应 Claude Code: buildPostCompactMessages()
      this.messages = [
        {
          role: "user" as const,
          content: `[Previous conversation summary]\n${summaryText}`,
        },
        {
          role: "assistant" as const,
          content:
            "Understood. I have the context from our previous conversation. How can I help you continue?",
        },
        ...recentMessages,
      ];

      const newTokenCount = this.getEstimatedTokens();
      console.log(
        `[Context] Compacted: ~${tokenCount} → ~${newTokenCount} tokens`,
      );

      return true;
    } catch (err) {
      console.error("[Context] Compaction failed:", err);
      // 压缩失败时的回退：简单裁剪旧消息
      // 对应 Claude Code 的 consecutiveFailures 追踪
      if (this.messages.length > KEEP_RECENT_MESSAGES * 2) {
        this.messages = this.messages.slice(-KEEP_RECENT_MESSAGES * 2);
      }
      return false;
    }
  }

  /**
   * 将消息数组序列化为文本（供摘要用）。
   */
  private buildSummaryContent(messages: MessageParam[]): string {
    const parts: string[] = [];
    for (const msg of messages) {
      const role = msg.role.toUpperCase();
      if (typeof msg.content === "string") {
        parts.push(`[${role}]: ${msg.content}`);
      } else if (Array.isArray(msg.content)) {
        const texts: string[] = [];
        for (const block of msg.content) {
          if ("text" in block && typeof block.text === "string") {
            texts.push(block.text);
          } else if (block.type === "tool_use") {
            const toolBlock = block as { name?: string; input?: unknown };
            texts.push(
              `[Tool call: ${toolBlock.name}(${JSON.stringify(toolBlock.input).slice(0, 200)})]`,
            );
          } else if (block.type === "tool_result") {
            const resultBlock = block as { content?: string | unknown };
            const content =
              typeof resultBlock.content === "string"
                ? resultBlock.content.slice(0, 500)
                : JSON.stringify(resultBlock.content).slice(0, 500);
            texts.push(`[Tool result: ${content}]`);
          }
        }
        parts.push(`[${role}]: ${texts.join("\n")}`);
      }
    }
    return parts.join("\n\n");
  }

  // ============================================================
  // 会话持久化
  // ============================================================

  /**
   * 保存会话到文件。
   * 对应 Claude Code: src/utils/sessionStorage.ts
   */
  async saveSession(cwd: string): Promise<void> {
    if (!this.sessionFile) return;

    const data: SessionData = {
      messages: this.messages,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      cwd,
    };

    const dir = path.dirname(this.sessionFile);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      this.sessionFile,
      JSON.stringify(data, null, 2),
      "utf-8",
    );
  }

  /**
   * 从文件恢复会话。
   * 对应 Claude Code: 会话恢复逻辑（--resume 参数）
   */
  async loadSession(): Promise<boolean> {
    if (!this.sessionFile) return false;

    try {
      const raw = await fs.readFile(this.sessionFile, "utf-8");
      const data: SessionData = JSON.parse(raw);
      this.messages = data.messages;
      console.log(
        `[Session] Restored ${this.messages.length} messages from ${this.sessionFile}`,
      );
      return true;
    } catch {
      return false;
    }
  }
}
