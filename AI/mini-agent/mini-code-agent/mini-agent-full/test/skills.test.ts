import { test } from "node:test";
import assert from "node:assert/strict";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { parseFrontmatter } from "../src/skills/frontmatter.js";
import { loadSkillsFromDir } from "../src/skills/loader.js";
import { createSkillRegistry, SkillRegistry } from "../src/skills/registry.js";
import { getBuiltinSkills } from "../src/skills/builtin.js";
import { formatSkillMenu } from "../src/skills/prompt.js";
import { activateSkill } from "../src/skills/activate.js";
import { createSkillTool } from "../src/tools/skillTool.js";
import { ContextManager } from "../src/context.js";

// ============================================================
// 测试夹具：临时目录里造 skill，测完清理；全程不联网、不读 API key
// ============================================================

const REVIEW_SKILL = `---
description: 代码审查助手
when_to_use: 当用户要求审查改动时
allowed-tools: ["ReadFile", "Search", "RunCommand"]
---
你是代码审查专家。目录=\${SKILL_DIR}，目标=$ARGUMENTS。
`;

/** 建一个临时目录并注册清理。 */
async function makeTmpDir(t: { after(fn: () => void | Promise<void>): void }): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "miniagent-skills-"));
  t.after(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });
  return dir;
}

/** 在 <baseDir>/<name>/SKILL.md 写一个 skill。 */
async function writeSkill(baseDir: string, name: string, content: string): Promise<string> {
  const dir = path.join(baseDir, name);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "SKILL.md"), content, "utf-8");
  return dir;
}

/** 构造 ContextManager 不会发起网络请求，这里只测纯逻辑。 */
function newCtx(): ContextManager {
  return new ContextManager("system prompt", new Anthropic({ apiKey: "test-key" }));
}

// ============================================================
// frontmatter 解析
// ============================================================

test("frontmatter：解析标量与字符串数组", () => {
  const { frontmatter, body } = parseFrontmatter(REVIEW_SKILL);
  assert.equal(frontmatter.description, "代码审查助手");
  assert.equal(frontmatter.when_to_use, "当用户要求审查改动时");
  assert.deepEqual(frontmatter["allowed-tools"], ["ReadFile", "Search", "RunCommand"]);
  assert.ok(body.startsWith("你是代码审查专家。"));
});

test("frontmatter：没有 frontmatter 时原样返回正文", () => {
  const { frontmatter, body } = parseFrontmatter("just a body\nline2");
  assert.deepEqual(frontmatter, {});
  assert.equal(body, "just a body\nline2");
});

test("frontmatter：只有一个 --- 时不当作 frontmatter", () => {
  const raw = "---\ndescription: 半截\n没有闭合分隔符";
  const { frontmatter, body } = parseFrontmatter(raw);
  assert.deepEqual(frontmatter, {});
  assert.equal(body, raw);
});

// ============================================================
// loader 容错
// ============================================================

test("loader：目录不存在时静默返回空数组", async () => {
  const skills = await loadSkillsFromDir("/definitely/not/a/real/dir", "project");
  assert.deepEqual(skills, []);
});

test("loader：跳过缺 SKILL.md 的目录与散落的单文件", async (t) => {
  const base = await makeTmpDir(t);
  await fs.mkdir(path.join(base, "empty-dir"), { recursive: true });
  await fs.writeFile(path.join(base, "loose.md"), "not a skill", "utf-8");
  await writeSkill(base, "review", REVIEW_SKILL);

  const skills = await loadSkillsFromDir(base, "project");
  assert.deepEqual(skills.map((s) => s.name), ["review"]);
  assert.equal(skills[0]!.source, "project");
  assert.equal(skills[0]!.description, "代码审查助手");
  assert.deepEqual(skills[0]!.allowedTools, ["ReadFile", "Search", "RunCommand"]);
});

test("loader：frontmatter 缺字段时给安全默认值", async (t) => {
  const base = await makeTmpDir(t);
  await writeSkill(base, "bare", "没有 frontmatter 的正文");

  const [skill] = await loadSkillsFromDir(base, "user");
  assert.equal(skill!.description, "(no description)");
  assert.equal(skill!.whenToUse, undefined);
  assert.deepEqual(skill!.allowedTools, []); // 空 = 不收束
});

// ============================================================
// 延迟求值：加载时不拼正文，调用 getContent 才拼
// ============================================================

test("延迟求值：loadSkillsFromDir 之后 getContent 尚未被调用", async (t) => {
  const base = await makeTmpDir(t);
  const skillDir = await writeSkill(base, "review", REVIEW_SKILL);

  const [skill] = await loadSkillsFromDir(base, "project");
  assert.ok(skill);

  // 加载完成后对象上只有轻量元数据，没有任何"已求值正文"字段——
  // 正文既不是自有属性，也不会出现在可序列化的数据里。
  assert.equal(Object.prototype.hasOwnProperty.call(skill, "content"), false);
  assert.ok(!JSON.stringify(skill).includes("你是代码审查专家"));
  assert.equal(typeof skill.getContent, "function");

  // 同一个 Skill 对象，两次不同 args 得到两份不同正文：
  // 说明替换发生在调用那一刻，而不是加载时就固化了。
  const first = await skill.getContent("a.ts");
  const second = await skill.getContent("b.ts");
  assert.ok(first.includes("目标=a.ts"));
  assert.ok(second.includes("目标=b.ts"));
  assert.notEqual(first, second);
  assert.ok(first.includes(`目录=${skillDir}`));
});

test("变量替换：$ARGUMENTS 与 ${SKILL_DIR} 都被替换，且无参数时替换为空串", async (t) => {
  const base = await makeTmpDir(t);
  const skillDir = await writeSkill(base, "review", REVIEW_SKILL);

  const [skill] = await loadSkillsFromDir(base, "project");
  const body = await skill!.getContent("");
  assert.ok(!body.includes("$ARGUMENTS"));
  assert.ok(!body.includes("${SKILL_DIR}"));
  assert.ok(body.includes(`目录=${skillDir}`));
  assert.ok(body.includes("目标=。"));
});

// ============================================================
// 注册表：三来源优先级 builtin < user < project
// ============================================================

/** 在临时 HOME 下跑 createSkillRegistry（os.homedir() 在 POSIX 上读 $HOME）。 */
async function withHome<T>(home: string, fn: () => Promise<T>): Promise<T> {
  const saved = process.env.HOME;
  process.env.HOME = home;
  try {
    return await fn();
  } finally {
    if (saved === undefined) delete process.env.HOME;
    else process.env.HOME = saved;
  }
}

test("registry：add 同名覆盖，get/getAll 可用", () => {
  const registry = new SkillRegistry();
  const [verify, commit] = getBuiltinSkills();
  registry.add(verify!);
  registry.add(commit!);
  registry.add({ ...verify!, description: "覆盖后的描述", source: "project" });

  assert.equal(registry.getAll().length, 2); // 同名不新增
  assert.equal(registry.get("verify")!.description, "覆盖后的描述");
  assert.equal(registry.get("verify")!.source, "project");
  assert.equal(registry.get("nope"), undefined);
});

test("registry：只有内置来源时，内置 skill 全在", async (t) => {
  const root = await makeTmpDir(t);
  const home = path.join(root, "home");
  const project = path.join(root, "project");
  await fs.mkdir(home, { recursive: true });
  await fs.mkdir(project, { recursive: true });

  const registry = await withHome(home, () => createSkillRegistry(project));
  assert.deepEqual(registry.getAll().map((s) => s.name).sort(), ["commit", "verify"]);
  assert.equal(registry.get("verify")!.source, "builtin");
});

test("registry：user 覆盖 builtin，project 覆盖 user", async (t) => {
  const root = await makeTmpDir(t);
  const home = path.join(root, "home");
  const project = path.join(root, "project");
  const userSkills = path.join(home, ".miniagent", "skills");
  const projectSkills = path.join(project, ".miniagent", "skills");

  // 用户级同名覆盖内置 verify，并新增一个只有用户级才有的 skill
  await writeSkill(userSkills, "verify", "---\ndescription: 用户版 verify\n---\n用户正文");
  await writeSkill(userSkills, "onlyuser", "---\ndescription: 仅用户级\n---\n正文");

  const afterUser = await withHome(home, () => createSkillRegistry(project));
  assert.equal(afterUser.get("verify")!.source, "user");
  assert.equal(afterUser.get("verify")!.description, "用户版 verify");
  assert.equal(afterUser.get("onlyuser")!.source, "user");
  assert.equal(afterUser.get("commit")!.source, "builtin"); // 没被覆盖的内置仍在

  // 项目级再覆盖同名的 verify，优先级最高
  await writeSkill(projectSkills, "verify", "---\ndescription: 项目版 verify\n---\n正文");
  await writeSkill(projectSkills, "review", REVIEW_SKILL);

  const afterProject = await withHome(home, () => createSkillRegistry(project));
  assert.equal(afterProject.get("verify")!.source, "project");
  assert.equal(afterProject.get("verify")!.description, "项目版 verify");
  assert.equal(afterProject.get("review")!.source, "project");
  assert.equal(afterProject.get("onlyuser")!.source, "user"); // 用户级未被覆盖的保留
  assert.deepEqual(
    afterProject.getAll().map((s) => s.name).sort(),
    ["commit", "onlyuser", "review", "verify"],
  );
});

// ============================================================
// 菜单：只放 name + description，绝不放正文
// ============================================================

test("formatSkillMenu：只输出元数据，不含正文", () => {
  const menu = formatSkillMenu(getBuiltinSkills());
  assert.ok(menu.includes("## Available Skills"));
  assert.ok(menu.includes("- verify: 完成前自检"));
  assert.ok(menu.includes("(use when: 当你认为任务已完成"));
  assert.ok(!menu.includes("你正处于「完成前验证」模式")); // 正文不进菜单
  assert.equal(formatSkillMenu([]), "");
});

// ============================================================
// 两条入口合流：activateSkill 是唯一真相源
// ============================================================

test("activateSkill：返回 <skill-instructions> 标签包裹的正文（纯函数，不碰对话）", async (t) => {
  const base = await makeTmpDir(t);
  await writeSkill(base, "review", REVIEW_SKILL);
  const [skill] = await loadSkillsFromDir(base, "project");

  const content = await activateSkill(skill!, "src/cli.ts");

  assert.ok(content.startsWith('<skill-instructions name="review">\n'));
  assert.ok(content.endsWith("\n</skill-instructions>"));
  assert.ok(content.includes("目标=src/cli.ts"));
});

test("SkillTool：Skill 正文原样落在 ToolResult.content 里，与 activateSkill 逐字节一致", async (t) => {
  const base = await makeTmpDir(t);
  await writeSkill(base, "review", REVIEW_SKILL);
  const [skill] = await loadSkillsFromDir(base, "project");

  const registry = new SkillRegistry();
  registry.add(skill!);

  // 入口 A：模型调 Skill 工具 —— 正文进 tool_result
  const toolCtx = newCtx();
  const tool = createSkillTool(registry, toolCtx);
  const result = await tool.execute({ skill: "/review", args: "src/cli.ts" }, base);
  assert.equal(result.isError, false);

  // 入口 B：用户敲 /review —— cli.ts 拿同一个字符串自己 addMessage
  const instructions = await activateSkill(skill!, "src/cli.ts");
  assert.ok(result.content.startsWith(instructions)); // 两条入口逐字节一致
  assert.ok(result.content.includes("prefer using only: ReadFile, Search, RunCommand."));
});

// ============================================================
// 消息顺序回归：Skill 工具绝不能在工具执行阶段往对话里插消息
// （第 7 章铁律一：tool_use 与 tool_result 不能拆散，否则下一轮 API 400）
// ============================================================

test("SkillTool：execute 不往 ContextManager 追加任何消息", async (t) => {
  const base = await makeTmpDir(t);
  await writeSkill(base, "review", REVIEW_SKILL);
  const [skill] = await loadSkillsFromDir(base, "project");

  const registry = new SkillRegistry();
  registry.add(skill!);

  const ctx = newCtx();
  const tool = createSkillTool(registry, ctx);
  const result = await tool.execute({ skill: "review", args: "src/cli.ts" }, base);

  // 唯一的出口是 ToolResult.content，对话状态一动不动
  assert.equal(ctx.getMessages().length, 0);
  assert.ok(result.content.includes('<skill-instructions name="review">'));
  assert.ok(result.content.includes("目标=src/cli.ts")); // 延迟求值后的正文确实在里面
});

test("SkillTool：tool_use 之后紧跟的那条消息仍以 tool_result 开头", async (t) => {
  const base = await makeTmpDir(t);
  await writeSkill(base, "review", REVIEW_SKILL);
  const [skill] = await loadSkillsFromDir(base, "project");

  const registry = new SkillRegistry();
  registry.add(skill!);

  // 复刻 Agent 循环的时序：assistant(tool_use) 先入列 → 执行工具 → 本轮末尾才拼 tool_result
  const ctx = newCtx();
  const tool = createSkillTool(registry, ctx);
  ctx.addMessage({
    role: "assistant",
    content: [
      { type: "tool_use", id: "toolu_1", name: "Skill", input: { skill: "review" } },
    ],
  });

  const result = await tool.execute({ skill: "review", args: "" }, base);

  ctx.addMessage({
    role: "user",
    content: [
      { type: "tool_result", tool_use_id: "toolu_1", content: result.content, is_error: false },
    ],
  });

  // 修复前这里会是 3 条（中间夹一条裸的 user 文本消息），下一轮请求必 400
  const messages = ctx.getMessages();
  assert.equal(messages.length, 2);
  const next = messages[1]!;
  assert.equal(next.role, "user");
  assert.ok(Array.isArray(next.content));
  const firstBlock = (next.content as { type: string }[])[0]!;
  assert.equal(firstBlock.type, "tool_result");
});

test("SkillTool：找不到 skill 时短路失败并列出可用名", async () => {
  const registry = new SkillRegistry();
  for (const s of getBuiltinSkills()) registry.add(s);

  const ctx = newCtx();
  const tool = createSkillTool(registry, ctx);
  const result = await tool.execute({ skill: "nope" }, process.cwd());

  assert.equal(result.isError, true);
  assert.ok(result.content.includes('Skill not found: "nope"'));
  assert.ok(result.content.includes("verify, commit"));
  assert.equal(ctx.getMessages().length, 0); // 失败不注入任何消息
});

test("SkillTool：是只读工具，且 args 可省略", async () => {
  const registry = new SkillRegistry();
  for (const s of getBuiltinSkills()) registry.add(s);

  const ctx = newCtx();
  const tool = createSkillTool(registry, ctx);
  assert.equal(tool.name, "Skill");
  assert.equal(tool.isReadOnly, true);
  assert.deepEqual(tool.inputSchema.required, ["skill"]);

  const result = await tool.execute({ skill: "verify" }, process.cwd());
  assert.equal(result.isError, false);
  assert.ok(result.content.includes("你正处于「完成前验证」模式"));
  assert.ok(!result.content.includes("本次要验证的重点")); // 无参数时不追加那一行
});
