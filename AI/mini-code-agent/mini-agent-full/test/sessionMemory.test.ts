import { test } from "node:test";
import assert from "node:assert/strict";
import { SessionMemory } from "../src/sessionMemory.js";

// ============================================================
// 书稿 8.9 的四条承重用例
// ============================================================

test("changedFiles 去重并规范化路径", () => {
  const memory = new SessionMemory();
  memory.beginTask("修复登录问题");

  memory.recordFile("src\\auth.ts");
  memory.recordFile("src/auth.ts");

  assert.deepEqual(memory.snapshot().changedFiles, ["src/auth.ts"]);
});

test("只保留最近 8 条命令", () => {
  const memory = new SessionMemory();
  memory.beginTask("补测试");

  for (let index = 0; index < 10; index++) {
    memory.recordCommand(`npm test -- ${index}`, true, "pass");
  }

  const commands = memory.snapshot().commands;
  assert.equal(commands.length, 8);
  assert.equal(commands[0]?.command, "npm test -- 2");
  assert.equal(commands.at(-1)?.command, "npm test -- 9");
});

test("beginTask 清掉上一任务的瞬时状态", () => {
  const memory = new SessionMemory();
  memory.beginTask("任务 A");
  memory.recordFile("src/a.ts");
  memory.setNextSteps(["继续任务 A"]);

  memory.beginTask("任务 B");

  const snapshot = memory.snapshot();
  assert.equal(snapshot.currentTask, "任务 B");
  assert.deepEqual(snapshot.changedFiles, []);
  assert.deepEqual(snapshot.nextSteps, []);
});

test("prompt 只包含最新状态与安全提示", () => {
  const memory = new SessionMemory();
  memory.beginTask("发布前验证");
  memory.recordCommand("npm test", false, "2 tests failed\nretry later");
  memory.recordDecision("不要跳过失败测试");
  memory.setNextSteps(["定位失败用例"]);

  const prompt = memory.toPromptBlock();
  assert.match(prompt, /Phase: working/);
  assert.match(prompt, /\[failed\] npm test: 2 tests failed retry later/);
  assert.match(prompt, /不要跳过失败测试/);
  assert.match(prompt, /Re-check files and commands/);
});

// ============================================================
// 增补用例：锁住书稿正文强调、但上面四条没覆盖的行为
// ============================================================

test("用户纠正后 prompt 不再出现废弃方案（不变量二）", () => {
  const memory = new SessionMemory();
  memory.beginTask("修登录");
  memory.recordDecision("修改 src/auth.ts");
  memory.setNextSteps(["修改 src/auth.ts", "运行 npm test"]);

  memory.replaceDecision("修改 src/auth.ts", "不修改认证逻辑，只补充文档");
  memory.setNextSteps(["更新认证说明文档", "检查文档链接"]);

  const prompt = memory.toPromptBlock();
  // 只追加一句"不要旧方案"不算通过：旧决策和旧下一步都必须消失
  assert.doesNotMatch(prompt, /修改 src\/auth\.ts/);
  assert.doesNotMatch(prompt, /运行 npm test/);
  assert.match(prompt, /不修改认证逻辑，只补充文档/);
  assert.match(prompt, /更新认证说明文档/);
});

test("setNextSteps 是替换而非追加，且去重截断到 6 条", () => {
  const memory = new SessionMemory();
  memory.beginTask("整理计划");

  memory.setNextSteps(["旧计划"]);
  memory.setNextSteps([
    "步骤1", "步骤2", "步骤2", "步骤3",
    "步骤4", "步骤5", "步骤6", "步骤7",
  ]);

  assert.deepEqual(memory.snapshot().nextSteps, [
    "步骤1", "步骤2", "步骤3", "步骤4", "步骤5", "步骤6",
  ]);
});

test("重复文件移动到末尾，且总量不超过 40", () => {
  const memory = new SessionMemory();
  memory.beginTask("大范围重构");

  memory.recordFile("src/a.ts");
  memory.recordFile("src/b.ts");
  memory.recordFile("src/a.ts");
  assert.deepEqual(memory.snapshot().changedFiles, ["src/b.ts", "src/a.ts"]);

  for (let index = 0; index < 50; index++) {
    memory.recordFile(`src/f${index}.ts`);
  }
  const files = memory.snapshot().changedFiles;
  assert.equal(files.length, 40);
  assert.equal(files.at(-1), "src/f49.ts");
});

test("命令摘要单行化并截断到 240 字符", () => {
  const memory = new SessionMemory();
  memory.beginTask("跑构建");
  memory.recordCommand("npm run build", false, `${"x".repeat(500)}\n\n第二行`);

  const record = memory.snapshot().commands[0];
  assert.equal(record?.summary.length, 240);
  assert.doesNotMatch(record?.summary ?? "", /\n/);
});

test("snapshot 返回深拷贝，外部改动不影响内部状态", () => {
  const memory = new SessionMemory();
  memory.beginTask("防篡改");
  memory.recordFile("src/a.ts");

  const snapshot = memory.snapshot();
  snapshot.changedFiles.push("src/injected.ts");
  snapshot.currentTask = "被改掉的任务";

  const fresh = memory.snapshot();
  assert.deepEqual(fresh.changedFiles, ["src/a.ts"]);
  assert.equal(fresh.currentTask, "防篡改");
});

test("空白输入被忽略，phase 可显式切换", () => {
  const memory = new SessionMemory();
  memory.beginTask("空值处理");

  memory.recordFile("   ");
  memory.recordDecision("\n\t ");
  memory.setNextSteps(["", "  ", "有效步骤"]);
  memory.setPhase("blocked");

  const snapshot = memory.snapshot();
  assert.deepEqual(snapshot.changedFiles, []);
  assert.deepEqual(snapshot.decisions, []);
  assert.deepEqual(snapshot.nextSteps, ["有效步骤"]);
  assert.equal(snapshot.phase, "blocked");
  assert.match(memory.toPromptBlock(), /Phase: blocked/);
});

test("未设置任务时 prompt 显示占位而非空字符串", () => {
  const memory = new SessionMemory();
  const prompt = memory.toPromptBlock();

  assert.match(prompt, /Current task: \(not set\)/);
  assert.match(prompt, /Phase: idle/);
  assert.match(prompt, /Changed files: \(none\)/);
  assert.match(prompt, /^<session-memory source="local-runtime-state">/);
  assert.match(prompt, /<\/session-memory>$/);
});
