// src/skills/loader.ts
// 对应 Claude Code: src/skills/loadSkillsDir.ts（createSkillCommand 的闭包同样
//   捕获 markdown 文本 + baseDir，延迟到调用时做替换）

import * as fs from "fs/promises";
import * as path from "path";
import type { Skill, SkillSource } from "./types.js";
import { parseFrontmatter } from "./frontmatter.js";

async function loadOneSkill(
  skillDir: string,
  source: SkillSource,
): Promise<Skill | null> {
  const skillFile = path.join(skillDir, "SKILL.md");
  let content: string;
  try {
    content = await fs.readFile(skillFile, "utf-8");
  } catch {
    return null; // 目录里没有 SKILL.md：不是合法 skill，跳过
  }

  const { frontmatter, body: rawBody } = parseFrontmatter(content);
  const name = path.basename(skillDir);

  // 从 frontmatter 取三个字段，各自兜底（缺失时给安全默认值）
  const description = String(frontmatter.description ?? "(no description)");
  const whenToUse = frontmatter.when_to_use
    ? String(frontmatter.when_to_use)
    : undefined;
  const allowedTools = Array.isArray(frontmatter["allowed-tools"])
    ? (frontmatter["allowed-tools"] as string[])
    : []; // 为空 = 不收束

  return {
    name, description, whenToUse, allowedTools, source,
    // 关键一笔：我们在上面已经把 SKILL.md 文本读进了 rawBody，
    // 但拼正文（变量替换）被推迟到这个闭包里——它要等 SkillTool.execute
    // 调用时才执行。启动阶段只构造对象、持有 name/description，正文不进上下文。
    // （动手实践任务一：在下一行加 console.log("[lazy] reading skill body:", skillDir)，
    //   就能看到它启动时不打印、调用 /review 时才打印。）
    async getContent(args: string): Promise<string> {
      return substituteVariables(rawBody, { skillDir, args });
    },
  };
}

/** 变量替换：$ARGUMENTS（整段参数）、${SKILL_DIR}（skill 目录绝对路径）。 */
function substituteVariables(
  body: string,
  vars: { skillDir: string; args: string },
): string {
  return body
    .replace(/\$ARGUMENTS/g, vars.args)
    .replace(/\$\{SKILL_DIR\}/g, vars.skillDir);
}

/** 扫描一个 skills 根目录，加载其下所有 skill。 */
export async function loadSkillsFromDir(
  baseDir: string,
  source: SkillSource,
): Promise<Skill[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(baseDir);
  } catch {
    return []; // 目录不存在：返回空，不报错（用户可能根本没建 skills 目录）
  }

  const skills: Skill[] = [];
  for (const entry of entries) {
    const full = path.join(baseDir, entry);
    const stat = await fs.stat(full).catch(() => null);
    if (!stat?.isDirectory()) continue; // 只认目录格式 entry/SKILL.md
    const skill = await loadOneSkill(full, source);
    if (skill) skills.push(skill); // loadOneSkill 返回 null 的（无 SKILL.md）跳过
  }
  return skills;
}
