// src/tools/analyzeStructure.ts
import { readdir, stat } from 'fs/promises'
import { extname, join, relative } from 'path'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

/**
 * JSON Schema 定义——这会被发送到 Claude Code 客户端，
 * 模型根据 schema 生成合法的调用参数。MCP 工具的 schema 由
 * Server 定义，客户端只做透传，所以 schema 质量全靠 Server 作者。
 */
export const analyzeStructureSchema = {
  type: 'object' as const,
  properties: {
    path: {
      type: 'string',
      description: 'Absolute or relative path to the project root directory',
    },
    depth: {
      type: 'number',
      description: 'Maximum depth to traverse (default: 5)',
      default: 5,
    },
    ignore: {
      type: 'array',
      items: { type: 'string' },
      description: 'Additional directory names to ignore (node_modules, .git are always ignored)',
      default: [],
    },
  },
  required: ['path'],
}

// 默认忽略的目录
const DEFAULT_IGNORE = new Set([
  'node_modules', '.git', 'dist', 'build', '.next',
  '__pycache__', '.venv', 'venv', '.tox', 'target',
  'coverage', '.nyc_output', '.cache', '.parcel-cache',
])

// 语言到扩展名的映射
const LANGUAGE_MAP: Record<string, string> = {
  '.ts': 'TypeScript', '.tsx': 'TypeScript (JSX)',
  '.js': 'JavaScript', '.jsx': 'JavaScript (JSX)',
  '.py': 'Python', '.rb': 'Ruby', '.go': 'Go',
  '.rs': 'Rust', '.java': 'Java', '.kt': 'Kotlin',
  '.swift': 'Swift', '.c': 'C', '.cpp': 'C++',
  '.h': 'C/C++ Header', '.cs': 'C#',
  '.php': 'PHP', '.vue': 'Vue', '.svelte': 'Svelte',
  '.md': 'Markdown', '.json': 'JSON', '.yaml': 'YAML',
  '.yml': 'YAML', '.toml': 'TOML', '.xml': 'XML',
  '.html': 'HTML', '.css': 'CSS', '.scss': 'SCSS',
  '.sql': 'SQL', '.sh': 'Shell', '.bash': 'Shell',
  '.dockerfile': 'Docker', '.proto': 'Protocol Buffers',
}

/** 目录树节点 */
interface TreeNode {
  name: string
  type: 'file' | 'directory'
  size?: number
  language?: string
  children?: TreeNode[]
}

/** 分析结果统计 */
interface StructureStats {
  totalFiles: number
  totalDirectories: number
  totalSize: number
  languageDistribution: Record<string, { count: number; totalSize: number }>
  largestFiles: Array<{ path: string; size: number }>
}

/**
 * 递归构建目录树。对每个文件调用 fs.stat() 获取大小；
 * 在大型项目中可考虑加入进程级缓存以减少重复 stat。
 */
async function buildTree(
  dirPath: string,
  basePath: string,
  depth: number,
  maxDepth: number,
  ignoreSet: Set<string>,
  stats: StructureStats,
): Promise<TreeNode[]> {
  if (depth > maxDepth) return []

  let entries
  try {
    entries = await readdir(dirPath, { withFileTypes: true })
  } catch {
    return [] // 权限不足或路径不存在
  }

  // 按名称排序：目录在前，文件在后
  entries.sort((a, b) => {
    if (a.isDirectory() !== b.isDirectory()) {
      return a.isDirectory() ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })

  const nodes: TreeNode[] = []

  for (const entry of entries) {
    if (ignoreSet.has(entry.name)) continue
    if (entry.name.startsWith('.') && entry.name !== '.env.example') continue

    const fullPath = join(dirPath, entry.name)
    const relPath = relative(basePath, fullPath)

    if (entry.isDirectory()) {
      stats.totalDirectories++
      const children = await buildTree(
        fullPath, basePath, depth + 1, maxDepth, ignoreSet, stats,
      )
      nodes.push({
        name: entry.name,
        type: 'directory',
        children,
      })
    } else if (entry.isFile()) {
      stats.totalFiles++
      let fileSize = 0
      try {
        const fileStat = await stat(fullPath)
        fileSize = fileStat.size
      } catch {
        // 文件可能在遍历过程中被删除
      }

      stats.totalSize += fileSize

      const ext = extname(entry.name).toLowerCase()
      const language = LANGUAGE_MAP[ext]
      if (language) {
        if (!stats.languageDistribution[language]) {
          stats.languageDistribution[language] = { count: 0, totalSize: 0 }
        }
        stats.languageDistribution[language].count++
        stats.languageDistribution[language].totalSize += fileSize
      }

      // 追踪最大文件（保留前 10 个）
      stats.largestFiles.push({ path: relPath, size: fileSize })
      stats.largestFiles.sort((a, b) => b.size - a.size)
      if (stats.largestFiles.length > 10) {
        stats.largestFiles.length = 10
      }

      nodes.push({
        name: entry.name,
        type: 'file',
        size: fileSize,
        language,
      })
    }
  }

  return nodes
}

/** 格式化文件大小为人类可读格式 */
function formatSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

/**
 * analyze_structure 工具的主函数。
 * 返回值遵循 MCP 的 CallToolResult 格式——content 数组
 * 包含一个或多个 text/image 块。在 Server 端就控制输出大小，
 * 避免客户端做截断时丢信息。
 */
export async function analyzeStructure(
  args: { path: string; depth?: number; ignore?: string[] },
): Promise<CallToolResult> {
  const projectPath = args.path.startsWith('/')
    ? args.path
    : join(process.cwd(), args.path)
  const maxDepth = args.depth ?? 5
  const ignoreSet = new Set([
    ...DEFAULT_IGNORE,
    ...(args.ignore ?? []),
  ])

  const stats: StructureStats = {
    totalFiles: 0,
    totalDirectories: 0,
    totalSize: 0,
    languageDistribution: {},
    largestFiles: [],
  }

  const tree = await buildTree(
    projectPath, projectPath, 0, maxDepth, ignoreSet, stats,
  )

  // 按文件数量降序排列语言分布
  const sortedLanguages = Object.entries(stats.languageDistribution)
    .sort(([, a], [, b]) => b.count - a.count)

  // 构建人类可读的摘要
  const summary = [
    `## Project Structure Analysis`,
    ``,
    `**Path**: ${projectPath}`,
    `**Total Files**: ${stats.totalFiles}`,
    `**Total Directories**: ${stats.totalDirectories}`,
    `**Total Size**: ${formatSize(stats.totalSize)}`,
    ``,
    `### Language Distribution`,
    ...sortedLanguages.map(
      ([lang, info]) =>
        `- ${lang}: ${info.count} files (${formatSize(info.totalSize)})`,
    ),
    ``,
    `### Largest Files`,
    ...stats.largestFiles.map(
      f => `- ${f.path}: ${formatSize(f.size)}`,
    ),
  ].join('\n')

  return {
    content: [
      { type: 'text', text: summary },
      {
        type: 'text',
        text: '```json\n' + JSON.stringify(
          { tree, stats: { ...stats, totalSizeFormatted: formatSize(stats.totalSize) } },
          null, 2,
        ) + '\n```',
      },
    ],
  }
}
