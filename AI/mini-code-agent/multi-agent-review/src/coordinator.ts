// src/coordinator.ts
import Anthropic from '@anthropic-ai/sdk'
import { MessageBus } from './communication/messagebus.js'
import { ResultAggregator } from './aggregator/resultAggregator.js'
import { TaskManager } from './tasks/taskManager.js'
import type {
  AggregatedReport,
  ReviewResult,
  WorkerType,
} from './tasks/types.js'
import { SecurityWorker } from './workers/securityWorker.js'
import { PerformanceWorker } from './workers/performanceWorker.js'
import { StyleWorker } from './workers/styleWorker.js'
import type { ReviewWorker, WorkerConfig } from './workers/types.js'
import { scanProject, type ScannedFile } from './utils/fileScanner.js'

/**
 * Coordinator——多代理审查系统的核心编排器。
 * 直接对标 Claude Code 源码中 coordinatorMode.ts 的设计：
 * - "You are a coordinator. Your job is to direct workers."
 * - "Launch independent workers concurrently whenever possible."
 * - "Synthesize results and communicate with the user."
 *
 * 三阶段工作流：Research（扫描）→ Dispatch（并行派遣）→ Synthesis（聚合）。
 */
export class Coordinator {
  private client: Anthropic
  private messageBus: MessageBus
  private taskManager: TaskManager
  private aggregator: ResultAggregator
  private workers: Map<WorkerType, ReviewWorker>
  private workerConfigs: Map<WorkerType, WorkerConfig>

  constructor(
    apiKey: string,
    options: {
      model?: string
      maxTokensPerWorker?: number
    } = {},
  ) {
    this.client = new Anthropic({ apiKey })
    this.messageBus = new MessageBus()
    this.taskManager = new TaskManager(this.messageBus)
    this.aggregator = new ResultAggregator()

    const model = options.model ?? 'claude-sonnet-4-20250514'
    const maxTokens = options.maxTokensPerWorker ?? 4096

    // ━━━━ Worker 配置 ━━━━
    // 对标 Claude Code 中 builtInAgents.ts 的角色定义：
    // 每个 Worker 有独立的系统提示词和能力约束。
    this.workerConfigs = new Map<WorkerType, WorkerConfig>([
      [
        'security',
        {
          type: 'security',
          model,
          maxTurns: 3,
          maxTokens,
          systemPrompt: `You are a security review specialist. Your job is to find vulnerabilities, not confirm code is safe. Focus on: injection attacks, authentication flaws, data exposure, cryptographic misuse, and path traversal. Return findings as JSON arrays.`,
        },
      ],
      [
        'performance',
        {
          type: 'performance',
          model,
          maxTurns: 3,
          maxTokens,
          systemPrompt: `You are a performance engineering specialist. Identify: N+1 queries, unnecessary re-renders, missing memoization, inefficient algorithms, memory leaks, bundle size issues. Return findings as JSON arrays.`,
        },
      ],
      [
        'style',
        {
          type: 'style',
          model,
          maxTurns: 2,
          maxTokens,
          systemPrompt: `You are a code quality specialist. Focus on: naming conventions, function complexity, code organization, error handling patterns, dead code, and documentation quality. Return findings as JSON arrays.`,
        },
      ],
    ])

    // ━━━━ Worker 实例 ━━━━
    this.workers = new Map<WorkerType, ReviewWorker>([
      ['security', new SecurityWorker()],
      ['performance', new PerformanceWorker()],
      ['style', new StyleWorker()],
    ])
  }

  /**
   * 执行完整的多代理代码审查。
   * 三阶段工作流：Research → Dispatch → Synthesis。
   */
  async review(projectPath: string): Promise<AggregatedReport> {
    const overallStart = Date.now()

    console.log('\n  Starting multi-agent code review...')
    console.log(`  Project: ${projectPath}`)
    console.log('')

    // ━━━━ 阶段 1：Research（文件扫描） ━━━━
    console.log('  [1/3] Scanning project files...')
    const files = await scanProject(projectPath)
    console.log(`  Found ${files.length} source files to analyze`)
    console.log('')

    if (files.length === 0) {
      throw new Error('No analyzable source files found in the project')
    }

    // ━━━━ 阶段 2：Dispatch（并行派遣 Worker） ━━━━
    // 三个 Worker 分析的维度完全独立（安全、性能、风格），
    // 没有数据依赖，可以安全地并行执行。
    console.log('  [2/3] Dispatching workers...')

    const workerTypes: WorkerType[] = ['security', 'performance', 'style']
    const workerPromises = workerTypes.map(type =>
      this.runWorker(type, files, projectPath),
    )

    // 监听进度更新
    const progressUnsubscribe = this.messageBus.subscribe(
      'coordinator',
      (message) => {
        if (message.type === 'task_progress') {
          console.log(`    [${message.from}] ${message.progress}`)
        }
      },
    )

    // 等待所有 Worker 完成
    const results = await Promise.allSettled(workerPromises)
    progressUnsubscribe()

    // 收集成功的结果
    const successfulResults: ReviewResult[] = []
    for (let i = 0; i < results.length; i++) {
      const result = results[i]!
      if (result.status === 'fulfilled') {
        successfulResults.push(result.value)
        console.log(`    [${workerTypes[i]}] Completed: ${result.value.findings.length} findings`)
      } else {
        console.error(`    [${workerTypes[i]}] Failed: ${result.reason}`)
      }
    }

    console.log('')

    // ━━━━ 阶段 3：Synthesis（结果聚合） ━━━━
    // 聚合器去重、排序、判定——把三个 Worker 的独立发现
    // 融合为一份连贯的报告。
    console.log('  [3/3] Aggregating results...')
    const report = this.aggregator.aggregate(successfulResults, projectPath)

    // 更新总执行时间
    report.executionStats.totalDurationMs = Date.now() - overallStart

    // 清理
    this.messageBus.dispose()

    return report
  }

  /**
   * 运行单个 Worker 的完整生命周期。
   * 对标 Claude Code 源码中 runAgent.ts 的主流程：
   * 1. 创建任务 2. 执行分析 3. 报告结果 4. 处理异常
   */
  private async runWorker(
    type: WorkerType,
    files: ScannedFile[],
    projectPath: string,
  ): Promise<ReviewResult> {
    const worker = this.workers.get(type)
    const config = this.workerConfigs.get(type)
    if (!worker || !config) {
      throw new Error(`Worker not found: ${type}`)
    }

    // 创建任务
    const task = this.taskManager.createTask(
      type,
      files.map(f => f.relativePath),
      projectPath,
      type === 'security' ? 'critical' : 'normal',
    )

    this.taskManager.startTask(task.id)
    const startTime = Date.now()

    try {
      // 执行分析
      const findings = await worker.analyze({
        task,
        files,
        messageBus: this.messageBus,
        client: this.client,
        config,
      })

      const durationMs = Date.now() - startTime

      // 估算 token 使用量（静态分析不消耗 API token）
      const tokensUsed = this.estimateTokenUsage(files, config)

      const result: ReviewResult = {
        workerType: type,
        findings,
        summary: this.generateWorkerSummary(type, findings),
        tokensUsed,
        durationMs,
        filesAnalyzed: files.length,
      }

      // 通知任务完成
      this.taskManager.completeTask(task.id, result)
      this.messageBus.send({
        type: 'task_completed',
        from: type,
        to: 'coordinator',
        taskId: task.id,
        result,
      })

      return result
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      this.taskManager.failTask(task.id, errorMsg)
      this.messageBus.send({
        type: 'task_failed',
        from: type,
        to: 'coordinator',
        taskId: task.id,
        error: errorMsg,
      })
      throw error
    }
  }

  /**
   * 估算 token 使用量。
   */
  private estimateTokenUsage(
    files: ScannedFile[],
    config: WorkerConfig,
  ): number {
    // 粗略估算：每 4 个字符约 1 个 token
    const inputTokens = files.reduce(
      (sum, f) => sum + Math.ceil(f.content.length / 4), 0,
    )
    // 加上系统提示词和输出
    return inputTokens + config.maxTokens + Math.ceil(config.systemPrompt.length / 4)
  }

  /**
   * 生成 Worker 级别的摘要。
   */
  private generateWorkerSummary(
    type: WorkerType,
    findings: import('./tasks/types.js').ReviewFinding[],
  ): string {
    const critical = findings.filter(f => f.severity === 'critical').length
    const high = findings.filter(f => f.severity === 'high').length
    const total = findings.length

    if (total === 0) return `No ${type} issues found`

    const parts = [`Found ${total} ${type} issue${total === 1 ? '' : 's'}`]
    if (critical > 0) parts.push(`${critical} critical`)
    if (high > 0) parts.push(`${high} high severity`)

    return parts.join(', ')
  }
}
