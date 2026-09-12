import { test } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { analyzeStructure } from "../src/tools/analyzeStructure.js";
import { analyzeDependencies } from "../src/tools/analyzeDependencies.js";
import { analyzeComplexity } from "../src/tools/analyzeComplexity.js";

// 三个分析工具是纯文件系统分析，不需要 MCP 传输层或 API Key。
async function tmpProject(): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-analyzer-test-"));
  await fs.writeFile(
    path.join(dir, "package.json"),
    JSON.stringify({ name: "t", dependencies: { "left-pad": "^1.0.0" }, devDependencies: { typescript: "^5.0.0" } }, null, 2),
  );
  await fs.mkdir(path.join(dir, "src"));
  await fs.writeFile(path.join(dir, "src", "a.ts"), "export function foo() {\n  if (true) { return 1 }\n  return 0\n}\n");
  return dir;
}

test("analyzeStructure 返回非空目录结构（无错误）", async () => {
  const r = await analyzeStructure({ path: await tmpProject() });
  assert.ok(!r.isError);
  assert.ok(Array.isArray(r.content) && r.content.length > 0);
});

test("analyzeDependencies 解析 package.json 依赖（无错误）", async () => {
  const r = await analyzeDependencies({ path: await tmpProject() });
  assert.ok(!r.isError);
  assert.ok(Array.isArray(r.content) && r.content.length > 0);
});

test("analyzeComplexity 跑通（无错误）", async () => {
  const r = await analyzeComplexity({ path: await tmpProject() });
  assert.ok(!r.isError);
  assert.ok(Array.isArray(r.content) && r.content.length > 0);
});
