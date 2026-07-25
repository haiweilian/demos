// src/mcp/client.ts
// 对应 Claude Code: src/services/mcp/client.ts 的 connectToServer() + fetchToolsForClient()
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { Tool as MCPToolDef } from "@modelcontextprotocol/sdk/types.js";
import type { Stream } from "node:stream";

/** 一个 stdio Server 的启动配置：command 是可执行程序名，参数放 args。 */
export interface McpServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

/** 一个已连接的 Server：名字 + SDK client + 拉回的工具定义列表。 */
export interface ConnectedMcpServer {
  name: string;
  client: Client;
  tools: MCPToolDef[];
}

// 对应 Claude Code 的 getConnectionTimeoutMs()（默认 30s，可按需改成读环境变量）。
const CONNECTION_TIMEOUT_MS = 30_000;

/** 给 connect() 套超时：13.3.2 的 Promise.race 模式，原封不动搬过来。
 *  参数类型用 SDK 的 Transport 接口而不是具体的 StdioClientTransport——
 *  这里只用到 close()，放宽后测试才能注入假 transport（stdio/HTTP 也都适配）。 */
async function connectWithTimeout(
  client: Client,
  transport: Transport,
  name: string,
  timeoutMs: number,
): Promise<void> {
  const connectPromise = client.connect(transport);
  const timeoutPromise = new Promise<never>((_, reject) => {
    const timeoutId = setTimeout(() => {
      transport.close().catch(() => {}); // 超时就主动关掉半开的 transport
      reject(new Error(`MCP server "${name}" connection timed out`));
    }, timeoutMs);
    connectPromise.then(
      () => clearTimeout(timeoutId),
      () => clearTimeout(timeoutId),
    );
  });
  await Promise.race([connectPromise, timeoutPromise]);
}

/**
 * 消费 Server 的 stderr，转发到本进程 stderr 并加 [MCP:<name>] 前缀。
 *
 * 为什么必须做：`stderr: "pipe"` 拿到的是一条内存管道，**没人读它就会被写满**。
 * 管道满了之后子进程的 write 会阻塞，于是一个启动时先打几百 KB banner 的 Server
 * 会卡在打日志上、永远发不出 initialize 响应，客户端只能干等到 30 秒超时。
 *
 * 为什么不干脆改成 stderr: "inherit"：那样确实也不会卡，但日志会裸奔进终端，
 * 多个 Server 的输出混在一起分不清来源。保留 "pipe" 才有机会加前缀、
 * 也才留着后续限流/限量的挂载点（13.2.1 提到的 64MB 上限就挂在这儿）。
 */
export function forwardServerStderr(name: string, stderr: Stream | null): void {
  if (!stderr) return;
  stderr.on("data", (chunk: Buffer | string) => {
    // 按块切行加前缀；教学版不做跨块缓冲，极端情况下一行可能被拆成两行。
    for (const line of String(chunk).split("\n")) {
      if (line.length > 0) process.stderr.write(`[MCP:${name}] ${line}\n`);
    }
  });
  // 读流自己出错（子进程被 kill 等）不该炸掉整个 Agent。
  stderr.on("error", () => {});
}

/** 关闭连接，吞掉清理期间的次生错误——清理失败不能盖住真正的失败原因。 */
async function closeQuietly(client: Client, transport: Transport): Promise<void> {
  try {
    await client.close(); // 内部会连带关掉 transport
  } catch {
    /* 忽略 */
  }
  try {
    await transport.close(); // 兜底：connect() 还没走到绑定 transport 就失败的情况
  } catch {
    /* 忽略 */
  }
}

/**
 * 握手 + 能力协商 + 拉工具的主干。
 * 从 connectMcpServer 里抽出来，是为了能用假 client/transport 覆盖失败路径的资源回收
 * （connectMcpServer 自己要 fork 真子进程，没法单测）。公开签名保持不变。
 */
export async function handshakeAndFetchTools(
  name: string,
  client: Client,
  transport: Transport,
  timeoutMs: number = CONNECTION_TIMEOUT_MS,
): Promise<ConnectedMcpServer> {
  try {
    // 1. connect() 内部完成 initialize 握手，外面套 Promise.race 超时。
    await connectWithTimeout(client, transport, name, timeoutMs);

    // 2. 能力协商的客户端落点：先看 Server 声明了 tools 没有，再决定拉不拉。
    //    对应 Claude Code: if (!client.capabilities?.tools) return []
    const caps = client.getServerCapabilities();
    let tools: MCPToolDef[] = [];
    if (caps?.tools) {
      tools = (await client.listTools()).tools;
    } else {
      console.log(`[MCP] Server "${name}" 未声明 tools 能力，跳过工具拉取。`);
    }

    console.log(`[MCP] Connected "${name}" (${tools.length} tools)`);
    return { name, client, tools };
  } catch (err) {
    // 任何一步失败都要回收子进程：不关的话 fork 出来的 Server 会一直活到 Agent 退出。
    // 超时路径同理——connectWithTimeout 里那次 close 是"半开连接"的急救，
    // 这里再关一次保证 client 侧状态也收干净（close 幂等）。
    await closeQuietly(client, transport);
    throw err; // 继续上抛，fail-soft 由 registerMcpServers 负责
  }
}

export async function connectMcpServer(
  name: string,
  config: McpServerConfig,
): Promise<ConnectedMcpServer> {
  // 1. stdio 传输：fork 子进程当 JSON-RPC 通道，stderr 走 'pipe' 不污染终端（对应 13.2.1）。
  const transport = new StdioClientTransport({
    command: config.command,
    args: config.args ?? [],
    env: { ...process.env, ...config.env } as Record<string, string>,
    stderr: "pipe",
  });

  // 2. 立刻接上 stderr 消费者。必须在 connect() 之前——SDK 在建 transport 时就准备好了
  //    这条管道，握手期间 Server 打的日志同样会走它，晚接就可能已经被背压卡住了。
  forwardServerStderr(name, transport.stderr);

  // 3. 创建客户端，声明自己的身份与能力（这里只做最小声明）。
  const client = new Client(
    { name: "miniagent", version: "0.1.0" },
    { capabilities: {} },
  );

  // 4. 握手、协商、拉工具；失败时由它负责关掉 client/transport。
  return handshakeAndFetchTools(name, client, transport, CONNECTION_TIMEOUT_MS);
}
