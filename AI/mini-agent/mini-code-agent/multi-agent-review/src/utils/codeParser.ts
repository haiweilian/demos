// src/utils/codeParser.ts

/**
 * 代码解析工具——为 Worker 提供基础的代码理解能力。
 * 不构建完整 AST，而是用正则和启发式规则提取关键信息。
 */

/** 导入声明 */
export interface ImportStatement {
  source: string
  specifiers: string[]
  line: number
  isDefault: boolean
  isDynamic: boolean
}

/** 函数声明 */
export interface FunctionDeclaration {
  name: string
  line: number
  endLine: number
  params: string[]
  isAsync: boolean
  isExported: boolean
  body: string
}

/**
 * 提取导入声明。
 */
export function extractImports(code: string): ImportStatement[] {
  const imports: ImportStatement[] = []
  const lines = code.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!

    // ESM: import { x } from 'y'
    const esmMatch = line.match(
      /import\s+(?:({[^}]+})|(\w+)(?:\s*,\s*{[^}]+})?)\s+from\s+['"]([^'"]+)['"]/,
    )
    if (esmMatch) {
      const specifiers = esmMatch[1]
        ? esmMatch[1].replace(/[{}]/g, '').split(',').map(s => s.trim()).filter(Boolean)
        : esmMatch[2] ? [esmMatch[2]] : []
      imports.push({
        source: esmMatch[3]!,
        specifiers,
        line: i + 1,
        isDefault: !esmMatch[1],
        isDynamic: false,
      })
      continue
    }

    // CommonJS: const x = require('y')
    const cjsMatch = line.match(
      /(?:const|let|var)\s+(?:({[^}]+})|(\w+))\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/,
    )
    if (cjsMatch) {
      const specifiers = cjsMatch[1]
        ? cjsMatch[1].replace(/[{}]/g, '').split(',').map(s => s.trim()).filter(Boolean)
        : cjsMatch[2] ? [cjsMatch[2]] : []
      imports.push({
        source: cjsMatch[3]!,
        specifiers,
        line: i + 1,
        isDefault: !cjsMatch[1],
        isDynamic: false,
      })
      continue
    }

    // Dynamic import: import('y')
    const dynMatch = line.match(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/)
    if (dynMatch) {
      imports.push({
        source: dynMatch[1]!,
        specifiers: [],
        line: i + 1,
        isDefault: false,
        isDynamic: true,
      })
    }
  }

  return imports
}

/**
 * 提取函数声明。
 */
export function extractFunctions(
  code: string,
): FunctionDeclaration[] {
  const functions: FunctionDeclaration[] = []
  const lines = code.split('\n')

  const patterns = [
    // function name(params) { / async function name(params) {
    /^(\s*)(export\s+)?(async\s+)?function\s+(\w+)\s*\(([^)]*)\)/,
    // const name = (params) => { / const name = async (params) => {
    /^(\s*)(export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(async\s+)?\(([^)]*)\)\s*(?::\s*[^=]+)?\s*=>/,
    // const name = function(params) {
    /^(\s*)(export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(async\s+)?function\s*\(([^)]*)\)/,
  ]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!

    for (const pattern of patterns) {
      const match = line.match(pattern)
      if (!match) continue

      // 根据模式不同，匹配组的位置不同
      const isExported = !!match[2]
      const isAsync = !!(match[3] || match[4])
      const name = match[4] || match[3] || 'anonymous'
      const paramsStr = match[5] ?? ''

      // 寻找函数体的结束位置
      let braceCount = 0
      let started = false
      let endLine = i

      for (let j = i; j < lines.length; j++) {
        for (const char of lines[j]!) {
          if (char === '{') { braceCount++; started = true }
          else if (char === '}') { braceCount-- }
        }
        endLine = j
        if (started && braceCount <= 0) break
      }

      const params = paramsStr
        .split(',')
        .map(p => p.trim().split(':')[0]!.trim())
        .filter(Boolean)

      const body = lines.slice(i, endLine + 1).join('\n')

      functions.push({
        name,
        line: i + 1,
        endLine: endLine + 1,
        params,
        isAsync,
        isExported,
        body,
      })

      break // 一行只匹配一个模式
    }
  }

  return functions
}

/**
 * 提取字符串字面量——用于安全审查中检测硬编码凭证。
 */
export function extractStringLiterals(
  code: string,
): Array<{ value: string; line: number }> {
  const literals: Array<{ value: string; line: number }> = []
  const lines = code.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    // 跳过注释行
    if (line.trim().startsWith('//') || line.trim().startsWith('#')) continue

    // 匹配各种字符串字面量
    const patterns = [
      /'([^'\\]{8,})'/g,   // 单引号，至少 8 个字符
      /"([^"\\]{8,})"/g,   // 双引号，至少 8 个字符
    ]

    for (const pattern of patterns) {
      let match
      while ((match = pattern.exec(line)) !== null) {
        literals.push({ value: match[1]!, line: i + 1 })
      }
    }
  }

  return literals
}
