// src/tools/skillTool.ts
// 对应 Claude Code: src/tools/SkillTool/SkillTool.ts
//   （validateInput → checkPermissions → call 三步流水线）

import type { Tool, ToolResult } from "../types.js";
import type { SkillRegistry } from "../skills/registry.js";
import { activateSkill } from "../skills/activate.js";

// 这个工具**不碰 ContextManager**，所以工厂函数也不需要它。
// 原因见 skills/activate.ts 顶部的注释：工具执行阶段 addMessage 会把
// assistant(tool_use) 和 user(tool_result) 拆开，违反第 7 章铁律一，
// 下一轮请求必 400。Skill 正文改从 ToolResult.content 返回。
export function createSkillTool(registry: SkillRegistry): Tool {
  return {
    name: "Skill",
    description: "Invoke a reusable skill (a predefined workflow). " +
      "The skill's instructions will be injected to guide your next steps.",
    isReadOnly: true, // 它只注入 prompt，不直接改文件系统
    inputSchema: {
      type: "object",
      properties: {
        skill: {
          type: "string",
          description: "The name of the skill to invoke (e.g. \"review\").",
        },
        args: {
          type: "string",
          description: "Optional arguments passed to the skill (e.g. a file path).",
        },
      },
      required: ["skill"],
    },

    async execute(args: Record<string, unknown>): Promise<ToolResult> {
      const name = String(args.skill ?? "").trim().replace(/^\//, "");
      const skillArgs = String(args.args ?? "");

      // 1. 查找：找不到就短路失败，并把可用 skill 名列出来
      const skill = registry.get(name);
      if (!skill) {
        const available = registry.getAll().map((s) => s.name).join(", ");
        return { isError: true, content: `Skill not found: "${name}". Available: ${available}` };
      }

      // 2. 延迟求值正文 + 拼标签：统一走 activateSkill，
      //    与 cli.ts 里用户敲 /review 那条入口共用同一段逻辑，两边逐字节一致。
      const instructions = await activateSkill(skill, skillArgs);

      // 3. 把 Skill 正文**作为 tool_result 的内容返回**，而不是另起一条 user 消息。
      //    tool_result 正是本轮 tool_use 的合法后继，模型照样读得到这段正文，
      //    消息序列也不会被拆散（对比第 7 章铁律一）。
      // 4. 末尾附上工具收束的软提示（allowedTools）。
      const toolNote = skill.allowedTools.length > 0
        ? `\nFor this skill, prefer using only: ${skill.allowedTools.join(", ")}.`
        : "";
      return { isError: false, content: `${instructions}${toolNote}` };
    },
  };
}
