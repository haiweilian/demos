// src/hooks/builtins.ts
// 内置钩子集合：权限拦截（PreToolUse）、项目信息注入（SessionStart）、操作审计（PostToolUse）。
// 三个钩子都在核心循环外面，runAgentLoop() 一个都不认识。

import * as fs from "fs/promises";
import * as path from "path";
import type { Hook } from "./types.js";
import type { PermissionDecision, PermissionMode } from "../permissions.js";
import {
  checkCommandPermission,
  checkWritePermission,
  askUserConfirmation,
} from "../permissions.js";

/** 把上一章的权限检查包装成一个 PreToolUse 钩子。消费第 11 章的三值决策
 *  （behavior: allow / deny / ask），其中 ask 沿用第 11 章的交互确认。
 *  做成工厂是为了把 permissionMode 闭包进来——上一章它来自 config.permissionMode。
 *  核心循环从此不认识"权限"，权限只是众多钩子之一。
 *
 *  第 11 章那四条不变量在这里逐条兑现（对照 12.5 的清单）：只读工具直接放行、
 *  未被专门识别的副作用工具默认 ask、Edit 与 WriteFile 复用同一条路径检查、
 *  拦不住就不放行（timeoutMs: Infinity + failClosed）。 */
export function makePermissionHook(mode: PermissionMode): Hook {
  return {
    name: "builtin:permission",
    event: "PreToolUse",
    // 人机确认没有上限：用户可能正在别的窗口核对那条命令，也可能离开了键盘。
    // 超时不能替用户回答"允许吗"，所以这个钩子显式豁免总线默认的 5000ms——
    // 否则用户犹豫超过 5 秒，withTimeout 就会 reject，工具反而照常执行。
    timeoutMs: Number.POSITIVE_INFINITY,
    // 双保险：万一将来有人给它配了有限超时，failClosed 让"超时/抛错"落到
    // 拦截而不是放行。权限是闸门，闸门坏了必须关死。
    failClosed: true,
    async callback(input) {
      if (input.event !== "PreToolUse") return; // 类型收窄
      const { toolName, toolInput, isReadOnly } = input;

      // 只读工具没有副作用，不必打断用户（第 1 章："isReadOnly 是承重墙"）
      if (isReadOnly) return;

      // fail-closed：任何未专门识别的副作用工具默认 ask，而不是 allow
      let decision: PermissionDecision = {
        behavior: "ask",
        reason: `执行有副作用的工具 ${toolName}: ${JSON.stringify(toolInput)}`,
      };
      if (toolName === "RunCommand" && typeof toolInput.command === "string") {
        decision = checkCommandPermission(toolInput.command, mode);
      } else if (
        (toolName === "WriteFile" || toolName === "Edit") &&
        typeof toolInput.file_path === "string"
      ) {
        decision = checkWritePermission(toolInput.file_path, mode);
      }

      // ask → 沿用上一章的交互确认；deny（含用户拒绝）→ 拦截
      let behavior = decision.behavior;
      if (behavior === "ask") {
        behavior = await askUserConfirmation(decision, toolName);
      }
      if (behavior === "deny") return { block: true, reason: decision.reason };
      // 返回 undefined = 放行
    },
  };
}

/** 一个补充上下文的 SessionStart 钩子：把项目 README 的头几行喂给模型当背景。
 *  这是"钩子反向喂数据给主流程"的最小示范。 */
export const projectInfoHook: Hook = {
  name: "builtin:project-info",
  event: "SessionStart",
  timeoutMs: 2000, // 读文件可能慢，给它独立的短超时
  async callback(input) {
    if (input.event !== "SessionStart") return;
    try {
      const readme = await fs.readFile(path.join(input.cwd, "README.md"), "utf-8");
      const head = readme.split("\n").slice(0, 10).join("\n");
      return { additionalContext: `Project README (first lines):\n${head}` };
    } catch {
      return; // 没有 README 就放行、不补充
    }
  },
};

/** 一个纯旁路的 PostToolUse 审计钩子：只记流水，不参与放行/拦截决策。 */
export const auditHook: Hook = {
  name: "builtin:audit",
  event: "PostToolUse",
  async callback(input) {
    if (input.event !== "PostToolUse") return; // 类型收窄
    if (input.toolName !== "WriteFile" && input.toolName !== "RunCommand") return;
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      tool: input.toolName,
      // 只记参数摘要，别把整个 content 写进日志（可能很大、可能含敏感数据）
      args: summarize(input.toolInput),
      error: input.isError,
    });
    await fs.appendFile("audit.log", line + "\n"); // 用异步 append，别阻塞
    // 不返回任何东西：审计不影响放行/拦截
  },
};

function summarize(input: Record<string, unknown>): string {
  const s = JSON.stringify(input);
  return s.length > 200 ? s.slice(0, 200) + "…" : s;
}
