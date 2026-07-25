// src/types.ts
// 对应 Claude Code: src/Tool.ts（Tool 接口定义）、src/types/message.ts（消息类型）

import Anthropic from "@anthropic-ai/sdk";
import type { PermissionMode } from "./permissions.js";

// ============================================================
// Tool 抽象接口
// ============================================================

/**
 * Tool 的 JSON Schema 输入描述。
 * Claude Code 中这是一个完整的 Zod schema（见 Tool.inputSchema），
 * 我们简化为原生 JSON Schema 对象。
 */
export interface ToolInputSchema {
  type: "object";
  properties: Record<string, {
    type: string;
    description: string;
    enum?: string[];
  }>;
  required: string[];
  /** 附加字段：满足 Anthropic SDK InputSchema 的索引签名要求 */
  [key: string]: unknown;
}

/**
 * 工具执行结果。
 * 对应 Claude Code: ToolResult<T>（src/Tool.ts 第 321-336 行）
 */
export interface ToolResult {
  /** 返回给模型的文本内容 */
  content: string;
  /** 执行是否出错 */
  isError: boolean;
}

/**
 * 工具抽象接口。
 * 对应 Claude Code: Tool 类型（src/Tool.ts 第 362-695 行）
 *
 * Claude Code 的 Tool 类型极其庞大（50+ 个字段），包含了权限检查、
 * UI 渲染、进度回报、分组显示等。我们提取其中最核心的 5 个字段。
 */
export interface Tool {
  /** 工具名称，如 "ReadFile"。对应 Tool.name */
  name: string;

  /** 工具描述，供模型理解何时使用该工具。对应 Tool.description() */
  description: string;

  /**
   * 输入参数的 JSON Schema。
   * Claude Code 用 Zod schema + 运行时转换，我们直接使用 JSON Schema。
   * 对应 Tool.inputSchema
   */
  inputSchema: ToolInputSchema;

  /**
   * 执行工具逻辑。
   * Claude Code 的 Tool.call() 签名是：
   *   call(args, context, canUseTool, parentMessage, onProgress?)
   * 我们简化为只接收参数和工作目录。
   */
  execute(args: Record<string, unknown>, cwd: string): Promise<ToolResult>;

  /**
   * 该工具是否只读（不改变文件系统状态）。
   * 对应 Tool.isReadOnly()
   */
  isReadOnly: boolean;
}

// ============================================================
// 消息类型
// ============================================================

/**
 * 对话中的一条消息。
 * 我们直接复用 Anthropic SDK 的消息类型，加上 tool_result。
 */
export type MessageParam = Anthropic.MessageParam;

/**
 * 完整的对话上下文。
 * 对应 Claude Code 中 ToolUseContext.messages（src/Tool.ts 第 250 行）
 */
export interface ConversationContext {
  messages: MessageParam[];
  systemPrompt: string;
}

// ============================================================
// Agent 配置
// ============================================================

export interface AgentConfig {
  /** 使用的模型 */
  model: string;
  /** 最大 token 数 */
  maxTokens: number;
  /** 工作目录 */
  cwd: string;
  /** 会话文件路径（用于持久化） */
  sessionFile?: string;
  /** 是否启用危险命令检查 */
  enablePermissionCheck: boolean;
  /** 权限模式：default / acceptEdits / plan / bypass */
  permissionMode: PermissionMode;
}

// ============================================================
// 会话持久化
// ============================================================

export interface SessionData {
  messages: MessageParam[];
  createdAt: string;
  lastActiveAt: string;
  cwd: string;
}
