// src/workers/styleWorker.ts
import type { ReviewFinding } from '../tasks/types.js'
import { extractFunctions, extractImports } from '../utils/codeParser.js'
import type { ScannedFile } from '../utils/fileScanner.js'
import type { ReviewWorker, WorkerContext } from './types.js'

/**
 * Style Worker——专注于代码风格和可维护性。
 * 不是替代 ESLint/Prettier，而是关注更高层次的问题：
 * 函数过长、参数过多、命名不一致、注释质量、代码组织问题。
 */
export class StyleWorker implements ReviewWorker {
  readonly type = 'style' as const

  async analyze(context: WorkerContext): Promise<ReviewFinding[]> {
    const { task, files, messageBus, client, config } = context
    const findings: ReviewFinding[] = []
    let filesCompleted = 0

    for (const file of files) {
      const fileFindings = [
        ...this.checkFunctionMetrics(file),
        ...this.checkNamingConventions(file),
        ...this.checkCodeOrganization(file),
        ...this.checkCommentQuality(file),
        ...this.checkErrorHandling(file),
      ]
      findings.push(...fileFindings)

      filesCompleted++
      if (filesCompleted % 20 === 0) {
        messageBus.send({
          type: 'task_progress',
          from: 'style',
          to: 'coordinator',
          taskId: task.id,
          progress: `Style analysis: ${filesCompleted}/${files.length} files`,
          filesCompleted,
          filesTotal: files.length,
        })
      }
    }

    return findings
  }

  /**
   * 检查函数级别的指标。
   */
  private checkFunctionMetrics(file: ScannedFile): ReviewFinding[] {
    const findings: ReviewFinding[] = []
    const functions = extractFunctions(file.content)

    for (const func of functions) {
      // 函数过长
      if (func.body.split('\n').length > 50) {
        findings.push({
          category: 'Long Function',
          severity: 'medium',
          file: file.relativePath,
          line: func.line,
          description: `Function "${func.name}" is ${func.body.split('\n').length} lines long`,
          suggestion: 'Extract smaller helper functions for better readability',
        })
      }

      // 参数过多
      if (func.params.length > 5) {
        findings.push({
          category: 'Too Many Parameters',
          severity: 'medium',
          file: file.relativePath,
          line: func.line,
          description: `Function "${func.name}" has ${func.params.length} parameters`,
          suggestion: 'Group related parameters into an options object',
        })
      }

      // 函数名不符合 camelCase
      if (func.isExported && !/^[a-z][a-zA-Z0-9]*$/.test(func.name) && !/^[A-Z][a-zA-Z0-9]*$/.test(func.name)) {
        // 排除 React 组件（PascalCase 是正确的）
        if (!file.extension.includes('x') || !/^[A-Z]/.test(func.name)) {
          findings.push({
            category: 'Naming Convention',
            severity: 'low',
            file: file.relativePath,
            line: func.line,
            description: `Exported function "${func.name}" doesn't follow camelCase or PascalCase`,
            suggestion: 'Use camelCase for functions, PascalCase for classes/components',
          })
        }
      }
    }

    return findings
  }

  /**
   * 检查命名约定。
   */
  private checkNamingConventions(file: ScannedFile): ReviewFinding[] {
    const findings: ReviewFinding[] = []
    const lines = file.content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!

      // 单字母变量名（不在循环索引中）
      const singleCharMatch = line.match(
        /(?:const|let|var)\s+([a-z])\s*[:=]/,
      )
      if (singleCharMatch && !['i', 'j', 'k', 'x', 'y', 'z', '_'].includes(singleCharMatch[1]!)) {
        // 检查是否在 for 循环中
        if (!/\bfor\s*\(/.test(line)) {
          findings.push({
            category: 'Poor Variable Name',
            severity: 'low',
            file: file.relativePath,
            line: i + 1,
            description: `Single-letter variable "${singleCharMatch[1]}" — not descriptive`,
            suggestion: 'Use a descriptive name that conveys the variable\'s purpose',
          })
        }
      }

      // Boolean 变量应以 is/has/can/should 开头
      const boolMatch = line.match(
        /(?:const|let)\s+(\w+)\s*(?::\s*boolean)?\s*=\s*(?:true|false)\b/,
      )
      if (boolMatch && !/^(?:is|has|can|should|was|will|did)/.test(boolMatch[1]!)) {
        findings.push({
          category: 'Boolean Naming',
          severity: 'info',
          file: file.relativePath,
          line: i + 1,
          description: `Boolean "${boolMatch[1]}" could be more descriptive with is/has/can prefix`,
          suggestion: `Consider renaming to "is${boolMatch[1]!.charAt(0).toUpperCase() + boolMatch[1]!.slice(1)}"`,
        })
      }
    }

    return findings
  }

  /**
   * 检查代码组织问题。
   */
  private checkCodeOrganization(file: ScannedFile): ReviewFinding[] {
    const findings: ReviewFinding[] = []

    // 文件过长
    if (file.lineCount > 300) {
      findings.push({
        category: 'Long File',
        severity: 'medium',
        file: file.relativePath,
        description: `File is ${file.lineCount} lines — consider splitting`,
        suggestion: 'Extract related functionality into separate modules',
      })
    }

    // 导入过多
    const imports = extractImports(file.content)
    if (imports.length > 15) {
      findings.push({
        category: 'Too Many Imports',
        severity: 'low',
        file: file.relativePath,
        description: `${imports.length} import statements — file may have too many responsibilities`,
        suggestion: 'Consider extracting a layer of abstraction or splitting the module',
      })
    }

    // 混合导入样式
    const hasESM = imports.some(i => !i.isDynamic && file.content.includes('import '))
    const hasCJS = imports.some(i => file.content.includes('require('))
    if (hasESM && hasCJS) {
      findings.push({
        category: 'Mixed Import Styles',
        severity: 'low',
        file: file.relativePath,
        description: 'File mixes ESM import and CommonJS require() styles',
        suggestion: 'Standardize on one import style (preferably ESM)',
      })
    }

    return findings
  }

  /**
   * 检查注释质量。
   */
  private checkCommentQuality(file: ScannedFile): ReviewFinding[] {
    const findings: ReviewFinding[] = []
    const lines = file.content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!.trim()

      // TODO/FIXME/HACK 注释
      const todoMatch = line.match(/\/\/\s*(TODO|FIXME|HACK|XXX|BUG)\b:?\s*(.*)/i)
      if (todoMatch) {
        const tag = todoMatch[1]!.toUpperCase()
        const severity = tag === 'FIXME' || tag === 'BUG' ? 'medium' as const
          : tag === 'HACK' || tag === 'XXX' ? 'low' as const
          : 'info' as const

        findings.push({
          category: `${tag} Comment`,
          severity,
          file: file.relativePath,
          line: i + 1,
          description: `${tag}: ${todoMatch[2] || '(no description)'}`,
          suggestion: tag === 'FIXME' || tag === 'BUG'
            ? 'This indicates a known bug — track in issue tracker'
            : 'Address or remove this comment',
        })
      }

      // 注释掉的代码（连续 3+ 行以 // 开头且看起来像代码）
      if (line.startsWith('//') && /\/\/\s*(?:const|let|var|function|if|for|while|return|import|export)/.test(line)) {
        let commentedCodeLines = 1
        let j = i + 1
        while (j < lines.length && lines[j]!.trim().startsWith('//')) {
          commentedCodeLines++
          j++
        }
        if (commentedCodeLines >= 3) {
          findings.push({
            category: 'Commented-Out Code',
            severity: 'low',
            file: file.relativePath,
            line: i + 1,
            description: `${commentedCodeLines} lines of commented-out code`,
            suggestion: 'Remove dead code — version control preserves history',
          })
          // 跳过已检测的注释行
        }
      }
    }

    return findings
  }

  /**
   * 检查错误处理模式。
   */
  private checkErrorHandling(file: ScannedFile): ReviewFinding[] {
    const findings: ReviewFinding[] = []
    const lines = file.content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!

      // 空 catch 块
      if (/catch\s*\([^)]*\)\s*{\s*}/.test(line)) {
        findings.push({
          category: 'Empty Catch Block',
          severity: 'medium',
          file: file.relativePath,
          line: i + 1,
          description: 'Empty catch block — errors are silently swallowed',
          suggestion: 'At minimum, log the error. Consider re-throwing or handling gracefully.',
        })
      }

      // catch 只有 console.log
      if (/catch\s*\([^)]*\)\s*{/.test(line)) {
        const nextLines = lines.slice(i + 1, i + 4).join(' ')
        if (/console\.log\s*\(/.test(nextLines) && (nextLines.match(/}/g) || []).length >= 1) {
          if (!/throw|return|reject|process\.exit/.test(nextLines)) {
            findings.push({
              category: 'Weak Error Handling',
              severity: 'low',
              file: file.relativePath,
              line: i + 1,
              description: 'Catch block only logs — error is not re-thrown or handled',
              suggestion: 'Consider whether the caller needs to know about this error',
            })
          }
        }
      }
    }

    return findings
  }
}
