// src/server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  SubscribeRequestSchema,
  UnsubscribeRequestSchema,
  type CallToolResult,
  type GetPromptResult,
  type ListPromptsResult,
  type ListResourcesResult,
  type ListToolsResult,
  type ReadResourceResult,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js'
import { watch, type FSWatcher } from 'fs'
import { resolve } from 'path'
import {
  analyzeComplexity,
  analyzeComplexitySchema,
} from './tools/analyzeComplexity.js'
import {
  analyzeDependencies,
  analyzeDependenciesSchema,
} from './tools/analyzeDependencies.js'
import {
  analyzeStructure,
  analyzeStructureSchema,
} from './tools/analyzeStructure.js'
import {
  getStructureResource,
  getDependenciesResource,
} from './resources/projectResources.js'
import { getProjectReviewPrompt } from './prompts/projectReview.js'

/**
 * 创建并配置 Project Analyzer MCP Server。
 *
 * 设计决策：Server 实例与传输层解耦。这个函数只负责注册
 * 请求处理器，不关心消息如何到达（stdio 还是 HTTP）。
 * 这与 Claude Code 源码中 entrypoints/mcp.ts 的模式一致：
 * Server 创建和 transport.connect 是分开的两步。
 */
export function createProjectAnalyzerServer(): {
  server: Server
  cleanup: () => void
} {
  const server = new Server(
    {
      name: 'project-analyzer',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {
          subscribe: true,    // 支持资源变更订阅
          listChanged: true,  // 支持资源列表变更通知
        },
        prompts: {},
      },
    },
  )

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 工具定义
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const TOOLS: Tool[] = [
    {
      name: 'analyze_structure',
      description:
        'Analyze the file and directory structure of a project. ' +
        'Returns a tree view with file counts, sizes, and language distribution.',
      inputSchema: analyzeStructureSchema,
      annotations: {
        title: 'Analyze Project Structure',
        readOnlyHint: true,
        openWorldHint: false,
      },
    },
    {
      name: 'analyze_dependencies',
      description:
        'Analyze project dependencies from package.json, requirements.txt, ' +
        'go.mod, or Cargo.toml. Reports direct/dev dependencies, version ' +
        'constraints, and potential issues.',
      inputSchema: analyzeDependenciesSchema,
      annotations: {
        title: 'Analyze Dependencies',
        readOnlyHint: true,
        openWorldHint: false,
      },
    },
    {
      name: 'analyze_complexity',
      description:
        'Analyze code complexity metrics for source files. Calculates ' +
        'cyclomatic complexity, nesting depth, function length, and ' +
        'identifies hotspots that may need refactoring.',
      inputSchema: analyzeComplexitySchema,
      annotations: {
        title: 'Analyze Code Complexity',
        readOnlyHint: true,
        openWorldHint: false,
      },
    },
  ]

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 请求处理器：工具
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  server.setRequestHandler(
    ListToolsRequestSchema,
    async (): Promise<ListToolsResult> => {
      return { tools: TOOLS }
    },
  )

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request): Promise<CallToolResult> => {
      const { name, arguments: args } = request.params

      try {
        switch (name) {
          case 'analyze_structure':
            return await analyzeStructure(args as { path: string; depth?: number; ignore?: string[] })

          case 'analyze_dependencies':
            return await analyzeDependencies(args as { path: string; includeTransitive?: boolean })

          case 'analyze_complexity':
            return await analyzeComplexity(args as { path: string; threshold?: number; extensions?: string[] })

          default:
            return {
              isError: true,
              content: [{ type: 'text', text: `Unknown tool: ${name}` }],
            }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return {
          isError: true,
          content: [{ type: 'text', text: `Error: ${message}` }],
        }
      }
    },
  )

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 请求处理器：资源
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // 追踪活跃订阅和对应的文件监视器
  const subscriptions = new Map<string, FSWatcher>()

  server.setRequestHandler(
    ListResourcesRequestSchema,
    async (): Promise<ListResourcesResult> => {
      return {
        resources: [
          {
            uri: 'project://structure',
            name: 'Project Structure',
            description:
              'Current project directory structure as a JSON tree',
            mimeType: 'application/json',
          },
          {
            uri: 'project://dependencies',
            name: 'Project Dependencies',
            description:
              'Parsed dependency information from package manifests',
            mimeType: 'application/json',
          },
        ],
      }
    },
  )

  server.setRequestHandler(
    ReadResourceRequestSchema,
    async (request): Promise<ReadResourceResult> => {
      const { uri } = request.params

      switch (uri) {
        case 'project://structure':
          return await getStructureResource()

        case 'project://dependencies':
          return await getDependenciesResource()

        default:
          throw new Error(`Unknown resource: ${uri}`)
      }
    },
  )

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 请求处理器：资源订阅
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 资源订阅机制——当项目文件发生变更时通知客户端。
   * 资源订阅让客户端不必轮询，而是在数据变化时收到
   * notifications/resources/updated。
   */
  server.setRequestHandler(
    SubscribeRequestSchema,
    async (request) => {
      const { uri } = request.params
      const watchPath = resolve(process.cwd())

      // 避免重复订阅
      if (subscriptions.has(uri)) {
        return {}
      }

      // 用 fs.watch 监视项目目录变更
      const watcher = watch(
        watchPath,
        { recursive: true },
        (_event, filename) => {
          // 过滤噪声：忽略 node_modules、.git、dist 等目录
          if (filename && shouldIgnoreChange(filename)) {
            return
          }

          // 发送资源变更通知
          server.notification({
            method: 'notifications/resources/updated',
            params: { uri },
          })
        },
      )

      subscriptions.set(uri, watcher)
      return {}
    },
  )

  server.setRequestHandler(
    UnsubscribeRequestSchema,
    async (request) => {
      const { uri } = request.params
      const watcher = subscriptions.get(uri)
      if (watcher) {
        watcher.close()
        subscriptions.delete(uri)
      }
      return {}
    },
  )

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 请求处理器：提示词模板
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  server.setRequestHandler(
    ListPromptsRequestSchema,
    async (): Promise<ListPromptsResult> => {
      return {
        prompts: [
          {
            name: 'project-review',
            description:
              'Generate a comprehensive project review covering ' +
              'structure, dependencies, and code quality',
            arguments: [
              {
                name: 'path',
                description: 'Path to the project root directory',
                required: true,
              },
              {
                name: 'focus',
                description:
                  'Review focus area: "security", "performance", ' +
                  '"maintainability", or "all"',
                required: false,
              },
            ],
          },
        ],
      }
    },
  )

  server.setRequestHandler(
    GetPromptRequestSchema,
    async (request): Promise<GetPromptResult> => {
      const { name, arguments: args } = request.params

      if (name !== 'project-review') {
        throw new Error(`Unknown prompt: ${name}`)
      }

      return await getProjectReviewPrompt(
        args?.path ?? process.cwd(),
        (args?.focus as 'security' | 'performance' | 'maintainability' | 'all') ?? 'all',
      )
    },
  )

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 清理逻辑
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  function cleanup(): void {
    for (const [uri, watcher] of subscriptions) {
      watcher.close()
      subscriptions.delete(uri)
    }
  }

  return { server, cleanup }
}

/**
 * 判断文件变更是否应该被忽略。
 */
function shouldIgnoreChange(filename: string): boolean {
  const ignorePatterns = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    '__pycache__',
    '.pyc',
    '.DS_Store',
    'coverage',
  ]
  return ignorePatterns.some(
    pattern => filename.includes(pattern)
  )
}
