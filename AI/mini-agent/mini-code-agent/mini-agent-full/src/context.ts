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

  /** MicroCompact 清空工具结果后留下的占位符 */
  private static readonly CLEARED = "[Old tool result content cleared]";

  /** 连续压缩失败计数（熔断器状态） */
  private consecutiveFailures = 0;
  private static readonly MAX_FAILURES = 3; // 对应 Claude Code 的熔断阈值

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

  /** 清空对话历史，保留系统提示（/clear 用） */
  clearMessages(): void {
    this.messages = [];
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

    // 熔断器：连续失败到阈值就彻底停手，把控制权交还用户。
    // 对应 Claude Code: MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES = 3
    if (this.consecutiveFailures >= ContextManager.MAX_FAILURES) {
      console.warn(
        `[Context] Auto-compact disabled after ${this.consecutiveFailures} consecutive failures. ` +
        `Use /compact manually or start a new session.`,
      );
      return false; // 不再自动压缩，控制权交还用户
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

      this.consecutiveFailures = 0; // 成功即清零：熔断的是"连续"失败，不是累计失败
      return true;
    } catch (err) {
      console.error("[Context] Compaction failed:", err);
      // 压缩失败时的回退：简单裁剪旧消息
      // 对应 Claude Code 的 consecutiveFailures 追踪
      if (this.messages.length > KEEP_RECENT_MESSAGES * 2) {
        this.messages = this.messages.slice(-KEEP_RECENT_MESSAGES * 2);
      }
      // 回退保证"这一次还能继续"，熔断保证"不会连续白烧"
      this.consecutiveFailures++;
      return false;
    }
  }

  /**
   * 最小版 MicroCompact：保留最近 keep 个 tool_result，其余只清内容不删块。
   *
   * 对应 Claude Code: src/services/compact/microCompact.ts
   * 铁律一：只清内容、不删消息块——`tool_use` 和它的 `tool_result` 仍然成对存在，
   * 只是 `tool_result` 的肚子被掏空了，API 的消息结构不变量因此得以保住。
   *
   * 两处教学简化（正文 7.6 任务三已说明，留给读者自行补齐）：
   *   1. 这里清的是**所有**旧 tool_result，而非只清"读文件 / 跑命令"这类大输出工具的；
   *      要过滤得拿 tool_use_id 反查对应 tool_use 块的 name。
   *   2. 基线 estimateMessagesTokens 漏算了 tool_result 的内容，本方法不改它。
   *
   * @returns 释放的 token 估算
   */
  microCompact(keep = 5): number {
    // 先找出所有 tool_result 块，倒序保留最近 keep 个
    const resultBlocks: { content: unknown }[] = [];
    for (const msg of this.messages) {
      if (Array.isArray(msg.content)) {
        for (const block of msg.content) {
          if ((block as { type?: string }).type === "tool_result") {
            resultBlocks.push(block as { content: unknown });
          }
        }
      }
    }
    // 注意：不能用 getEstimatedTokens() 前后作差来算释放量——基线的
    // estimateMessagesTokens 只统计带 text 的块，tool_result 的 content
    // 根本不计入估算，作差恒为 0。这里直接对被清掉的字符串累计估算。
    let freed = 0;
    // keep = 0 要清空全部：slice(0, -0) 会退化成 slice(0, 0)（-0 不是负数），
    // 一条都清不到，上层会误以为"已经压不动了"而跳过后续该做的压缩。
    const toClear = keep > 0 ? resultBlocks.slice(0, -keep) : resultBlocks;
    for (const b of toClear) {
      if (typeof b.content === "string" && b.content !== ContextManager.CLEARED) {
        freed += estimateTokens(b.content);
        b.content = ContextManager.CLEARED; // 只换内容，消息块本身仍在
      }
    }
    return freed; // 返回释放的 token 估算
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
   *
   * cwd 是可选参数：传了就校验这份会话是否属于当前工作目录。
   * 会话文件默认落在全局路径、被多个项目共用，不校验的话，先在 A 项目聊几轮、
   * 再到 B 项目启动，A 的完整对话会被原样恢复进来，而 system prompt 拼的却是
   * B 的项目记忆与 Skill 菜单——上下文和提示词从第一轮就对不上。
   * 不传 cwd 时保持旧行为（第 6 章给出的 `loadSession()` 调用方式仍然成立）。
   */
  async loadSession(cwd?: string): Promise<boolean> {
    if (!this.sessionFile) return false;

    try {
      const raw = await fs.readFile(this.sessionFile, "utf-8");
      const data: SessionData = JSON.parse(raw);

      // 老格式没有 cwd 字段时按"来源不明"处理，同样拒绝恢复
      const sessionCwd =
        typeof data.cwd === "string" ? path.resolve(data.cwd) : null;
      if (cwd !== undefined && sessionCwd !== path.resolve(cwd)) {
        console.log(
          `[Session] Skipped restore: session belongs to ${data.cwd ?? "(unknown)"}, ` +
          `current cwd is ${cwd}.`,
        );
        return false;
      }

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
