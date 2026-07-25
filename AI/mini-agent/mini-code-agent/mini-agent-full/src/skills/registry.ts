// src/skills/registry.ts
// 对应 Claude Code: getSkillDirCommands()（用 dedupByRealpath 合并多来源，
//   按 managed > project > user > bundled 确定优先级）

import * as os from "os";
import * as path from "path";
import type { Skill } from "./types.js";
import { getBuiltinSkills } from "./builtin.js";
import { loadSkillsFromDir } from "./loader.js";

/**
 * Skill 注册表。用 Map 按 name 索引，同名时后加入的覆盖先加入的——
 * 所以加载顺序即优先级。
 */
export class SkillRegistry {
  private skills = new Map<string, Skill>();

  /**
   * 注册（同名覆盖）。后注册的优先级更高。
   *
   * 书中示例把它写成 private、用 `(registry as any).add(...)` 绕过，
   * 那只是为了让示例聚焦；这里按书里的建议把它设为内部可见（公开方法），
   * createSkillRegistry 直接调用即可。
   */
  add(skill: Skill): void {
    this.skills.set(skill.name, skill);
  }

  /** 按名字取一个 Skill（供 SkillTool 调用时查找）。 */
  get(name: string): Skill | undefined {
    return this.skills.get(name);
  }

  /** 取全部 Skill（供生成 system prompt 菜单）。 */
  getAll(): Skill[] {
    return Array.from(this.skills.values());
  }
}

/**
 * 构建默认注册表。加载顺序决定优先级——越靠后越优先（同名覆盖）：
 *   builtin（最低） → user → project（最高）
 * 这与"越接近调用现场越优先"的直觉一致，也和 MiniAgent 的
 * CLAUDE.md 加载规则（第 6 章）保持同一套心智模型。
 */
export async function createSkillRegistry(cwd: string): Promise<SkillRegistry> {
  const registry = new SkillRegistry();

  // 1. 内置 skill（最低优先级，但保证总是存在）
  for (const skill of getBuiltinSkills()) registry.add(skill);

  // 2. 用户级 ~/.miniagent/skills/（覆盖内置）
  const userDir = path.join(os.homedir(), ".miniagent", "skills");
  for (const skill of await loadSkillsFromDir(userDir, "user")) {
    registry.add(skill);
  }

  // 3. 项目级 <cwd>/.miniagent/skills/（最高优先级，覆盖前两者）
  const projectDir = path.join(cwd, ".miniagent", "skills");
  for (const skill of await loadSkillsFromDir(projectDir, "project")) {
    registry.add(skill);
  }

  return registry;
}
