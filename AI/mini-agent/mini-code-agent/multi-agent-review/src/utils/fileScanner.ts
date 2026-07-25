// src/utils/fileScanner.ts
import { readdir, readFile, stat } from 'fs/promises'
import { extname, join, relative } from 'path'

/** 文件扫描结果 */
export interface ScannedFile {
  path: string
  relativePath: string
  extension: string
  size: number
  content: string
  lineCount: number
}

/** 支持分析的文件扩展名 */
const ANALYZABLE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.py', '.rb', '.go',
  '.rs', '.java', '.kt', '.swift', '.c', '.cpp', '.cs',
  '.php', '.vue', '.svelte',
])

/** 忽略的目录 */
const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next',
  '__pycache__', 'venv', '.venv', 'coverage', 'target',
  '.cache', '.parcel-cache', '.turbo',
])

/**
 * 递归扫描项目目录，返回可分析的源代码文件。
 */
export async function scanProject(
  projectPath: string,
  options: {
    maxFiles?: number
    maxFileSize?: number
    extensions?: Set<string>
  } = {},
): Promise<ScannedFile[]> {
  const {
    maxFiles = 200,
    maxFileSize = 100_000, // 100KB
    extensions = ANALYZABLE_EXTENSIONS,
  } = options

  const files: ScannedFile[] = []

  async function walk(dir: string): Promise<void> {
    if (files.length >= maxFiles) return

    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      if (files.length >= maxFiles) break
      if (IGNORE_DIRS.has(entry.name)) continue
      if (entry.name.startsWith('.')) continue

      const fullPath = join(dir, entry.name)

      if (entry.isDirectory()) {
        await walk(fullPath)
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase()
        if (!extensions.has(ext)) continue

        try {
          const fileStat = await stat(fullPath)
          if (fileStat.size > maxFileSize) continue
          if (fileStat.size === 0) continue

          const content = await readFile(fullPath, 'utf-8')
          files.push({
            path: fullPath,
            relativePath: relative(projectPath, fullPath),
            extension: ext,
            size: fileStat.size,
            content,
            lineCount: content.split('\n').length,
          })
        } catch {
          // 跳过无法读取的文件
        }
      }
    }
  }

  await walk(projectPath)
  return files
}
