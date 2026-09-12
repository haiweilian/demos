// src/workers/performanceWorker.ts
import type { ReviewFinding } from '../tasks/types.js'
import { extractFunctions, extractImports } from '../utils/codeParser.js'
import type { ScannedFile } from '../utils/fileScanner.js'
import type { ReviewWorker, WorkerContext } from './types.js'

/**
 * Performance Worker——专注于性能问题检测。
 * 关注三个层面：
 * 1. 算法复杂度问题（嵌套循环、重复计算）
 * 2. 资源管理问题（内存泄漏、未关闭的连接）
 * 3. 异步性能问题（瀑布式 await、缺少并发）
 */
export class PerformanceWorker implements ReviewWorker {
  readonly type = 'performance' as const

  async analyze(context: WorkerContext): Promise<ReviewFinding[]> {
    const { task, files, messageBus, client, config } = context
    const findings: ReviewFinding[] = []
    let filesCompleted = 0

    for (const file of files) {
      const fileFindings = [
        ...this.checkAlgorithmicIssues(file),
        ...this.checkResourceLeaks(file),
        ...this.checkAsyncPatterns(file),
        ...this.checkBundleImpact(file),
      ]
      findings.push(...fileFindings)

      filesCompleted++
      if (filesCompleted % 15 === 0) {
        messageBus.send({
          type: 'task_progress',
          from: 'performance',
          to: 'coordinator',
          taskId: task.id,
          progress: `Performance analysis: ${filesCompleted}/${files.length} files`,
          filesCompleted,
          filesTotal: files.length,
        })
      }
    }

    // 用 Claude 分析需要上下文理解的性能问题
    const complexFiles = files.filter(f =>
      f.lineCount > 100 &&
      (f.extension === '.ts' || f.extension === '.js' || f.extension === '.tsx'),
    ).slice(0, 5)

    if (complexFiles.length > 0) {
      messageBus.send({
        type: 'task_progress',
        from: 'performance',
        to: 'coordinator',
        taskId: task.id,
        progress: `Deep performance analysis on ${complexFiles.length} complex files`,
        filesCompleted,
        filesTotal: files.length,
      })

      const deepFindings = await this.runDeepPerformanceAnalysis(
        complexFiles, client, config,
      )
      findings.push(...deepFindings)
    }

    return findings
  }

  /**
   * 检测算法复杂度问题。
   */
  private checkAlgorithmicIssues(file: ScannedFile): ReviewFinding[] {
    const findings: ReviewFinding[] = []
    const lines = file.content.split('\n')

    // 嵌套循环检测
    let loopDepth = 0
    let outerLoopLine = -1

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      if (/\b(?:for|while)\s*\(/.test(line)) {
        loopDepth++
        if (loopDepth === 1) outerLoopLine = i + 1
        if (loopDepth >= 3) {
          findings.push({
            category: 'Deeply Nested Loop',
            severity: 'high',
            file: file.relativePath,
            line: i + 1,
            description: `${loopDepth}-level nested loop — O(n^${loopDepth}) complexity`,
            suggestion: 'Refactor using Map/Set lookups, early exits, or algorithm optimization',
          })
        } else if (loopDepth === 2) {
          findings.push({
            category: 'Nested Loop',
            severity: 'medium',
            file: file.relativePath,
            line: i + 1,
            description: 'Nested loop detected — potential O(n^2) complexity',
            suggestion: 'Consider using a Map/Set for O(1) lookups if processing large datasets',
          })
        }
      }
      // 简化的花括号追踪：遇到循环结束恢复 depth
      if (line.includes('}') && loopDepth > 0) {
        const closeBraces = (line.match(/}/g) || []).length
        const openBraces = (line.match(/{/g) || []).length
        if (closeBraces > openBraces) {
          loopDepth = Math.max(0, loopDepth - (closeBraces - openBraces))
        }
      }
    }

    // 数组方法链检测（.filter().map().filter() 等）
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      const chainMatch = line.match(
        /\.(filter|map|reduce|find|some|every|forEach)\s*\([^)]*\)\s*\.(filter|map|reduce|find|some|every|forEach)/,
      )
      if (chainMatch) {
        // 检查是否在大数据集上
        if (line.length > 80) { // 长链更可能有性能影响
          findings.push({
            category: 'Chained Array Operations',
            severity: 'low',
            file: file.relativePath,
            line: i + 1,
            description: `Chained ${chainMatch[1]}().${chainMatch[2]}() — multiple array traversals`,
            suggestion: 'Consider combining into a single reduce() or for loop for large arrays',
          })
        }
      }
    }

    // 正则表达式在循环内编译
    const functions = extractFunctions(file.content)
    for (const func of functions) {
      const funcLines = func.body.split('\n')
      let inLoop = false
      for (let i = 0; i < funcLines.length; i++) {
        if (/\b(?:for|while)\s*\(/.test(funcLines[i]!)) inLoop = true
        if (inLoop && /new RegExp\(/.test(funcLines[i]!)) {
          findings.push({
            category: 'Regex in Loop',
            severity: 'medium',
            file: file.relativePath,
            line: func.line + i,
            description: 'RegExp constructor called inside loop — compiled on every iteration',
            suggestion: 'Move regex compilation outside the loop',
          })
        }
      }
    }

    return findings
  }

  /**
   * 检测资源泄漏问题。
   */
  private checkResourceLeaks(file: ScannedFile): ReviewFinding[] {
    const findings: ReviewFinding[] = []
    const lines = file.content.split('\n')

    // 事件监听器泄漏
    let addListenerCount = 0
    let removeListenerCount = 0
    for (const line of lines) {
      if (/\.(?:addEventListener|on)\s*\(/.test(line)) addListenerCount++
      if (/\.(?:removeEventListener|off|removeListener)\s*\(/.test(line)) removeListenerCount++
    }

    if (addListenerCount > 0 && removeListenerCount === 0 && addListenerCount >= 3) {
      findings.push({
        category: 'Event Listener Leak',
        severity: 'medium',
        file: file.relativePath,
        description: `${addListenerCount} event listeners added, none removed — potential memory leak`,
        suggestion: 'Add cleanup in componentWillUnmount, useEffect cleanup, or close handler',
      })
    }

    // setInterval 没有清理
    for (let i = 0; i < lines.length; i++) {
      if (/setInterval\s*\(/.test(lines[i]!)) {
        // 检查附近是否有对应的 clearInterval
        const nearby = lines.slice(Math.max(0, i - 20), Math.min(lines.length, i + 20)).join('\n')
        if (!nearby.includes('clearInterval')) {
          findings.push({
            category: 'Uncleaned Interval',
            severity: 'medium',
            file: file.relativePath,
            line: i + 1,
            description: 'setInterval without corresponding clearInterval',
            suggestion: 'Store the interval ID and clear it when no longer needed',
          })
        }
      }
    }

    // 流未关闭
    for (let i = 0; i < lines.length; i++) {
      if (/createReadStream|createWriteStream/.test(lines[i]!)) {
        const nearby = lines.slice(i, Math.min(lines.length, i + 30)).join('\n')
        if (!nearby.includes('.close()') && !nearby.includes('.destroy()') && !nearby.includes('pipeline')) {
          findings.push({
            category: 'Unclosed Stream',
            severity: 'medium',
            file: file.relativePath,
            line: i + 1,
            description: 'Stream created without explicit close/destroy — may leak file descriptors',
            suggestion: 'Use pipeline(), stream.destroy(), or try-finally with .close()',
          })
        }
      }
    }

    return findings
  }

  /**
   * 检测异步模式问题。
   */
  private checkAsyncPatterns(file: ScannedFile): ReviewFinding[] {
    const findings: ReviewFinding[] = []
    const functions = extractFunctions(file.content)

    for (const func of functions) {
      if (!func.isAsync) continue
      const funcLines = func.body.split('\n')

      // 瀑布式 await 检测：连续多个 await 且它们之间没有数据依赖
      let consecutiveAwaits = 0
      let awaitStartLine = -1

      for (let i = 0; i < funcLines.length; i++) {
        if (/\bawait\b/.test(funcLines[i]!)) {
          if (consecutiveAwaits === 0) awaitStartLine = i
          consecutiveAwaits++
        } else if (funcLines[i]!.trim() !== '' && !/^\s*\/\//.test(funcLines[i]!)) {
          if (consecutiveAwaits >= 3) {
            findings.push({
              category: 'Sequential Awaits',
              severity: 'medium',
              file: file.relativePath,
              line: func.line + awaitStartLine,
              description: `${consecutiveAwaits} sequential await statements — may run in parallel`,
              suggestion: 'Use Promise.all() for independent async operations',
            })
          }
          consecutiveAwaits = 0
        }
      }

      // await in loop
      let inLoop = false
      for (let i = 0; i < funcLines.length; i++) {
        const line = funcLines[i]!
        if (/\b(?:for|while)\s*\(/.test(line) || /\.forEach\s*\(/.test(line)) {
          inLoop = true
        }
        if (inLoop && /\bawait\b/.test(line)) {
          findings.push({
            category: 'Await in Loop',
            severity: 'high',
            file: file.relativePath,
            line: func.line + i,
            description: 'await inside loop — sequential execution of async operations',
            suggestion: 'Collect promises and use Promise.all(), or use a batching library like p-map',
          })
          inLoop = false // 只报告一次
        }
        if (line.includes('}')) inLoop = false
      }
    }

    return findings
  }

  /**
   * 检测可能影响打包体积的问题。
   */
  private checkBundleImpact(file: ScannedFile): ReviewFinding[] {
    const findings: ReviewFinding[] = []
    const imports = extractImports(file.content)

    // 大型库的全量导入
    const heavyLibraries: Record<string, string> = {
      'lodash': 'Use lodash-es or individual imports (lodash/map)',
      'moment': 'Use dayjs or date-fns (moment is 300KB+ minified)',
      'rxjs': 'Use individual imports (rxjs/operators)',
      'aws-sdk': 'Use @aws-sdk/* v3 modular packages',
    }

    for (const imp of imports) {
      if (heavyLibraries[imp.source] && imp.isDefault) {
        findings.push({
          category: 'Heavy Import',
          severity: 'low',
          file: file.relativePath,
          line: imp.line,
          description: `Full import of "${imp.source}" — adds significant bundle size`,
          suggestion: heavyLibraries[imp.source],
        })
      }
    }

    return findings
  }

  /**
   * 用 Claude 进行深度性能分析。
   */
  private async runDeepPerformanceAnalysis(
    files: ScannedFile[],
    client: InstanceType<typeof import('@anthropic-ai/sdk').default>,
    config: { model: string; maxTokens: number; systemPrompt: string },
  ): Promise<ReviewFinding[]> {
    const fileContents = files
      .map(f => `--- ${f.relativePath} ---\n${f.content}`)
      .join('\n\n')
      .slice(0, 30_000)

    try {
      const response = await client.messages.create({
        model: config.model,
        max_tokens: config.maxTokens,
        system: `You are a performance engineering expert. Analyze code for performance issues.
Return ONLY a JSON array of findings. Each finding: {"category":"...","severity":"high|medium|low","file":"...","line":<n>,"description":"...","suggestion":"..."}
Focus on: N+1 queries, unnecessary re-renders, missing memoization, inefficient algorithms, memory leaks.
Return [] if no issues found.`,
        messages: [{
          role: 'user',
          content: `Analyze these files for performance issues:\n\n${fileContents}`,
        }],
      })

      const text = response.content
        .filter(b => b.type === 'text')
        .map(b => (b as { type: 'text'; text: string }).text)
        .join('')

      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) return []

      const parsed = JSON.parse(jsonMatch[0]) as ReviewFinding[]
      return Array.isArray(parsed) ? parsed.filter(f => f.category && f.description) : []
    } catch {
      return []
    }
  }
}
