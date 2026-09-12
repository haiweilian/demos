// src/index.ts
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createProjectAnalyzerServer } from './server.js'

/**
 * stdio 传输入口。
 *
 * 客户端通过 StdioClientTransport 启动子进程，将 stdin/stdout
 * 作为 JSON-RPC 消息通道。配置中的 command + args 就是启动本脚本的命令。
 *
 * 关键：stdio 模式下 console.log() 绝不能用——stdout 是 JSON-RPC
 * 通道，任何非 JSON-RPC 内容都会导致协议解析失败。日志一律走 stderr。
 */
async function main(): Promise<void> {
  const { server, cleanup } = createProjectAnalyzerServer()
  const transport = new StdioServerTransport()

  // 优雅退出
  process.on('SIGINT', async () => {
    cleanup()
    await server.close()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    cleanup()
    await server.close()
    process.exit(0)
  })

  await server.connect(transport)

  // Server 在 stdio 模式下持续运行，等待客户端消息
  console.error('Project Analyzer MCP Server running on stdio')
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
