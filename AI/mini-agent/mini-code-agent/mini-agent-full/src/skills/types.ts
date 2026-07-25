// src/skills/types.ts
// 对应 Claude Code: src/types/command.ts（PromptCommand 类型）
//                   src/skills/loadSkillsDir.ts（加载与归一化）

/**
 * Skill 的来源。对应 Claude Code 的 LoadedFrom（它有更多种来源，
 * 见 16.7）。我们只区分内置和磁盘两类。
 */
export type SkillSource = "builtin" | "user" | "project";

/**
 * 一个 Skill 的"轻量元数据 + 延迟内容"。
 *
 * 关键设计：正文不是字段，而是 getContent() 方法——这是延迟加载的灵魂。
 * 启动时我们只持有 name / description（进菜单），getContent() 只在
 * 模型真正调用这个 Skill 时才执行（读文件 + 变量替换 + 拼正文）。
 *
 * 对应 Claude Code: PromptCommand.getPromptForCommand（异步、延迟求值）
 */
export interface Skill {
  /** 调用名，等于目录名，如 "review"。对应 Command.name */
  name: string;

  /** 一句话简介，进 system prompt 的"菜单"。对应 Command.description */
  description: string;

  /** 何时使用，提示模型选择。对应 Command.whenToUse */
  whenToUse?: string;

  /**
   * 这个 Skill 期间允许模型使用的工具白名单。
   * 为空表示不收束（沿用当前全部工具）。对应 Command.allowedTools
   */
  allowedTools: string[];

  /** 来源标记，用于显示与排序。对应 Command.source / loadedFrom */
  source: SkillSource;

  /**
   * 延迟求值的正文生成器。
   * args 是调用时传入的参数字符串（如 "src/main.ts"）。
   * 只有这一步会真正读文件、做变量替换——所以它是 async。
   * 对应 Claude Code: getPromptForCommand(args, context)
   */
  getContent(args: string): Promise<string>;
}
