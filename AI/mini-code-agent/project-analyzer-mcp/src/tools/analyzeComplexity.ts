// src/tools/analyzeComplexity.ts
import { readFile, readdir, stat } from 'fs/promises'
import { extname, join, relative } from 'path'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

export const analyzeComplexitySchema = {
  type: 'object' as const,
  properties: {
    path: {
      type: 'string',
      description: 'Path to the project root or a specific file',
    },
    threshold: {
      type: 'number',
      description:
        'Complexity threshold — only report functions above this value (default: 10)',
      default: 10,
    },
    extensions: {
      type: 'array',
      items: { type: 'string' },
      description:
        'File extensions to analyze (default: .ts, .js, .tsx, .jsx, .py)',
      default: ['.ts', '.js', '.tsx', '.jsx', '.py'],
    },
  },
  required: ['path'],
}

/** 单个函数的复杂度指标 */
interface FunctionMetrics {
  name: string
  file: string
  line: number
  cyclomaticComplexity: number
  maxNestingDepth: number
  lineCount: number
  parameterCount: number
}

/** 文件级别的复杂度汇总 */
interface FileMetrics {
  file: string
  totalFunctions: number
  averageComplexity: number
  maxComplexity: number
  totalLines: number
  codeLines: number
  functions: FunctionMetrics[]
}

/**
 * 计算代码的圈复杂度。
 *
 * 圈复杂度 = 决策点数量 + 1
 * 决策点包括：if, else if, for, while, case, &&, ||, ?:, catch, ??
 *
 * 这是一个简化的实现——生产级工具会构建 AST 精确计算。
 * 我们用正则匹配，足够演示构建模式，也能给出合理近似值。
 */
function calculateCyclomaticComplexity(code: string): number {
  // 移除字符串和注释以避免误匹配
  const cleaned = code
    .replace(/\/\/.*$/gm, '')       // 单行注释
    .replace(/\/\*[\s\S]*?\*\//g, '')  // 多行注释
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")  // 单引号字符串
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')  // 双引号字符串
    .replace(/`(?:[^`\\]|\\.)*`/g, '``')  // 模板字符串

  // 匹配决策点关键词
  const patterns = [
    /\bif\s*\(/g,
    /\belse\s+if\s*\(/g,
    /\bfor\s*\(/g,
    /\bwhile\s*\(/g,
    /\bcase\s+/g,
    /\bcatch\s*\(/g,
    /&&/g,
    /\|\|/g,
    /\?\?/g,
    /\?[^?:]/g,  // 三元运算符（排除 ?? 和 ?:）
  ]

  let complexity = 1 // 基础复杂度
  for (const pattern of patterns) {
    const matches = cleaned.match(pattern)
    if (matches) {
      complexity += matches.length
    }
  }

  return complexity
}

/**
 * 计算代码的最大嵌套深度。
 */
function calculateMaxNesting(code: string): number {
  let maxDepth = 0
  let currentDepth = 0

  for (const char of code) {
    if (char === '{') {
      currentDepth++
      maxDepth = Math.max(maxDepth, currentDepth)
    } else if (char === '}') {
      currentDepth = Math.max(0, currentDepth - 1)
    }
  }

  return maxDepth
}

/**
 * 从源代码中提取函数定义。
 * 支持 TypeScript/JavaScript 和 Python 的常见函数声明模式。
 */
function extractFunctions(
  code: string,
  filePath: string,
  ext: string,
): FunctionMetrics[] {
  const lines = code.split('\n')
  const functions: FunctionMetrics[] = []

  if (ext === '.py') {
    // Python: def function_name(params):
    const pyFuncPattern = /^(\s*)def\s+(\w+)\s*\(([^)]*)\)/
    let i = 0
    while (i < lines.length) {
      const match = lines[i]!.match(pyFuncPattern)
      if (match) {
        const indent = match[1]!.length
        const name = match[2]!
        const params = match[3]!
        const startLine = i

        // 找到函数体的结束（通过缩进判断）
        let endLine = i + 1
        while (endLine < lines.length) {
          const line = lines[endLine]!
          if (line.trim() === '') {
            endLine++
            continue
          }
          const lineIndent = line.match(/^(\s*)/)?.[1]?.length ?? 0
          if (lineIndent <= indent && line.trim() !== '') break
          endLine++
        }

        const funcCode = lines.slice(startLine, endLine).join('\n')
        const paramCount = params.split(',').filter(p => p.trim() && p.trim() !== 'self').length

        functions.push({
          name,
          file: filePath,
          line: startLine + 1,
          cyclomaticComplexity: calculateCyclomaticComplexity(funcCode),
          maxNestingDepth: calculateMaxNesting(funcCode),
          lineCount: endLine - startLine,
          parameterCount: paramCount,
        })
      }
      i++
    }
  } else {
    // TypeScript/JavaScript
    const jsFuncPatterns = [
      /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/,
      /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*(?::\s*\w+(?:<[^>]*>)?\s*)?=>/,
      /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?function/,
      /(\w+)\s*\(([^)]*)\)\s*{/,  // 方法定义
    ]

    let i = 0
    while (i < lines.length) {
      let matched = false
      for (const pattern of jsFuncPatterns) {
        const match = lines[i]!.match(pattern)
        if (match) {
          const name = match[1]!
          const params = match[2] ?? ''
          const startLine = i

          // 用花括号计数找到函数结束位置
          let braceCount = 0
          let started = false
          let endLine = i

          for (let j = i; j < lines.length; j++) {
            for (const char of lines[j]!) {
              if (char === '{') {
                braceCount++
                started = true
              } else if (char === '}') {
                braceCount--
              }
            }
            endLine = j + 1
            if (started && braceCount === 0) break
          }

          const funcCode = lines.slice(startLine, endLine).join('\n')
          const paramCount = params
            ? params.split(',').filter(p => p.trim()).length
            : 0

          // 去重：同名函数只取第一个（简化处理）
          if (!functions.some(f => f.name === name && f.line === startLine + 1)) {
            functions.push({
              name,
              file: filePath,
              line: startLine + 1,
              cyclomaticComplexity: calculateCyclomaticComplexity(funcCode),
              maxNestingDepth: calculateMaxNesting(funcCode),
              lineCount: endLine - startLine,
              parameterCount: paramCount,
            })
          }

          matched = true
          break
        }
      }
      if (!matched) i++
      else i++
    }
  }

  return functions
}

/**
 * 递归收集要分析的源文件。
 */
async function collectSourceFiles(
  dirPath: string,
  extensions: Set<string>,
): Promise<string[]> {
  const result: string[] = []
  const ignoreSet = new Set([
    'node_modules', '.git', 'dist', 'build', '.next',
    '__pycache__', 'venv', '.venv', 'coverage', 'target',
  ])

  async function walk(dir: string): Promise<void> {
    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      if (ignoreSet.has(entry.name)) continue
      if (entry.name.startsWith('.')) continue

      const fullPath = join(dir, entry.name)

      if (entry.isDirectory()) {
        await walk(fullPath)
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase()
        if (extensions.has(ext)) {
          result.push(fullPath)
        }
      }
    }
  }

  await walk(dirPath)
  return result
}

export async function analyzeComplexity(
  args: { path: string; threshold?: number; extensions?: string[] },
): Promise<CallToolResult> {
  const targetPath = args.path.startsWith('/')
    ? args.path
    : join(process.cwd(), args.path)
  const threshold = args.threshold ?? 10
  const extensions = new Set(args.extensions ?? ['.ts', '.js', '.tsx', '.jsx', '.py'])

  // 判断目标是文件还是目录
  let files: string[]
  try {
    const targetStat = await stat(targetPath)
    if (targetStat.isFile()) {
      files = [targetPath]
    } else {
      files = await collectSourceFiles(targetPath, extensions)
    }
  } catch (error) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Cannot access path: ${targetPath}` }],
    }
  }

  const allFileMetrics: FileMetrics[] = []
  const hotspots: FunctionMetrics[] = []

  for (const file of files) {
    let content: string
    try {
      content = await readFile(file, 'utf-8')
    } catch {
      continue
    }

    const ext = extname(file).toLowerCase()
    const relPath = relative(targetPath, file) || file
    const functions = extractFunctions(content, relPath, ext)

    const lines = content.split('\n')
    const codeLines = lines.filter(
      l => l.trim() && !l.trim().startsWith('//') && !l.trim().startsWith('#'),
    ).length

    const complexities = functions.map(f => f.cyclomaticComplexity)
    const avgComplexity = complexities.length > 0
      ? complexities.reduce((a, b) => a + b, 0) / complexities.length
      : 0

    allFileMetrics.push({
      file: relPath,
      totalFunctions: functions.length,
      averageComplexity: Math.round(avgComplexity * 10) / 10,
      maxComplexity: Math.max(0, ...complexities),
      totalLines: lines.length,
      codeLines,
      functions,
    })

    // 收集超过阈值的热点函数
    for (const fn of functions) {
      if (fn.cyclomaticComplexity >= threshold) {
        hotspots.push(fn)
      }
    }
  }

  // 按复杂度降序排列热点
  hotspots.sort((a, b) => b.cyclomaticComplexity - a.cyclomaticComplexity)

  // 构建输出报告
  const sections = [
    `## Code Complexity Analysis`,
    ``,
    `**Path**: ${targetPath}`,
    `**Files Analyzed**: ${files.length}`,
    `**Complexity Threshold**: ${threshold}`,
    `**Hotspots Found**: ${hotspots.length}`,
  ]

  if (hotspots.length > 0) {
    sections.push(
      ``,
      `### Complexity Hotspots`,
      ``,
      `| Function | File | Line | Complexity | Nesting | Lines | Params |`,
      `|----------|------|------|-----------|---------|-------|--------|`,
    )
    for (const fn of hotspots.slice(0, 20)) {
      sections.push(
        `| ${fn.name} | ${fn.file} | ${fn.line} | **${fn.cyclomaticComplexity}** | ${fn.maxNestingDepth} | ${fn.lineCount} | ${fn.parameterCount} |`,
      )
    }
    if (hotspots.length > 20) {
      sections.push(`| ... | ... | ... | ... | ... | ... | ... |`)
      sections.push(`*Showing top 20 of ${hotspots.length} hotspots*`)
    }
  } else {
    sections.push(
      ``,
      `All functions are below the complexity threshold of ${threshold}.`,
    )
  }

  // 文件级别的复杂度排名
  const filesByComplexity = [...allFileMetrics]
    .filter(f => f.totalFunctions > 0)
    .sort((a, b) => b.maxComplexity - a.maxComplexity)
    .slice(0, 10)

  if (filesByComplexity.length > 0) {
    sections.push(
      ``,
      `### Most Complex Files (Top 10)`,
      ``,
      `| File | Functions | Avg Complexity | Max Complexity | Code Lines |`,
      `|------|----------|---------------|---------------|------------|`,
    )
    for (const f of filesByComplexity) {
      sections.push(
        `| ${f.file} | ${f.totalFunctions} | ${f.averageComplexity} | ${f.maxComplexity} | ${f.codeLines} |`,
      )
    }
  }

  // 复杂度分布直方图
  const allComplexities = allFileMetrics.flatMap(
    f => f.functions.map(fn => fn.cyclomaticComplexity),
  )
  if (allComplexities.length > 0) {
    const buckets = [
      { label: '1-5 (Simple)', min: 1, max: 5, count: 0 },
      { label: '6-10 (Moderate)', min: 6, max: 10, count: 0 },
      { label: '11-20 (Complex)', min: 11, max: 20, count: 0 },
      { label: '21-50 (Very Complex)', min: 21, max: 50, count: 0 },
      { label: '50+ (Untestable)', min: 51, max: Infinity, count: 0 },
    ]
    for (const c of allComplexities) {
      for (const bucket of buckets) {
        if (c >= bucket.min && c <= bucket.max) {
          bucket.count++
          break
        }
      }
    }
    sections.push(
      ``,
      `### Complexity Distribution`,
      ...buckets
        .filter(b => b.count > 0)
        .map(b => {
          const bar = '█'.repeat(Math.min(40, Math.ceil(b.count / allComplexities.length * 40)))
          return `- ${b.label}: ${b.count} functions ${bar}`
        }),
    )
  }

  return {
    content: [
      { type: 'text', text: sections.join('\n') },
      {
        type: 'text',
        text: '```json\n' + JSON.stringify(
          {
            summary: {
              filesAnalyzed: files.length,
              totalFunctions: allComplexities.length,
              hotspotsAboveThreshold: hotspots.length,
              averageComplexity: allComplexities.length > 0
                ? Math.round(
                    allComplexities.reduce((a, b) => a + b, 0) / allComplexities.length * 10
                  ) / 10
                : 0,
            },
            hotspots: hotspots.slice(0, 20),
          },
          null, 2,
        ) + '\n```',
      },
    ],
  }
}
