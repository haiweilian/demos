// src/tasks/types.ts

/**
 * 任务状态机。
 * 对应 Claude Code 源码 tasks/LocalAgentTask 中的 AgentProgress 类型，
 * 我们简化为四个核心状态。
 */
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed'

/**
 * 任务优先级。Security 发现优先级最高——一个安全漏洞可以否决整个 PR。
 */
export type TaskPriority = 'critical' | 'high' | 'normal' | 'low'

/**
 * Worker 类型。对应 Claude Code 源码中 builtInAgents.ts 的 agentType 字段。
 */
export type WorkerType = 'security' | 'performance' | 'style'

/**
 * 审查任务定义。
 * 设计对标 Claude Code 源码中 AgentTool.tsx 的 call() 参数：
 * prompt、subagent_type、description、model。
 */
export interface ReviewTask {
  id: string
  type: WorkerType
  status: TaskStatus
  priority: TaskPriority
  /** 要审查的文件列表 */
  files: string[]
  /** 项目根目录 */
  projectPath: string
  /** 任务创建时间 */
  createdAt: number
  /** 任务完成时间 */
  completedAt?: number
  /** Worker 返回的审查结果 */
  result?: ReviewResult
  /** 失败原因 */
  error?: string
}

/**
 * 审查发现的严重程度。
 */
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

/**
 * 单个审查发现。
 */
export interface ReviewFinding {
  /** 发现类别（如 "SQL Injection", "Unused Variable"） */
  category: string
  /** 严重程度 */
  severity: Severity
  /** 涉及的文件 */
  file: string
  /** 行号（如果可定位） */
  line?: number
  /** 发现描述 */
  description: string
  /** 建议的修复方案 */
  suggestion?: string
  /** 相关代码片段 */
  codeSnippet?: string
}

/**
 * Worker 返回的审查结果。
 * 对标 Claude Code 源码中 task-notification 的结构：<result>、<summary>、<usage>。
 */
export interface ReviewResult {
  workerType: WorkerType
  findings: ReviewFinding[]
  summary: string
  /** 分析消耗的 tokens */
  tokensUsed: number
  /** 分析耗时（毫秒） */
  durationMs: number
  /** 分析的文件数 */
  filesAnalyzed: number
}

/**
 * 聚合后的最终报告。
 */
export interface AggregatedReport {
  projectPath: string
  timestamp: string
  totalFiles: number
  totalFindings: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  infoCount: number
  workerResults: ReviewResult[]
  topFindings: ReviewFinding[]
  verdict: 'PASS' | 'FAIL' | 'WARN'
  executionStats: {
    totalDurationMs: number
    totalTokens: number
    workersUsed: number
  }
}
