import { test } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { ReadFileTool } from "../src/tools/readFile.js";
import { WriteFileTool } from "../src/tools/writeFile.js";
import { EditFileTool } from "../src/tools/editFile.js";
import { SearchTool } from "../src/tools/search.js";
import { RunCommandTool } from "../src/tools/runCommand.js";

async function tmpDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "miniagent-test-"));
}

test("WriteFile 写入后 ReadFile 能读回（往返）", async () => {
  const dir = await tmpDir();
  const file = path.join(dir, "a.txt");
  const w = await WriteFileTool.execute({ file_path: file, content: "hello\nmini-agent" }, dir);
  assert.equal(w.isError, false);
  const r = await ReadFileTool.execute({ file_path: file }, dir);
  assert.equal(r.isError, false);
  assert.match(r.content, /mini-agent/);
});

test("ReadFile 读不存在的文件返回 isError（不抛异常）", async () => {
  const dir = await tmpDir();
  const r = await ReadFileTool.execute({ file_path: path.join(dir, "nope.txt") }, dir);
  assert.equal(r.isError, true);
});

test("Search 能搜到内容里的关键字", async () => {
  const dir = await tmpDir();
  await fs.writeFile(path.join(dir, "f.txt"), "the needle is here\n");
  const s = await SearchTool.execute({ pattern: "needle" }, dir);
  assert.equal(s.isError, false);
  assert.match(s.content, /needle|f\.txt/);
});

test("RunCommand 执行 echo 返回输出", async () => {
  const dir = await tmpDir();
  const c = await RunCommandTool.execute({ command: "echo hello-mini-agent" }, dir);
  assert.equal(c.isError, false);
  assert.match(c.content, /hello-mini-agent/);
});

test("Edit 唯一匹配时替换成功", async () => {
  const dir = await tmpDir();
  const file = path.join(dir, "conf.ts");
  await fs.writeFile(file, "const port = 3000;\nconst host = 'local';\n");
  const e = await EditFileTool.execute(
    { file_path: file, old_string: "port = 3000", new_string: "port = 8080" },
    dir,
  );
  assert.equal(e.isError, false);
  assert.match(await fs.readFile(file, "utf-8"), /port = 8080/);
});

test("Edit 多处匹配且未设 replace_all 时拒绝（不静默改错位置）", async () => {
  const dir = await tmpDir();
  const file = path.join(dir, "dup.ts");
  await fs.writeFile(file, "timeout: 30\ntimeout: 30\n");
  const e = await EditFileTool.execute(
    { file_path: file, old_string: "timeout: 30", new_string: "timeout: 60" },
    dir,
  );
  assert.equal(e.isError, true);
  assert.match(e.content, /matches|replace_all/);
});
