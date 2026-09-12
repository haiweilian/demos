// src/prompts/projectReview.ts
import type { GetPromptResult } from '@modelcontextprotocol/sdk/types.js'
import { readFile } from 'fs/promises'
import { join } from 'path'

/**
 * 生成项目审查提示词模板。
 * 模板包含项目的实际结构和依赖信息，让模型在审查时有充分上下文。
 * 客户端调用 prompts/get 获取填充后的消息列表，注入对话流。
 */
export async function getProjectReviewPrompt(
  path: string,
  focus: 'security' | 'performance' | 'maintainability' | 'all',
): Promise<GetPromptResult> {
  const projectPath = path.startsWith('/') ? path : join(process.cwd(), path)

  // 读取项目的基本信息
  let projectInfo = ''
  try {
    const pkgContent = await readFile(
      join(projectPath, 'package.json'), 'utf-8',
    )
    const pkg = JSON.parse(pkgContent) as Record<string, unknown>
    projectInfo = [
      `Project: ${pkg.name ?? 'unnamed'}`,
      `Version: ${pkg.version ?? 'unknown'}`,
      `Description: ${pkg.description ?? 'none'}`,
      `Dependencies: ${Object.keys((pkg.dependencies ?? {}) as object).length} production, ${Object.keys((pkg.devDependencies ?? {}) as object).length} dev`,
    ].join('\n')
  } catch {
    projectInfo = 'No package.json found — non-Node.js project or missing manifest.'
  }

  // 根据 focus 构建不同的审查指引
  const focusGuidance = buildFocusGuidance(focus)

  return {
    description: `Comprehensive project review for ${projectPath}`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: [
            `Please perform a comprehensive code review of the project at: ${projectPath}`,
            ``,
            `## Project Information`,
            projectInfo,
            ``,
            `## Review Focus: ${focus}`,
            focusGuidance,
            ``,
            `## Review Process`,
            `1. First, use the \`analyze_structure\` tool to understand the project layout`,
            `2. Use \`analyze_dependencies\` to check dependency health`,
            `3. Use \`analyze_complexity\` to identify code hotspots`,
            `4. Based on the analysis results, provide a detailed review covering:`,
            `   - Architecture and organization assessment`,
            `   - Dependency risk evaluation`,
            `   - Code quality hotspots and refactoring suggestions`,
            `   - ${focus === 'all' ? 'Security, performance, and maintainability concerns' : `Specific ${focus} concerns`}`,
            `5. Conclude with prioritized action items`,
          ].join('\n'),
        },
      },
    ],
  }
}

function buildFocusGuidance(
  focus: 'security' | 'performance' | 'maintainability' | 'all',
): string {
  const guides: Record<string, string> = {
    security: [
      '### Security Review Checklist',
      '- Check for known vulnerable dependencies (outdated versions, CVEs)',
      '- Look for hardcoded secrets, API keys, or credentials',
      '- Evaluate input validation and sanitization practices',
      '- Check authentication and authorization patterns',
      '- Review file system access and path traversal risks',
      '- Assess SQL/NoSQL injection prevention',
      '- Check for unsafe deserialization',
      '- Review CORS and CSP configurations',
    ].join('\n'),

    performance: [
      '### Performance Review Checklist',
      '- Identify N+1 query patterns and database access inefficiencies',
      '- Check for unnecessary synchronous operations',
      '- Look for memory leaks (event listeners, closures, caches without eviction)',
      '- Evaluate bundle size and tree-shaking effectiveness',
      '- Check for excessive re-renders in React components',
      '- Review caching strategies (HTTP, in-memory, CDN)',
      '- Assess startup time and lazy loading opportunities',
    ].join('\n'),

    maintainability: [
      '### Maintainability Review Checklist',
      '- Evaluate code organization and module boundaries',
      '- Check for code duplication and refactoring opportunities',
      '- Assess test coverage and testing patterns',
      '- Review error handling consistency',
      '- Check documentation completeness',
      '- Evaluate naming conventions and code style consistency',
      '- Look for dead code and unused exports',
      '- Assess type safety and TypeScript strictness',
    ].join('\n'),

    all: [
      '### Comprehensive Review',
      'Cover security, performance, and maintainability aspects.',
      'Prioritize findings by severity and impact.',
    ].join('\n'),
  }

  return guides[focus] ?? guides.all!
}
