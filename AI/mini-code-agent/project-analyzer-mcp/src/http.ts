// src/http.ts
import { createServer, type IncomingMessage, type ServerResponse } from 'http'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { createProjectAnalyzerServer } from './server.js'

/**
 * Streamable HTTP 传输入口。
 *
 * 协议流程：
 * 1. 客户端 POST /mcp 发送 JSON-RPC 请求
 * 2. Server 可以用普通 JSON 响应，也可以用 SSE 流式返回
 * 3. 客户端 GET /mcp 建立 SSE 通道接收通知（可选）
 * 4. 客户端 DELETE /mcp 终止会话
 */

const PORT = parseInt(process.env.PORT ?? '3100', 10)

// 用 Map 管理多个并发会话的传输层
const transports = new Map<string, StreamableHTTPServerTransport>()

async function main(): Promise<void> {
  const httpServer = createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      // 只处理 /mcp 路径
      const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)
      if (url.pathname !== '/mcp') {
        // 健康检查端点
        if (url.pathname === '/health') {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            status: 'ok',
            activeSessions: transports.size,
            uptime: process.uptime(),
          }))
          return
        }

        res.writeHead(404)
        res.end('Not Found')
        return
      }

      // 从请求头中提取会话 ID
      const sessionId = req.headers['mcp-session-id'] as string | undefined

      if (req.method === 'POST') {
        // 如果有会话 ID，尝试复用已有传输
        if (sessionId && transports.has(sessionId)) {
          const transport = transports.get(sessionId)!
          await transport.handleRequest(req, res)
          return
        }

        // 新会话：创建新的 Server 和 Transport
        const { server, cleanup } = createProjectAnalyzerServer()
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => crypto.randomUUID(),
          onsessioninitialized: (newSessionId) => {
            transports.set(newSessionId, transport)
            console.error(`[HTTP] Session created: ${newSessionId}`)
          },
        })

        // 会话关闭时清理
        transport.onclose = () => {
          const sid = findSessionId(transport)
          if (sid) {
            transports.delete(sid)
            console.error(`[HTTP] Session closed: ${sid}`)
          }
          cleanup()
        }

        await server.connect(transport)
        await transport.handleRequest(req, res)

      } else if (req.method === 'GET') {
        // SSE 通知通道
        if (!sessionId || !transports.has(sessionId)) {
          res.writeHead(400, { 'Content-Type': 'text/plain' })
          res.end('Missing or invalid session ID')
          return
        }
        const transport = transports.get(sessionId)!
        await transport.handleRequest(req, res)

      } else if (req.method === 'DELETE') {
        // 关闭会话
        if (sessionId && transports.has(sessionId)) {
          const transport = transports.get(sessionId)!
          await transport.handleRequest(req, res)
          transports.delete(sessionId)
        } else {
          res.writeHead(404)
          res.end('Session not found')
        }

      } else {
        res.writeHead(405, { Allow: 'GET, POST, DELETE' })
        res.end('Method Not Allowed')
      }
    },
  )

  httpServer.listen(PORT, () => {
    console.error(`Project Analyzer MCP Server (HTTP) listening on port ${PORT}`)
    console.error(`Endpoint: http://localhost:${PORT}/mcp`)
    console.error(`Health: http://localhost:${PORT}/health`)
  })

  // 优雅退出
  const shutdown = async () => {
    console.error('\nShutting down...')
    for (const [, transport] of transports) {
      await transport.close()
    }
    httpServer.close()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

function findSessionId(
  transport: StreamableHTTPServerTransport,
): string | undefined {
  for (const [id, t] of transports) {
    if (t === transport) return id
  }
  return undefined
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
