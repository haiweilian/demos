// src/mcp/mcpTool.ts
// 对应 Claude Code: src/tools/MCPTool/MCPTool.ts 的 buildTool()
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { Tool as MCPToolDef } from "@modelcontextprotocol/sdk/types.js";
import type { Tool, ToolInputSchema, ToolResult } from "../types.js";

const MAX_MCP_DESCRIPTION_LENGTH = 2048;

/** 命名空间前缀：mcp__<server>__<tool>，防撞名（对应 13.4.1；Claude Code 版还会做名字归一化，教学版直接拼）。 */
function buildMcpToolName(serverName: string, toolName: string): string {
  return `mcp__${serverName}__${toolName}`;
}

/**
 * 把单个 content 块转成文本。
 * text 块取正文；image/audio/resource 等非 text 块**不能静默丢弃**——
 * 丢了之后模型收到的是空串却看到 isError=false，会当成"Server 说没有内容"继续推理。
 * 给一句可读的占位说明，至少让模型知道"有东西，只是我看不了"。
 */
function describeBlock(block: unknown): string {
  if (typeof block !== "object" || block === null) return "";
  const b = block as { type?: unknown; text?: unknown; mimeType?: unknown };
  if (b.type === "text") return typeof b.text === "string" ? b.text : "";
  // 优先报 mimeType（image/png 这种最具体），没有就退回块类型名。
  const label = typeof b.mimeType === "string" ? b.mimeType : String(b.type ?? "unknown");
  return `[non-text content: ${label}]`;
}

/** 把 MCP 返回的 content 块数组拼成一段文本。 */
function joinTextBlocks(content: unknown): string {
  if (!Array.isArray(content)) return "";
  return content
    .map(describeBlock)
    .filter((line) => line.length > 0)
    .join("\n");
}

/** 把一个远程 MCP 工具定义，包装成 MiniAgent 的本地 Tool——就是[第 1 章]第④问承诺的"适配器"。 */
export function wrapMcpTool(
  serverName: string,
  client: Client,
  def: MCPToolDef,
): Tool {
  // 描述截断：防止自动生成的 Server 塞几十 KB 文档进上下文（逻辑同 13.4.1）。
  const rawDesc = def.description ?? "";
  const description =
    rawDesc.length > MAX_MCP_DESCRIPTION_LENGTH
      ? rawDesc.slice(0, MAX_MCP_DESCRIPTION_LENGTH) + "… [truncated]"
      : rawDesc;

  return {
    name: buildMcpToolName(serverName, def.name),
    description,
    // inputSchema 由 Server 定义，直接透传给模型（缺省给个空 object）。
    inputSchema: (def.inputSchema as ToolInputSchema) ?? { type: "object", properties: {}, required: [] },

    // 关键：远程工具一律按"可能有副作用"处理。readOnlyHint 是 Server 的"自述"，不可全信——
    // 默认进权限闸门（第 11 章），只有 Server 明确声明才放宽。
    isReadOnly: def.annotations?.readOnlyHint === true,

    // execute：把本地调用翻译成一次 tools/call，再把结果转回 ToolResult。
    async execute(args: Record<string, unknown>, _cwd: string): Promise<ToolResult> {
      try {
        const result = await client.callTool({
          name: def.name, // 注意：发给 Server 的是原始名，不带 mcp__ 前缀
          arguments: args,
        });
        return { content: joinTextBlocks(result.content), isError: result.isError === true };
      } catch (err) {
        // 协议层错误（连接断了、Server 崩了）也翻成 ToolResult，让结果回路照常走。
        const msg = err instanceof Error ? err.message : String(err);
        return { content: `MCP tool call failed: ${msg}`, isError: true };
      }
    },
  };
}
