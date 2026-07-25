// src/tasks/taskManager.ts
import { randomUUID } from 'crypto'
import type { MessageBus } from '../communication/messagebus.js'
import type {
  ReviewResult,
  ReviewTask,
  TaskPriority,
  WorkerType,
} from './types.js'

/**
 * 任务管理器——追踪所有审查任务的生命周期。
 * 对标 Claude Code 源码中 tasks/LocalAgentTask 的功能：
 * 注册任务、追踪进度、处理完成/失败。核心模式：
 * 每个任务有唯一 ID，状态通过消息总线更新。
 */
export class TaskManager {
  private tasks = new Map<string, ReviewTask>()
  private messageBus: MessageBus

  constructor(messageBus: MessageBus) {
    this.messageBus = messageBus
    this.setupMessageHandlers()
  }

  /**
   * 监听来自 Worker 的状态更新消息。
   * 对标 Claude Code 源码中 completeAgentTask() 和 failAgentTask()。
   */
  private setupMessageHandlers(): void {
    this.messageBus.subscribe('coordinator', (message) => {
      switch (message.type) {
        case 'task_completed': {
          const task = this.tasks.get(message.taskId)
          if (task) {
            task.status = 'completed'
            task.completedAt = Date.now()
            task.result = message.result
          }
          break
        }
        case 'task_failed': {
          const task = this.tasks.get(message.taskId)
          if (task) {
            task.status = 'failed'
            task.completedAt = Date.now()
            task.error = message.error
          }
          break
        }
      }
    })
  }

  /**
   * 创建新的审查任务。
   */
  createTask(
    type: WorkerType,
    files: string[],
    projectPath: string,
    priority: TaskPriority = 'normal',
  ): ReviewTask {
    const task: ReviewTask = {
      id: randomUUID().slice(0, 8),
      type,
      status: 'pending',
      priority,
      files,
      projectPath,
      createdAt: Date.now(),
    }
    this.tasks.set(task.id, task)
    return task
  }

  /**
   * 将任务标记为运行中。
   */
  startTask(taskId: string): void {
    const task = this.tasks.get(taskId)
    if (task) {
      task.status = 'running'
    }
  }

  /**
   * 完成任务并记录结果。
   */
  completeTask(taskId: string, result: ReviewResult): void {
    const task = this.tasks.get(taskId)
    if (task) {
      task.status = 'completed'
      task.completedAt = Date.now()
      task.result = result
    }
  }

  /**
   * 标记任务失败。
   */
  failTask(taskId: string, error: string): void {
    const task = this.tasks.get(taskId)
    if (task) {
      task.status = 'failed'
      task.completedAt = Date.now()
      task.error = error
    }
  }

  /**
   * 获取任务。
   */
  getTask(taskId: string): ReviewTask | undefined {
    return this.tasks.get(taskId)
  }

  /**
   * 获取所有已完成的任务。
   */
  getCompletedTasks(): ReviewTask[] {
    return Array.from(this.tasks.values())
      .filter(t => t.status === 'completed')
  }

  /**
   * 获取所有失败的任务。
   */
  getFailedTasks(): ReviewTask[] {
    return Array.from(this.tasks.values())
      .filter(t => t.status === 'failed')
  }

  /**
   * 检查是否所有任务都已终结（完成或失败）。
   */
  allTasksFinished(): boolean {
    return Array.from(this.tasks.values())
      .every(t => t.status === 'completed' || t.status === 'failed')
  }

  /**
   * 获取执行统计。
   */
  getStats(): {
    total: number
    completed: number
    failed: number
    running: number
    pending: number
  } {
    const tasks = Array.from(this.tasks.values())
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      running: tasks.filter(t => t.status === 'running').length,
      pending: tasks.filter(t => t.status === 'pending').length,
    }
  }
}
