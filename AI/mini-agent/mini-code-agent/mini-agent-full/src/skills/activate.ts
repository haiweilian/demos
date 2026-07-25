// src/skills/activate.ts
// 第 16 章动手实践任务二的正解：把"延迟求值 + 拼标签"封成唯一真相源，
// SkillTool（模型入口）与 cli.ts 的 /命令（用户入口）都调它，避免两条入口行为漂移。
//
// 注意它**只返回字符串、不碰 ContextManager**：正文放到哪里由调用方决定——
//   · SkillTool.execute：把它作为 ToolResult.content 返回，正文落进 tool_result 块；
//   · cli.ts 的 /命令分支：在两轮之间自己 context.addMessage({ role: "user", ... })。
// 原因见 16.5.1：工具执行发生在一轮的中段，此刻 assistant(tool_use) 已入列而
// tool_result 尚未回填，在这里 addMessage 会把这一对拆散（第 7 章铁律一），
// 下一轮请求必 400。归一的是"求值与拼装"，投递方式两边本来就该不同。

import type { Skill } from "./types.js";

/**
 * 激活一个 Skill：延迟求值正文 → 拼 <skill-instructions> 标签 → 返回给调用方。
 * 纯函数，不写任何对话状态。唯一真相源。
 */
export async function activateSkill(skill: Skill, args: string): Promise<string> {
  const body = await skill.getContent(args); // 延迟求值（兑现点）
  return `<skill-instructions name="${skill.name}">\n${body}\n</skill-instructions>`;
}
