// src/resources/projectResources.ts
import { readFile, readdir, stat } from 'fs/promises'
import { extname, join } from 'path'
import type { ReadResourceResult } from '@modelcontextprotocol/sdk/types.js'

/**
 * project://structure 资源
 * 当客户端调用 ReadMcpResourceTool 请求此资源时，
 * 返回项目目录结构的 JSON 快照。
 */
export async function getStructureResource(): Promise<ReadResourceResult> {
  const projectPath = process.cwd()
  const structure = await buildQuickStructure(projectPath, 0, 3)

  return {
    contents: [
      {
        uri: 'project://structure',
        mimeType: 'application/json',
        text: JSON.stringify(structure, null, 2),
      },
    ],
  }
}

/**
 * project://dependencies 资源
 */
export async function getDependenciesResource(): Promise<ReadResourceResult> {
  const projectPath = process.cwd()

  // 尝试读取 package.json
  try {
    const pkgContent = await readFile(
      join(projectPath, 'package.json'), 'utf-8',
    )
    const pkg = JSON.parse(pkgContent) as Record<string, unknown>

    const deps = {
      name: pkg.name,
      version: pkg.version,
      dependencies: pkg.dependencies ?? {},
      devDependencies: pkg.devDependencies ?? {},
      peerDependencies: pkg.peerDependencies ?? {},
      engines: pkg.engines ?? null,
    }

    return {
      contents: [
        {
          uri: 'project://dependencies',
          mimeType: 'application/json',
          text: JSON.stringify(deps, null, 2),
        },
      ],
    }
  } catch {
    // 尝试 requirements.txt
    try {
      const reqContent = await readFile(
        join(projectPath, 'requirements.txt'), 'utf-8',
      )
      return {
        contents: [
          {
            uri: 'project://dependencies',
            mimeType: 'text/plain',
            text: reqContent,
          },
        ],
      }
    } catch {
      return {
        contents: [
          {
            uri: 'project://dependencies',
            mimeType: 'text/plain',
            text: 'No package manifest found (package.json, requirements.txt)',
          },
        ],
      }
    }
  }
}

/** 快速构建目录结构（轻量版，用于资源快照） */
async function buildQuickStructure(
  dirPath: string,
  depth: number,
  maxDepth: number,
): Promise<Record<string, unknown>> {
  if (depth > maxDepth) return { _truncated: true }

  const ignoreSet = new Set([
    'node_modules', '.git', 'dist', 'build', '__pycache__', 'venv',
  ])

  let entries
  try {
    entries = await readdir(dirPath, { withFileTypes: true })
  } catch {
    return { _error: 'permission denied' }
  }

  const result: Record<string, unknown> = {}

  for (const entry of entries) {
    if (ignoreSet.has(entry.name)) continue
    if (entry.name.startsWith('.') && depth === 0 && entry.name !== '.claude') {
      continue
    }

    if (entry.isDirectory()) {
      result[entry.name + '/'] = await buildQuickStructure(
        join(dirPath, entry.name), depth + 1, maxDepth,
      )
    } else {
      const ext = extname(entry.name)
      let size = 0
      try {
        const s = await stat(join(dirPath, entry.name))
        size = s.size
      } catch { /* ignore */ }
      result[entry.name] = { ext, size }
    }
  }

  return result
}
