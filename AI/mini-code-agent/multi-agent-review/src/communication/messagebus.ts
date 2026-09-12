// src/communication/messagebus.ts
import { EventEmitter } from 'events'
import type { ReviewResult, ReviewTask, WorkerType } from '../tasks/types.js'

/**
 * 消息类型定义。
 * 对标 Claude Code 源码中 SendMessageTool.ts 的 StructuredMessage——
 * 它用 z.discriminatedUnion 定义结构化消息类型。我们的消息系统
 * 同样用 discriminated union 保证类型安全。
 */
export type AgentMessage =
  | {
      type: 'task_assigned'
      from: 'coordinator'
      to: WorkerType
      task: ReviewTask
    }
  | {
      type: 'task_progress'
      from: WorkerType
      to: 'coordinator'
      taskId: string
      progress: string
      filesCompleted: number
      filesTotal: number
    }
  | {
      type: 'task_completed'
      from: WorkerType
      to: 'coordinator'
      taskId: string
      result: ReviewResult
    }
  | {
      type: 'task_failed'
      from: WorkerType
      to: 'coordinator'
      taskId: string
      error: string
    }
  | {
      type: 'coordinator_directive'
      from: 'coordinator'
      to: WorkerType | 'all'
      directive: 'stop' | 'pause' | 'resume'
      reason?: string
    }

/**
 * 消息总线——代理间的通信中枢。
 *
 * 我们的场景是单进程内多个异步流程，用 EventEmitter 就够。
 * 接口设计与 Claude Code 的 SendMessage 模式对齐，方便日后
 * 迁移到真正的跨进程通信。
 */
export class MessageBus {
  private emitter = new EventEmitter()
  private messageLog: Array<{
    timestamp: number
    message: AgentMessage
  }> = []

  /**
   * 发送消息。消息发给特定接收者（to 字段），同时记录用于调试，分发是异步的。
   */
  send(message: AgentMessage): void {
    this.messageLog.push({
      timestamp: Date.now(),
      message,
    })

    // 广播到特定接收者的频道
    this.emitter.emit(`message:${message.to}`, message)

    // 同时广播到全局频道（用于监控）
    this.emitter.emit('message:*', message)
  }

  /**
   * 订阅发给特定代理的消息。
   */
  subscribe(
    agent: string,
    handler: (message: AgentMessage) => void,
  ): () => void {
    this.emitter.on(`message:${agent}`, handler)
    return () => {
      this.emitter.off(`message:${agent}`, handler)
    }
  }

  /**
   * 等待特定类型的消息。带超时保护。
   */
  waitFor(
    agent: string,
    predicate: (message: AgentMessage) => boolean,
    timeoutMs: number = 120_000,
  ): Promise<AgentMessage> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.emitter.off(`message:${agent}`, handler)
        reject(new Error(
          `Timeout waiting for message to ${agent} after ${timeoutMs}ms`,
        ))
      }, timeoutMs)

      const handler = (message: AgentMessage) => {
        if (predicate(message)) {
          clearTimeout(timer)
          this.emitter.off(`message:${agent}`, handler)
          resolve(message)
        }
      }

      this.emitter.on(`message:${agent}`, handler)
    })
  }

  /**
   * 获取消息日志——用于调试和审计。
   */
  getLog(): Array<{ timestamp: number; message: AgentMessage }> {
    return [...this.messageLog]
  }

  /**
   * 清理所有监听器。
   */
  dispose(): void {
    this.emitter.removeAllListeners()
  }
}
