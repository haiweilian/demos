// src/tools/analyzeDependencies.ts
import { readFile } from 'fs/promises'
import { join } from 'path'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

export const analyzeDependenciesSchema = {
  type: 'object' as const,
  properties: {
    path: {
      type: 'string',
      description: 'Path to the project root directory',
    },
    includeTransitive: {
      type: 'boolean',
      description: 'Whether to analyze node_modules for transitive dependencies (slower)',
      default: false,
    },
  },
  required: ['path'],
}

/** 单个依赖的分析结果 */
interface DependencyInfo {
  name: string
  version: string
  type: 'production' | 'development' | 'peer' | 'optional'
  versionConstraint: 'exact' | 'patch' | 'minor' | 'major' | 'range' | 'latest' | 'other'
  issues: string[]
}

/** 依赖分析总结 */
interface DependencyAnalysis {
  packageManager: string
  manifestFile: string
  projectName: string
  projectVersion: string
  dependencies: DependencyInfo[]
  summary: {
    total: number
    production: number
    development: number
    peer: number
    optional: number
    withIssues: number
  }
  issues: string[]
}

/**
 * 解析版本约束类型。
 * npm 的语义化版本有多种写法，每种隐含不同的升级策略。
 */
function classifyVersionConstraint(
  version: string,
): DependencyInfo['versionConstraint'] {
  if (version === '*' || version === 'latest') return 'latest'
  if (version.startsWith('~')) return 'patch'
  if (version.startsWith('^')) return 'minor'
  if (version.includes('||') || version.includes(' - ')) return 'range'
  if (/^\d+\.\d+\.\d+$/.test(version)) return 'exact'
  if (version.startsWith('>=') || version.startsWith('>')) return 'major'
  return 'other'
}

/**
 * 检测依赖可能存在的问题。
 */
function detectIssues(name: string, version: string): string[] {
  const issues: string[] = []

  if (version === '*' || version === 'latest') {
    issues.push(
      `Unpinned version "${version}" — builds are not reproducible`,
    )
  }

  if (version.startsWith('>=')) {
    issues.push(
      `Open-ended range "${version}" — may pull incompatible major versions`,
    )
  }

  if (version.includes('git') || version.includes('github')) {
    issues.push(
      `Git dependency — not available from registry, may break in CI`,
    )
  }

  if (version.startsWith('file:')) {
    issues.push(
      `Local file dependency — will not resolve in other environments`,
    )
  }

  // 检测已知的安全风险包名模式（仅作示例）
  const suspiciousPatterns = [
    /^@[^/]+\/[^/]+-[a-z]{1}$/,  // 极短的 scoped 包名可能是 typosquatting
  ]
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(name)) {
      issues.push(
        `Package name matches a pattern associated with typosquatting`,
      )
    }
  }

  return issues
}

/**
 * 解析 package.json 的依赖字段。
 */
function parseDependencySection(
  deps: Record<string, string> | undefined,
  type: DependencyInfo['type'],
): DependencyInfo[] {
  if (!deps) return []

  return Object.entries(deps).map(([name, version]) => ({
    name,
    version,
    type,
    versionConstraint: classifyVersionConstraint(version),
    issues: detectIssues(name, version),
  }))
}

/**
 * 尝试检测项目使用的包管理器。
 */
async function detectPackageManager(projectPath: string): Promise<string> {
  const lockFiles: Record<string, string> = {
    'bun.lockb': 'bun',
    'bun.lock': 'bun',
    'pnpm-lock.yaml': 'pnpm',
    'yarn.lock': 'yarn',
    'package-lock.json': 'npm',
  }

  for (const [file, manager] of Object.entries(lockFiles)) {
    try {
      await readFile(join(projectPath, file))
      return manager
    } catch {
      // 文件不存在，继续检查下一个
    }
  }

  return 'unknown'
}

/**
 * 分析 requirements.txt（Python 项目）。
 */
function parseRequirementsTxt(content: string): DependencyInfo[] {
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#') && !line.startsWith('-'))
    .map((line): DependencyInfo | null => {
      // 处理 package==1.0.0, package>=1.0.0, package~=1.0.0 等格式
      const match = line.match(/^([a-zA-Z0-9_-]+)\s*([<>=~!]+)?\s*(.*)$/)
      if (!match) return null
      const [, name, op, ver] = match
      const version = op ? `${op}${ver}` : '*'
      return {
        name: name!,
        version,
        type: 'production',
        versionConstraint: classifyVersionConstraint(version),
        issues: detectIssues(name!, version),
      }
    })
    .filter((d): d is DependencyInfo => d !== null)
}

export async function analyzeDependencies(
  args: { path: string; includeTransitive?: boolean },
): Promise<CallToolResult> {
  const projectPath = args.path.startsWith('/')
    ? args.path
    : join(process.cwd(), args.path)

  // 按优先级尝试解析不同类型的包清单文件
  const manifests = [
    { file: 'package.json', type: 'node' },
    { file: 'requirements.txt', type: 'python' },
    { file: 'pyproject.toml', type: 'python' },
    { file: 'go.mod', type: 'go' },
    { file: 'Cargo.toml', type: 'rust' },
  ]

  for (const manifest of manifests) {
    try {
      const content = await readFile(
        join(projectPath, manifest.file), 'utf-8',
      )

      if (manifest.type === 'node') {
        return await analyzeNodeDependencies(
          projectPath, content,
        )
      }

      if (manifest.type === 'python' && manifest.file === 'requirements.txt') {
        return analyzePythonDependencies(content)
      }

      // 对于其他格式，返回原始内容和基本解析
      return {
        content: [{
          type: 'text',
          text: `Found ${manifest.file} (${manifest.type} project).\n` +
            `Full parsing for ${manifest.type} is not yet implemented.\n\n` +
            `Raw content:\n\`\`\`\n${content.slice(0, 4000)}\n\`\`\``,
        }],
      }
    } catch {
      // 文件不存在，尝试下一个
    }
  }

  return {
    isError: true,
    content: [{
      type: 'text',
      text: `No recognized package manifest found in ${projectPath}. ` +
        `Supported: package.json, requirements.txt, pyproject.toml, go.mod, Cargo.toml`,
    }],
  }
}

async function analyzeNodeDependencies(
  projectPath: string,
  content: string,
): Promise<CallToolResult> {
  const pkg = JSON.parse(content) as Record<string, unknown>
  const packageManager = await detectPackageManager(projectPath)

  const allDeps = [
    ...parseDependencySection(
      pkg.dependencies as Record<string, string> | undefined,
      'production',
    ),
    ...parseDependencySection(
      pkg.devDependencies as Record<string, string> | undefined,
      'development',
    ),
    ...parseDependencySection(
      pkg.peerDependencies as Record<string, string> | undefined,
      'peer',
    ),
    ...parseDependencySection(
      pkg.optionalDependencies as Record<string, string> | undefined,
      'optional',
    ),
  ]

  const analysis: DependencyAnalysis = {
    packageManager,
    manifestFile: 'package.json',
    projectName: (pkg.name as string) ?? 'unnamed',
    projectVersion: (pkg.version as string) ?? '0.0.0',
    dependencies: allDeps,
    summary: {
      total: allDeps.length,
      production: allDeps.filter(d => d.type === 'production').length,
      development: allDeps.filter(d => d.type === 'development').length,
      peer: allDeps.filter(d => d.type === 'peer').length,
      optional: allDeps.filter(d => d.type === 'optional').length,
      withIssues: allDeps.filter(d => d.issues.length > 0).length,
    },
    issues: [],
  }

  // 项目级别的问题检测
  if (!pkg.engines) {
    analysis.issues.push(
      'No "engines" field — Node.js version requirement is not specified',
    )
  }
  if (packageManager === 'unknown') {
    analysis.issues.push(
      'No lock file found — dependency versions are not reproducible',
    )
  }

  // 构建输出
  const depsWithIssues = allDeps.filter(d => d.issues.length > 0)
  const sections = [
    `## Dependency Analysis: ${analysis.projectName}@${analysis.projectVersion}`,
    ``,
    `**Package Manager**: ${packageManager}`,
    `**Total Dependencies**: ${analysis.summary.total}`,
    `- Production: ${analysis.summary.production}`,
    `- Development: ${analysis.summary.development}`,
    `- Peer: ${analysis.summary.peer}`,
    `- Optional: ${analysis.summary.optional}`,
  ]

  if (depsWithIssues.length > 0) {
    sections.push(``, `### Issues Found (${depsWithIssues.length})`)
    for (const dep of depsWithIssues) {
      for (const issue of dep.issues) {
        sections.push(`- **${dep.name}@${dep.version}**: ${issue}`)
      }
    }
  }

  if (analysis.issues.length > 0) {
    sections.push(``, `### Project-Level Issues`)
    for (const issue of analysis.issues) {
      sections.push(`- ${issue}`)
    }
  }

  return {
    content: [
      { type: 'text', text: sections.join('\n') },
      {
        type: 'text',
        text: '```json\n' + JSON.stringify(analysis, null, 2) + '\n```',
      },
    ],
  }
}

function analyzePythonDependencies(content: string): CallToolResult {
  const deps = parseRequirementsTxt(content)
  const withIssues = deps.filter(d => d.issues.length > 0)

  const sections = [
    `## Python Dependencies (requirements.txt)`,
    ``,
    `**Total**: ${deps.length}`,
    ...deps.map(d => `- ${d.name} ${d.version}`),
  ]

  if (withIssues.length > 0) {
    sections.push(``, `### Issues (${withIssues.length})`)
    for (const dep of withIssues) {
      for (const issue of dep.issues) {
        sections.push(`- **${dep.name}**: ${issue}`)
      }
    }
  }

  return {
    content: [{ type: 'text', text: sections.join('\n') }],
  }
}
