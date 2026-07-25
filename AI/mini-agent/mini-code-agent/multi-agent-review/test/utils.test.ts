import { test } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { extractImports, extractFunctions, extractStringLiterals } from "../src/utils/codeParser.js";
import { scanProject } from "../src/utils/fileScanner.js";

// Worker 的深度分析阶段才调 Claude API；下面这些静态分析工具是纯函数，不需要 API Key。
test("extractImports 提取 import 语句", () => {
  const imps = extractImports(`import { a } from "./a.js";\nimport b from "x";\nconst c = 1;\n`);
  assert.ok(imps.length >= 2);
});

test("extractFunctions 提取函数声明", () => {
  const fns = extractFunctions(`export function foo() {}\nconst bar = () => {}\n`);
  assert.ok(Array.isArray(fns) && fns.length >= 1);
});

test("extractStringLiterals 提取长字符串字面量（≥8 字符）", () => {
  // 实现只收 ≥8 字符的字面量（用来抓硬编码长串/疑似密钥），短串会被忽略
  const lits = extractStringLiterals(`const url = "https://example.com/api";\nconst x = "ab";\n`);
  assert.ok(lits.length >= 1);
  assert.ok(lits.every((l) => l.value.length >= 8));
});

test("scanProject 扫描目录拿到文件列表", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "ma-review-test-"));
  await fs.writeFile(path.join(dir, "a.ts"), "export const x = 1;\n");
  await fs.writeFile(path.join(dir, "b.ts"), "export const y = 2;\n");
  const files = await scanProject(dir);
  assert.ok(Array.isArray(files) && files.length >= 2);
});
