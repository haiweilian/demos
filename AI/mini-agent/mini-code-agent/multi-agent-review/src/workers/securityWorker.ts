// src/workers/securityWorker.ts
import type Anthropic from '@anthropic-ai/sdk'
import type {
  ReviewFinding,
  Severity,
} from '../tasks/types.js'
import type { ScannedFile } from '../utils/fileScanner.js'
import type { ReviewWorker, WorkerConfig, WorkerContext } from './types.js'

/**
 * Security Worker——专注于安全漏洞检测。
 * 对标 Claude Code 内置 Verification Agent 的对抗性理念：
 * "Your job is not to confirm the implementation works — it's to try to break it."
 * 它主动寻找漏洞，而不是确认代码安全。
 */
export class SecurityWorker implements ReviewWorker {
  readonly type = 'security' as const

  /**
   * 执行安全审查。三阶段分析：
   * 1. 静态模式匹配（快速，覆盖面广）
   * 2. 语义分析（用 Claude 理解上下文）
   * 3. 依赖安全检查（检查 package 清单）
   */
  async analyze(context: WorkerContext): Promise<ReviewFinding[]> {
    const { task, files, messageBus, client, config } = context
    const findings: ReviewFinding[] = []
    let filesCompleted = 0

    // 阶段 1：静态模式匹配
    for (const file of files) {
      const staticFindings = this.runStaticChecks(file)
      findings.push(...staticFindings)

      filesCompleted++
      if (filesCompleted % 10 === 0) {
        messageBus.send({
          type: 'task_progress',
          from: 'security',
          to: 'coordinator',
          taskId: task.id,
          progress: `Static analysis: ${filesCompleted}/${files.length} files`,
          filesCompleted,
          filesTotal: files.length,
        })
      }
    }

    // 阶段 2：用 Claude 进行语义分析（对最值得关注的文件）
    const priorityFiles = this.prioritizeFilesForDeepAnalysis(files, findings)
    if (priorityFiles.length > 0) {
      messageBus.send({
        type: 'task_progress',
        from: 'security',
        to: 'coordinator',
        taskId: task.id,
        progress: `Deep analysis: ${priorityFiles.length} priority files`,
        filesCompleted,
        filesTotal: files.length,
      })

      const deepFindings = await this.runDeepAnalysis(
        priorityFiles, client, config,
      )
      findings.push(...deepFindings)
    }

    return findings
  }

  /**
   * 静态安全检查——通过模式匹配快速发现常见漏洞。
   */
  private runStaticChecks(file: ScannedFile): ReviewFinding[] {
    const findings: ReviewFinding[] = []
    const lines = file.content.split('\n')

    // ---- 硬编码凭证检测 ----
    const credentialPatterns = [
      { pattern: /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]+['"]/i, category: 'Hardcoded Password' },
      { pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"][^'"]+['"]/i, category: 'Hardcoded API Key' },
      { pattern: /(?:secret|token)\s*[:=]\s*['"][A-Za-z0-9+/=]{16,}['"]/i, category: 'Hardcoded Secret' },
      { pattern: /(?:aws_access_key_id|aws_secret_access_key)\s*[:=]\s*['"][^'"]+['"]/i, category: 'AWS Credentials' },
      { pattern: /-----BEGIN (?:RSA|DSA|EC|OPENSSH) PRIVATE KEY-----/i, category: 'Private Key' },
    ]

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      // 跳过注释、测试文件和环境变量模板
      if (line.trim().startsWith('//') || line.trim().startsWith('#')) continue
      if (file.relativePath.includes('.test.') || file.relativePath.includes('.spec.')) continue
      if (file.relativePath.includes('.example') || file.relativePath.includes('.template')) continue

      for (const { pattern, category } of credentialPatterns) {
        if (pattern.test(line)) {
          findings.push({
            category,
            severity: 'critical',
            file: file.relativePath,
            line: i + 1,
            description: `Potential hardcoded credential detected`,
            suggestion: 'Move to environment variables or a secrets manager',
            codeSnippet: line.trim().slice(0, 100),
          })
        }
      }
    }

    // ---- SQL 注入检测 ----
    const sqlInjectionPatterns = [
      /`\s*(?:SELECT|INSERT|UPDATE|DELETE|DROP|CREATE)\s[^`]*\$\{/i,
      /['"]?\s*\+\s*(?:req\.|request\.|params\.|query\.|body\.)/i,
      /(?:query|execute)\s*\(\s*[`'"].*\$\{/i,
    ]

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      for (const pattern of sqlInjectionPatterns) {
        if (pattern.test(line)) {
          findings.push({
            category: 'SQL Injection',
            severity: 'critical',
            file: file.relativePath,
            line: i + 1,
            description: 'Potential SQL injection — user input may be interpolated into query',
            suggestion: 'Use parameterized queries or an ORM',
            codeSnippet: line.trim().slice(0, 120),
          })
        }
      }
    }

    // ---- 命令注入检测 ----
    const commandInjectionPatterns = [
      /exec\s*\(\s*[`'"].*\$\{/,
      /execSync\s*\(\s*[`'"].*\$\{/,
      /child_process.*exec.*\+/,
      /spawn\s*\(\s*[^,]+,\s*\[.*\$\{/,
    ]

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      for (const pattern of commandInjectionPatterns) {
        if (pattern.test(line)) {
          findings.push({
            category: 'Command Injection',
            severity: 'critical',
            file: file.relativePath,
            line: i + 1,
            description: 'Potential command injection — user input in shell command',
            suggestion: 'Use execFile() with argument array instead of exec() with string interpolation',
            codeSnippet: line.trim().slice(0, 120),
          })
        }
      }
    }

    // ---- 不安全的反序列化 ----
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      if (/eval\s*\(/.test(line) && !line.trim().startsWith('//')) {
        findings.push({
          category: 'Unsafe Eval',
          severity: 'high',
          file: file.relativePath,
          line: i + 1,
          description: 'Use of eval() — may execute arbitrary code',
          suggestion: 'Replace with JSON.parse(), Function constructor, or a sandboxed evaluator',
          codeSnippet: line.trim().slice(0, 100),
        })
      }
    }

    // ---- 路径遍历 ----
    const pathTraversalPatterns = [
      /(?:readFile|writeFile|createReadStream)\s*\(\s*(?:req|request|params|query)/,
      /path\.(?:join|resolve)\s*\([^)]*(?:req|request|params|query)/,
    ]

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      for (const pattern of pathTraversalPatterns) {
        if (pattern.test(line)) {
          findings.push({
            category: 'Path Traversal',
            severity: 'high',
            file: file.relativePath,
            line: i + 1,
            description: 'User input used in file path — potential directory traversal',
            suggestion: 'Validate and sanitize file paths; use path.normalize() and check prefix',
            codeSnippet: line.trim().slice(0, 120),
          })
        }
      }
    }

    // ---- CORS 配置问题 ----
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      if (/origin:\s*['"]?\*['"]?/.test(line) || /Access-Control-Allow-Origin.*\*/.test(line)) {
        findings.push({
          category: 'CORS Misconfiguration',
          severity: 'medium',
          file: file.relativePath,
          line: i + 1,
          description: 'Wildcard CORS origin — allows requests from any domain',
          suggestion: 'Specify allowed origins explicitly',
          codeSnippet: line.trim().slice(0, 100),
        })
      }
    }

    return findings
  }

  /**
   * 选择需要深度分析的文件。
   * 优先级：已有发现的文件 > 包含敏感操作的文件 > 入口文件。
   */
  private prioritizeFilesForDeepAnalysis(
    files: ScannedFile[],
    existingFindings: ReviewFinding[],
  ): ScannedFile[] {
    const filesWithFindings = new Set(existingFindings.map(f => f.file))

    const scored = files.map(file => {
      let score = 0
      if (filesWithFindings.has(file.relativePath)) score += 10

      // 包含认证/授权逻辑的文件
      if (/auth|login|session|token|credential|password/i.test(file.relativePath)) score += 8
      if (/middleware|interceptor|guard|policy/i.test(file.relativePath)) score += 5

      // 处理外部输入的文件
      if (/route|controller|handler|endpoint|api/i.test(file.relativePath)) score += 6

      // 数据库操作
      if (/model|schema|migration|query|repository/i.test(file.relativePath)) score += 4

      return { file, score }
    })

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // 最多深度分析 5 个文件
      .filter(s => s.score > 0)
      .map(s => s.file)
  }

  /**
   * 用 Claude 进行深度语义分析。
   * 让 Claude 理解代码的业务逻辑和安全含义，而不仅是模式匹配。
   */
  private async runDeepAnalysis(
    files: ScannedFile[],
    client: Anthropic,
    config: WorkerConfig,
  ): Promise<ReviewFinding[]> {
    const findings: ReviewFinding[] = []

    // 将文件内容组装成分析请求
    const fileContents = files
      .map(f => `--- ${f.relativePath} ---\n${f.content}`)
      .join('\n\n')

    // 控制输入大小：如果总内容过大，截断
    const maxContentSize = 30_000 // 约 7500 tokens
    const truncatedContents = fileContents.length > maxContentSize
      ? fileContents.slice(0, maxContentSize) + '\n\n[Content truncated for analysis]'
      : fileContents

    try {
      const response = await client.messages.create({
        model: config.model,
        max_tokens: config.maxTokens,
        system: config.systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze the following code files for security vulnerabilities.
Focus on:
1. Authentication/authorization flaws
2. Input validation gaps
3. Data exposure risks
4. Race conditions in security-critical paths
5. Cryptographic misuse

For each finding, respond with a JSON array of objects:
[{"category": "...", "severity": "critical|high|medium|low", "file": "...", "line": <number>, "description": "...", "suggestion": "..."}]

If no issues found, respond with an empty array: []

Code to analyze:
${truncatedContents}`,
              },
            ],
          },
        ],
      })

      // 从响应中提取结构化发现
      const textContent = response.content
        .filter(block => block.type === 'text')
        .map(block => (block as { type: 'text'; text: string }).text)
        .join('')

      const parsed = this.parseDeepAnalysisResponse(textContent)
      findings.push(...parsed)
    } catch (error) {
      // API 调用失败不应该中断整个审查
      console.error(`[SecurityWorker] Deep analysis failed: ${error}`)
    }

    return findings
  }

  /**
   * 解析 Claude 的深度分析响应。
   */
  private parseDeepAnalysisResponse(response: string): ReviewFinding[] {
    try {
      // 尝试从响应中提取 JSON 数组
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (!jsonMatch) return []

      const parsed = JSON.parse(jsonMatch[0]) as Array<{
        category?: string
        severity?: string
        file?: string
        line?: number
        description?: string
        suggestion?: string
      }>

      if (!Array.isArray(parsed)) return []

      return parsed
        .filter(item => item.category && item.description && item.file)
        .map(item => ({
          category: item.category!,
          severity: (item.severity as Severity) || 'medium',
          file: item.file!,
          line: item.line,
          description: item.description!,
          suggestion: item.suggestion,
        }))
    } catch {
      return []
    }
  }
}
