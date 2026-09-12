// src/skills/builtin.ts
// 对应 Claude Code: src/skills/bundled/*.ts（编译期内置的核心 skill）

import type { Skill } from "./types.js";

/**
 * 内置 Skill。它们随程序发布，不需要磁盘文件，零 I/O 延迟。
 * 其中 verify 对应 Claude Code 真实存在的 bundled skill（verify / debug / simplify ...）；
 * commit 是本书自拟的演示 skill，用来示范"工具收束"，并非 Claude Code 原样内置。
 *
 * 内置 Skill 的 getContent 不读文件，正文直接写在代码里——但它
 * 仍然是延迟求值的（启动时不进上下文，调用时才返回），保持机制一致。
 */
export function getBuiltinSkills(): Skill[] {
  return [
    {
      name: "verify",
      description: "完成前自检：跑测试、检查输出，给出可验证的证据",
      whenToUse: "当你认为任务已完成、准备声明成功之前",
      allowedTools: ["RunCommand", "ReadFile"],
      source: "builtin",
      async getContent(args: string): Promise<string> {
        return [
          "你正处于「完成前验证」模式。在声明任务完成之前，请：",
          "1. 找到并运行相关测试（如 npm test / pytest），如实报告结果。",
          "2. 若无测试，至少跑一次构建或 lint，确认没有破坏。",
          "3. 把验证命令的真实输出贴出来，不要凭感觉说「应该没问题」。",
          args ? `\n本次要验证的重点：${args}` : "",
        ].join("\n");
      },
    },
    {
      name: "commit",
      description: "把当前改动整理成一次规范的 git 提交",
      whenToUse: "当用户要求提交代码时",
      // 收束工具：commit 期间只允许这几个，不放行 push/reset
      allowedTools: ["RunCommand", "ReadFile"],
      source: "builtin",
      async getContent(args: string): Promise<string> {
        return [
          "你正处于「规范提交」模式。请按以下步骤把当前改动整理成一次提交：",
          "1. 用 RunCommand 跑 git status 与 git diff，看清这次到底改了什么。",
          "2. 用一句话总结改动意图（why，而非逐条罗列 what）。",
          "3. git add 相关文件后 git commit，commit message 写清意图。",
          "4. 只到 commit 为止——不要 git push、不要 git reset，那超出本流程职责。",
          args ? `\n本次提交的范围/说明：${args}` : "",
        ].join("\n");
      },
    },
  ];
}
