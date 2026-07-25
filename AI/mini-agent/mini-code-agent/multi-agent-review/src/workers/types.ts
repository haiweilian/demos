// src/workers/types.ts
import type Anthropic from '@anthropic-ai/sdk'
import type { MessageBus } from '../communication/messagebus.js'
import type {
  ReviewFinding,
  ReviewResult,
  ReviewTask,
  WorkerType,
} from '../tasks/types.js'
import type { ScannedFile } from '../utils/fileScanner.js'

/**
 * Worker 配置。
 * 对标 Claude Code 源码中 BaseAgentDefinition 的字段：
 * agentType、tools、model、permissionMode、maxTurns。
 */
export interface WorkerConfig {
  type: WorkerType
  /** Claude API 使用的模型 */
  model: string
  /** 最大分析轮次（防止 token 超支） */
  maxTurns: number
  /** 每轮最大输出 token */
  maxTokens: number
  /** Worker 的系统提示词 */
  systemPrompt: string
}

/**
 * Worker 上下文——传递给每个分析方法的运行时信息。
 */
export interface WorkerContext {
  task: ReviewTask
  files: ScannedFile[]
  messageBus: MessageBus
  client: Anthropic
  config: WorkerConfig
}

/**
 * Worker 接口——所有专业 Worker 必须实现。
 * 这与 Claude Code 源码中 BuiltInAgentDefinition 的设计一致：
 * 每种 Agent 有自己的 getSystemPrompt() 和行为约束。
 *
 * 注意 analyze() 只返回 ReviewFinding[]，没有文件写入能力——
 * 用类型系统在编译期就约束 Worker 不能修改文件。
 */
export interface ReviewWorker {
  readonly type: WorkerType

  /**
   * 执行审查任务，返回发现列表。
   */
  analyze(context: WorkerContext): Promise<ReviewFinding[]>
}
