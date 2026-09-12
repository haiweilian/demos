// src/registry.ts
// 对应 Claude Code: src/tools.ts（getAllBaseTools / getTools / assembleToolPool）

import type { Tool } from "./types.js";

/**
 * 工具注册表。
 *
 * Claude Code 的工具注册方式是在 tools.ts 中硬编码一个数组（getAllBaseTools），
 * 然后通过 getTools() 和 assembleToolPool() 层层过滤：
 *
 *   getAllBaseTools() → 全量工具列表（含条件编译的工具）
 *   getTools(permCtx) → 过滤 deny 规则 + isEnabled 检查
 *   assembleToolPool(permCtx, mcpTools) → 合并 MCP 工具 + 去重
 *
 * 我们简化为一个 Map + register/get/getAll/toAPIFormat 四个方法。
 */
export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  /**
   * 注册一个工具。
   * 对应 Claude Code: getAllBaseTools() 数组中的每一项
   */
  register(tool: Tool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool already registered: ${tool.name}`);
    }
    this.tools.set(tool.name, tool);
  }

  /**
   * 按名称获取工具。
   * 对应 Claude Code: findToolByName()（src/Tool.ts 第 358-360 行）
   */
  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  /**
   * 获取所有已注册工具。
   * 对应 Claude Code: getTools()（src/tools.ts 第 271-327 行）
   */
  getAll(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * 将所有工具转换为 Anthropic API 需要的格式。
   * Claude Code 在 API 调用前也做同样的转换：
   *   Tool → { name, description, input_schema }
   */
  toAPIFormat(): Array<{
    name: string;
    description: string;
    input_schema: Tool["inputSchema"];
  }> {
    return this.getAll().map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema,
    }));
  }
}

// ============================================================
// 创建默认注册表（包含所有 5 个工具）
// ============================================================

import type { FeatureFlags } from "./featureFlags.js";
import { ReadFileTool } from "./tools/readFile.js";
import { WriteFileTool } from "./tools/writeFile.js";
import { EditFileTool } from "./tools/editFile.js";
import { RunCommandTool } from "./tools/runCommand.js";
import { SearchTool } from "./tools/search.js";
import { webFetchTool } from "./tools/webFetch.js"; // 第 19 章：本次要灰度的新工具

export function createDefaultRegistry(flags?: FeatureFlags): ToolRegistry {
  const registry = new ToolRegistry();
  registry.register(ReadFileTool);
  registry.register(WriteFileTool);
  registry.register(EditFileTool);
  registry.register(RunCommandTool);
  registry.register(SearchTool);

  // 第 19 章：新工具走灰度：默认关闭，flag 打开后才对用户可见。
  // 远程把 "web_fetch_enabled" 置 false，即可全网紧急下线，无需用户升级。
  if (flags?.getMaybeStale("web_fetch_enabled", false)) {
    registry.register(webFetchTool);
  }
  return registry;
}
