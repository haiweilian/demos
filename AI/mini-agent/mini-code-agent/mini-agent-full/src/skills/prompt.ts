// src/skills/prompt.ts
// 对应 Claude Code: src/tools/SkillTool/prompt.ts
//   (formatCommandsWithinBudget——把 skill 列表压进预算)

import type { Skill } from "./types.js";

/**
 * 生成进 system prompt 的"轻量菜单"。
 *
 * 关键：这里只输出 name + description（+ whenToUse），绝不输出正文。
 * 这正是延迟加载的常驻部分——成本极低，让模型知道有哪些能力可选。
 *
 * Claude Code 在这一步还做了预算控制：当 skill 太多、菜单超过
 * 上下文窗口的某个百分比时，会逐级截断描述（内置 skill 保完整、
 * 第三方 skill 降级到只剩名字）。MiniAgent skill 数量可控，先不做
 * 预算截断——等菜单本身都嫌长了，再加截断逻辑（本章不实现）。
 */
export function formatSkillMenu(skills: Skill[]): string {
  if (skills.length === 0) return "";

  const lines = skills.map((s) => {
    const when = s.whenToUse ? ` (use when: ${s.whenToUse})` : "";
    return `- ${s.name}: ${s.description}${when}`;
  });

  return [
    "",
    "## Available Skills",
    "You can invoke a reusable skill via the Skill tool when appropriate.",
    "Only the skill names and summaries are listed here; invoking one will",
    "inject its full instructions into the conversation.",
    ...lines,
  ].join("\n");
}
