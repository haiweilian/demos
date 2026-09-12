import { test } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import {
  applyDocPatch,
  canAutoApply,
  classifyDocRisk,
  createDocPatch,
  type DocPatch,
} from "../src/magicDocs.js";

const passedEvidence = [
  { command: "npm test", exitCode: 0, summary: "relevant test passed" },
];

function patch(overrides: Partial<DocPatch> = {}): DocPatch {
  return createDocPatch({
    filePath: "examples/usage.md",
    reason: "CLI 示例与已验证参数保持一致",
    oldText: "mini-agent --dir .",
    newText: "mini-agent --cwd .",
    evidence: passedEvidence,
    ...overrides,
  });
}

test("普通示例文档有通过证据时可自动应用", () => {
  const candidate = patch();
  assert.equal(candidate.risk, "low");
  assert.equal(canAutoApply(candidate), true);
});

test("README 默认为 medium，不能自动应用", () => {
  const candidate = patch({ filePath: "README.md" });
  assert.equal(candidate.risk, "medium");
  assert.equal(canAutoApply(candidate), false);
});

test("法律文档与承诺性文字判为 high", () => {
  assert.equal(classifyDocRisk("docs/privacy.md", "更新说明"), "high");
  assert.equal(
    classifyDocRisk("examples/usage.md", "保证 99.9% SLA"),
    "high",
  );
});

test("调用方伪造 low 仍不能绕过本地重算", () => {
  const candidate = patch({ filePath: "README.md" });
  candidate.risk = "low";
  assert.equal(canAutoApply(candidate), false);
});

test("缺少证据或验证失败时不能自动应用", () => {
  assert.equal(canAutoApply(patch({ evidence: [] })), false);
  assert.equal(
    canAutoApply(patch({
      evidence: [{ command: "npm test", exitCode: 1, summary: "failed" }],
    })),
    false,
  );
});

test("过期 oldText 不覆盖当前文档", async () => {
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "magic-docs-"));
  await fs.mkdir(path.join(cwd, "examples"));
  const file = path.join(cwd, "examples", "usage.md");
  await fs.writeFile(file, "mini-agent --cwd ./src\n", "utf-8");

  const result = await applyDocPatch(patch(), cwd);
  assert.equal(result.isError, true);
  assert.equal(await fs.readFile(file, "utf-8"), "mini-agent --cwd ./src\n");

  await fs.rm(cwd, { recursive: true, force: true });
});

test("工作目录内的低风险补丁仍然照常写盘", async () => {
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "magic-docs-"));
  await fs.mkdir(path.join(cwd, "examples"));
  const file = path.join(cwd, "examples", "usage.md");
  await fs.writeFile(file, "mini-agent --dir .\n", "utf-8");

  const result = await applyDocPatch(patch(), cwd);
  assert.equal(result.isError, false);
  assert.equal(await fs.readFile(file, "utf-8"), "mini-agent --cwd .\n");

  await fs.rm(cwd, { recursive: true, force: true });
});

test("越界路径即使判为 low 也不写到工作目录外", async () => {
  // 回归：10.7 声称继承第 4 章"目标文件必须位于工作目录约束内"，
  // 但 EditFileTool 里并没有这条校验，越界的 low 风险补丁曾能直接写盘。
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "magic-docs-"));
  const cwd = path.join(root, "project");
  const outsideDir = path.join(root, "outside");
  await fs.mkdir(cwd);
  await fs.mkdir(outsideDir);
  const outsideFile = path.join(outsideDir, "notes.md");
  await fs.writeFile(outsideFile, "mini-agent --dir .\n", "utf-8");

  // 绝对路径越界
  const absolute = patch({ filePath: outsideFile });
  assert.equal(absolute.risk, "low");
  assert.equal(canAutoApply(absolute), true); // 门控本身认为可以自动应用
  const absoluteResult = await applyDocPatch(absolute, cwd);
  assert.equal(absoluteResult.isError, true);
  assert.match(absoluteResult.content, /outside the working directory/);
  assert.equal(await fs.readFile(outsideFile, "utf-8"), "mini-agent --dir .\n");

  // 相对路径用 ../ 逃逸
  const relativeResult = await applyDocPatch(
    patch({ filePath: "../outside/notes.md" }),
    cwd,
  );
  assert.equal(relativeResult.isError, true);
  assert.equal(await fs.readFile(outsideFile, "utf-8"), "mini-agent --dir .\n");

  await fs.rm(root, { recursive: true, force: true });
});

test("同前缀的兄弟目录不算工作目录内", async () => {
  // 边界判定必须比对路径分隔符：裸 startsWith 会把 /root/project-evil
  // 当成 /root/project 的子目录，越界补丁照样写盘。
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "magic-docs-"));
  const cwd = path.join(root, "project");
  const siblingDir = path.join(root, "project-evil");
  await fs.mkdir(cwd);
  await fs.mkdir(siblingDir);
  const siblingFile = path.join(siblingDir, "notes.md");
  await fs.writeFile(siblingFile, "mini-agent --dir .\n", "utf-8");

  const result = await applyDocPatch(patch({ filePath: siblingFile }), cwd);
  assert.equal(result.isError, true);
  assert.match(result.content, /outside the working directory/);
  assert.equal(await fs.readFile(siblingFile, "utf-8"), "mini-agent --dir .\n");

  await fs.rm(root, { recursive: true, force: true });
});
