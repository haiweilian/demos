// test/mcp.test.ts
// 第 13 章 MCP 客户端接入的纯逻辑测试：命名空间、schema 透传、描述截断、
// 结果转换、错误兜底、失败路径的资源回收、stderr 背压、以及 registerMcpServers 的 fail-soft。
// 全程不连真实 MCP Server —— client / transport 用假对象注入。
import { test } from "node:test";
import assert from "node:assert/strict";
import { PassThrough } from "node:stream";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { Tool as MCPToolDef } from "@modelcontextprotocol/sdk/types.js";
import { wrapMcpTool } from "../src/mcp/mcpTool.js";
import { connectMcpServer, forwardServerStderr, handshakeAndFetchTools } from "../src/mcp/client.js";
import { registerMcpServers } from "../src/mcp/index.js";
import { ToolRegistry } from "../src/registry.js";

// ============================================================
// 测试替身
// ============================================================

/** 造一个最小可用的 MCP 工具定义。 */
function makeDef(overrides: Partial<MCPToolDef> = {}): MCPToolDef {
  return {
    name: "analyze_structure",
    description: "Analyze the directory structure of a project",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string", description: "目标路径" } },
      required: ["path"],
    },
    ...overrides,
  } as MCPToolDef;
}

interface CallRecord {
  name: string;
  arguments: Record<string, unknown> | undefined;
}

/** 假 client：只实现 callTool，记录每次调用参数，返回预设结果或抛错。 */
function makeFakeClient(
  respond: (params: CallRecord) => unknown,
): { client: Client; calls: CallRecord[] } {
  const calls: CallRecord[] = [];
  const fake = {
    async callTool(params: CallRecord): Promise<unknown> {
      calls.push(params);
      return respond(params);
    },
  };
  return { client: fake as unknown as Client, calls };
}

/** 假 transport：只记录 close() 被调了几次，不 fork 任何子进程。 */
function makeFakeTransport(closed: string[]): Transport {
  return {
    async start(): Promise<void> {},
    async send(): Promise<void> {},
    async close(): Promise<void> {
      closed.push("transport");
    },
  };
}

/** 假 client：connect / getServerCapabilities / listTools / close 都可定制。 */
function makeFakeConnection(opts: {
  connect?: () => Promise<void>;
  listTools?: () => Promise<{ tools: MCPToolDef[] }>;
}): { client: Client; transport: Transport; closed: string[] } {
  const closed: string[] = [];
  const fake = {
    connect: opts.connect ?? (async (): Promise<void> => {}),
    getServerCapabilities: () => ({ tools: {} }),
    listTools: opts.listTools ?? (async () => ({ tools: [] })),
    async close(): Promise<void> {
      closed.push("client");
    },
  };
  return { client: fake as unknown as Client, transport: makeFakeTransport(closed), closed };
}

/** 给一个可能永远不完成的 Promise 兜一个上限，超时就返回 fallback（定时器用完即清）。 */
async function withDeadline<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const deadline = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  try {
    return await Promise.race([promise, deadline]);
  } finally {
    clearTimeout(timer);
  }
}

// ============================================================
// 13.4.1 命名空间与描述截断
// ============================================================

test("工具名加 mcp__<server>__<tool> 命名空间前缀", () => {
  const { client } = makeFakeClient(() => ({ content: [] }));
  const tool = wrapMcpTool("project-analyzer", client, makeDef());
  assert.equal(tool.name, "mcp__project-analyzer__analyze_structure");
});

test("inputSchema 由 Server 原样透传给模型", () => {
  const { client } = makeFakeClient(() => ({ content: [] }));
  const def = makeDef();
  const tool = wrapMcpTool("srv", client, def);
  assert.equal(tool.inputSchema.type, "object");
  assert.deepEqual(tool.inputSchema.required, ["path"]);
  assert.equal(tool.inputSchema.properties.path?.type, "string");
});

test("描述缺省时退化为空串，不会变成 undefined", () => {
  const { client } = makeFakeClient(() => ({ content: [] }));
  const tool = wrapMcpTool("srv", client, makeDef({ description: undefined }));
  assert.equal(tool.description, "");
});

test("超长描述截断到 2048 字符并加 [truncated] 标记", () => {
  const { client } = makeFakeClient(() => ({ content: [] }));
  const tool = wrapMcpTool("srv", client, makeDef({ description: "x".repeat(5000) }));
  assert.equal(tool.description, "x".repeat(2048) + "… [truncated]");
});

test("未超长的描述保持原样", () => {
  const { client } = makeFakeClient(() => ({ content: [] }));
  const desc = "x".repeat(2048);
  const tool = wrapMcpTool("srv", client, makeDef({ description: desc }));
  assert.equal(tool.description, desc);
});

// ============================================================
// isReadOnly：默认不信任 Server 自述
// ============================================================

test("没有 annotations 时 isReadOnly 为 false（默认走权限闸门）", () => {
  const { client } = makeFakeClient(() => ({ content: [] }));
  assert.equal(wrapMcpTool("srv", client, makeDef()).isReadOnly, false);
});

test("readOnlyHint 为 false 或缺省时 isReadOnly 仍为 false", () => {
  const { client } = makeFakeClient(() => ({ content: [] }));
  const hintFalse = wrapMcpTool("srv", client, makeDef({ annotations: { readOnlyHint: false } }));
  const noHint = wrapMcpTool("srv", client, makeDef({ annotations: { title: "t" } }));
  assert.equal(hintFalse.isReadOnly, false);
  assert.equal(noHint.isReadOnly, false);
});

test("readOnlyHint 严格等于 true 才采信为只读", () => {
  const { client } = makeFakeClient(() => ({ content: [] }));
  const tool = wrapMcpTool("srv", client, makeDef({ annotations: { readOnlyHint: true } }));
  assert.equal(tool.isReadOnly, true);
});

// ============================================================
// execute：本地调用 → tools/call → ToolResult
// ============================================================

test("execute 发给 Server 的是不带前缀的原始工具名与原始参数", async () => {
  const { client, calls } = makeFakeClient(() => ({ content: [{ type: "text", text: "ok" }] }));
  const tool = wrapMcpTool("project-analyzer", client, makeDef());
  await tool.execute({ path: "src" }, "/tmp");
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.name, "analyze_structure");
  assert.deepEqual(calls[0]?.arguments, { path: "src" });
});

test("多个 text 块按换行拼接，非 text 块留一行占位说明", async () => {
  const { client } = makeFakeClient(() => ({
    content: [
      { type: "text", text: "line1" },
      { type: "image", data: "AAAA", mimeType: "image/png" },
      { type: "text", text: "line2" },
    ],
  }));
  const tool = wrapMcpTool("srv", client, makeDef());
  const result = await tool.execute({}, "/tmp");
  assert.equal(result.content, "line1\n[non-text content: image/png]\nline2");
  assert.equal(result.isError, false);
});

// 缺陷 3 回归：截图类 Server 只返回 image 块时，模型不能收到空串还以为"什么都没有"。
test("纯非 text 内容不会被静默丢成空串", async () => {
  const { client } = makeFakeClient(() => ({
    content: [{ type: "image", data: "AAAA", mimeType: "image/png" }],
  }));
  const tool = wrapMcpTool("srv", client, makeDef());
  const result = await tool.execute({}, "/tmp");
  assert.notEqual(result.content, "");
  assert.equal(result.content, "[non-text content: image/png]");
  assert.equal(result.isError, false);
});

test("非 text 块没带 mimeType 时退回块类型名", async () => {
  const { client } = makeFakeClient(() => ({
    content: [{ type: "resource_link", uri: "file:///tmp/a.txt" }],
  }));
  const tool = wrapMcpTool("srv", client, makeDef());
  const result = await tool.execute({}, "/tmp");
  assert.equal(result.content, "[non-text content: resource_link]");
});

test("content 不是数组时拼成空串，不抛异常", async () => {
  const { client } = makeFakeClient(() => ({ content: undefined }));
  const tool = wrapMcpTool("srv", client, makeDef());
  const result = await tool.execute({}, "/tmp");
  assert.equal(result.content, "");
  assert.equal(result.isError, false);
});

test("Server 返回 isError 为 true 时如实透传", async () => {
  const { client } = makeFakeClient(() => ({
    content: [{ type: "text", text: "boom" }],
    isError: true,
  }));
  const tool = wrapMcpTool("srv", client, makeDef());
  const result = await tool.execute({}, "/tmp");
  assert.equal(result.content, "boom");
  assert.equal(result.isError, true);
});

test("协议层抛错被翻成 isError 的 ToolResult，而不是冒泡崩掉循环", async () => {
  const { client } = makeFakeClient(() => {
    throw new Error("connection closed");
  });
  const tool = wrapMcpTool("srv", client, makeDef());
  const result = await tool.execute({}, "/tmp");
  assert.equal(result.isError, true);
  assert.equal(result.content, "MCP tool call failed: connection closed");
});

// ============================================================
// 与本地 ToolRegistry 同构：包装后可直接注册
// ============================================================

test("包装后的远程工具能注册进同一个 ToolRegistry 并出现在 API 格式里", () => {
  const { client } = makeFakeClient(() => ({ content: [] }));
  const registry = new ToolRegistry();
  registry.register(wrapMcpTool("project-analyzer", client, makeDef()));
  const names = registry.toAPIFormat().map((t) => t.name);
  assert.deepEqual(names, ["mcp__project-analyzer__analyze_structure"]);
  assert.ok(registry.get("mcp__project-analyzer__analyze_structure"));
});

test("不同 Server 的同名工具因前缀不同而不撞车", () => {
  const { client } = makeFakeClient(() => ({ content: [] }));
  const registry = new ToolRegistry();
  registry.register(wrapMcpTool("a", client, makeDef()));
  registry.register(wrapMcpTool("b", client, makeDef()));
  assert.equal(registry.getAll().length, 2);
});

// ============================================================
// 缺陷 1 回归：失败路径必须回收连接，否则 fork 出去的子进程活到 Agent 退出
// ============================================================

test("握手成功但 listTools 报错时，client 和 transport 都被关掉", async () => {
  const { client, transport, closed } = makeFakeConnection({
    listTools: async () => {
      throw new Error("tools/list exploded");
    },
  });

  await assert.rejects(
    () => handshakeAndFetchTools("fake", client, transport, 1_000),
    /tools\/list exploded/,
  );
  assert.ok(closed.includes("client"), "client.close() 没被调用 → 连接泄漏");
  assert.ok(closed.includes("transport"), "transport.close() 没被调用 → 子进程泄漏");
});

test("超时路径同样关掉 client 和 transport", async () => {
  const { client, transport, closed } = makeFakeConnection({
    // 永远不 resolve，模拟 Server 卡在握手上
    connect: () => new Promise<void>(() => {}),
  });

  await assert.rejects(
    () => handshakeAndFetchTools("stuck", client, transport, 20),
    /connection timed out/,
  );
  assert.ok(closed.includes("client"), "超时后 client.close() 没被调用");
  assert.ok(closed.includes("transport"), "超时后 transport.close() 没被调用");
});

test("成功路径不会误关连接", async () => {
  const { client, transport, closed } = makeFakeConnection({
    listTools: async () => ({ tools: [makeDef()] }),
  });
  const originalLog = console.log;
  console.log = () => {};
  try {
    const connected = await handshakeAndFetchTools("ok", client, transport, 1_000);
    assert.equal(connected.tools.length, 1);
  } finally {
    console.log = originalLog;
  }
  assert.deepEqual(closed, []);
});

// ============================================================
// 缺陷 2 回归：stderr 设成 pipe 就必须有人读，否则话痨 Server 卡死在握手阶段
// ============================================================

test("Server 在握手前狂打 500KB stderr 也不会被背压卡住", async () => {
  const stderr = new PassThrough();
  const captured: string[] = [];
  const originalWrite = process.stderr.write.bind(process.stderr);
  // 转发目标换成内存数组，免得测试输出被 500KB 日志淹掉
  process.stderr.write = ((chunk: string | Uint8Array): boolean => {
    captured.push(String(chunk));
    return true;
  }) as typeof process.stderr.write;

  let drained = false;
  try {
    forwardServerStderr("chatty", stderr);

    const banner = "starting up...\n".repeat(512); // 约 7.5KB 一块
    const writeAll = (async () => {
      for (let i = 0; i < 68; i++) {
        // write 的回调只在数据真被消费掉之后才触发；没人读时会停在 ~56KB
        await new Promise<void>((resolve) => {
          stderr.write(banner, () => resolve());
        });
      }
      return true;
    })();
    drained = await withDeadline(writeAll, 1_000, false);
  } finally {
    process.stderr.write = originalWrite;
  }

  assert.equal(drained, true, "stderr 没被消费 → 子进程写日志时被阻塞，握手永远完不成");
  assert.ok(captured.length > 0, "stderr 内容应转发到本进程 stderr");
  assert.ok(
    captured.every((line) => line.startsWith("[MCP:chatty] ")),
    "转发出去的每一行都应带 [MCP:<name>] 前缀",
  );
});

test("transport 没有 stderr（inherit 模式）时 forwardServerStderr 直接返回", () => {
  assert.doesNotThrow(() => forwardServerStderr("srv", null));
});

// 上面那条只证明了 forwardServerStderr 自己会消费；把 connectMcpServer 里那行调用删掉，
// 它照样绿 —— 而缺陷 2 的落点恰恰是"没人把消费者接上去"。所以这里用真子进程守住调用点：
// 无人消费时，整条管道（OS pipe + child.stderr + SDK 的 PassThrough）实测只吃得下 196608 字节，
// 之后子进程就永远阻塞在 write 上，initialize 响应永远发不出来。
test("connectMcpServer 真的接上了 stderr 消费者：话痨 Server 的 1MB 启动日志能全部流干", async () => {
  const TARGET_BYTES = 1024 * 1024; // 远大于实测的 192KB 阻塞点
  const LINES = TARGET_BYTES / 1024;
  // 子进程扮演"启动时先狂打 banner"的 Server：每块写完（回调触发）才写下一块，
  // 所以管道一满它就真的卡住，而不是把日志攒在自己内存里。
  const childScript = `
    setTimeout(() => process.exit(2), 8000); // 兜底：卡死时也不留孤儿进程
    const line = "x".repeat(1023) + "\\n";
    let i = 0;
    (function step() {
      if (i++ >= ${LINES}) return process.exit(0);
      process.stderr.write(line, step);
    })();
  `;

  let forwarded = 0;
  let firstChunk = "";
  const originalWrite = process.stderr.write.bind(process.stderr);
  process.stderr.write = ((chunk: string | Uint8Array): boolean => {
    if (firstChunk === "") firstChunk = String(chunk);
    forwarded += chunk.length;
    return true;
  }) as typeof process.stderr.write;

  let stop = false;
  try {
    // 这个 Server 只打日志、从不回 initialize，连接注定失败；
    // 我们只关心 stderr 有没有被抽干（顺带也真跑了一遍失败路径的资源回收）。
    const pending = connectMcpServer("chatty", {
      command: process.execPath,
      args: ["-e", childScript],
    }).then(
      () => undefined,
      () => undefined,
    );

    const drained = await withDeadline(
      (async () => {
        while (forwarded < TARGET_BYTES) {
          if (stop) return false;
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
        return true;
      })(),
      5_000,
      false,
    );
    stop = true; // 让轮询循环收工，别留着一个永不结束的 async 任务

    assert.equal(
      drained,
      true,
      `connectMcpServer 没消费 transport.stderr：只流出 ${forwarded} 字节就被背压卡住了`,
    );
    assert.ok(firstChunk.startsWith("[MCP:chatty] "), "转发出去的行应带 [MCP:<name>] 前缀");
    await pending; // 子进程写完即退出 → 连接失败 → closeQuietly 已回收，进程不残留
  } finally {
    stop = true;
    process.stderr.write = originalWrite;
  }
});

// ============================================================
// 13.5.3 fail-soft：一个 Server 连不上不阻塞其它注册
// ============================================================

test("registerMcpServers 连接失败时只打警告，不抛错、不影响已有工具", async () => {
  const registry = new ToolRegistry();
  const { client } = makeFakeClient(() => ({ content: [] }));
  registry.register(wrapMcpTool("existing", client, makeDef()));

  const errors: string[] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    errors.push(args.map(String).join(" "));
  };
  try {
    // 命令不存在 → 子进程 spawn 立即失败 → connect() 拒绝（不会真连上任何 Server）。
    await registerMcpServers(registry, {
      broken: { command: "mini-agent-no-such-binary-xyz", args: [] },
    });
  } finally {
    console.error = originalError;
  }

  assert.equal(errors.length, 1);
  assert.match(errors[0] ?? "", /^\[MCP\] Failed to connect "broken": /);
  // 原有工具没被牵连
  assert.equal(registry.getAll().length, 1);
});
