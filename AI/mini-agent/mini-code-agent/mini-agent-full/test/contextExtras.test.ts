// test/contextExtras.test.ts
// 基线 test/context.test.ts 与 mini-agent/ 逐字共享，只覆盖 token 估算。
// 本文件补上完整整合版才有的两块：第 7 章的 MicroCompact、第 6 章会话恢复的 cwd 校验。

import { test } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { ContextManager } from "../src/context.js";
import type { MessageParam, SessionData } from "../src/types.js";

const CLEARED = "[Old tool result content cleared]";

// 构造 Anthropic 客户端不会发起网络请求；这里只测不调 API 的纯逻辑。
function newCtx(sessionFile?: string): ContextManager {
  return new ContextManager(
    "system prompt",
    new Anthropic({ apiKey: "test-key" }),
    sessionFile,
  );
}

/** 造 n 轮 "tool_use + tool_result" 配对，每个结果 size 个 ASCII 字符 */
function ctxWithToolResults(n: number, size = 4000): ContextManager {
  const ctx = newCtx();
  for (let i = 0; i < n; i++) {
    ctx.addMessage({
      role: "assistant",
      content: [
        { type: "tool_use", id: `tool-${i}`, name: "ReadFile", input: {} },
      ],
    });
    ctx.addMessage({
      role: "user",
      content: [
        { type: "tool_result", tool_use_id: `tool-${i}`, content: "x".repeat(size) },
      ],
    });
  }
  return ctx;
}

/** 按顺序取出所有 tool_result 块的 content */
function toolResultContents(messages: readonly MessageParam[]): unknown[] {
  const out: unknown[] = [];
  for (const msg of messages) {
    if (Array.isArray(msg.content)) {
      for (const block of msg.content) {
        if ((block as { type?: string }).type === "tool_result") {
          out.push((block as { content: unknown }).content);
        }
      }
    }
  }
  return out;
}

// ============================================================
// MicroCompact
// ============================================================

test("microCompact 只清旧的 tool_result，最近 keep 条原样保留", () => {
  const ctx = ctxWithToolResults(3);
  const freed = ctx.microCompact(1);

  const contents = toolResultContents(ctx.getMessages());
  assert.equal(contents.length, 3);
  assert.equal(contents[0], CLEARED);
  assert.equal(contents[1], CLEARED);
  assert.equal(contents[2], "x".repeat(4000)); // 最近一条不许动
  assert.ok(freed > 0);
});

test("microCompact 只清内容不删消息块，tool_use 与 tool_result 仍成对", () => {
  const ctx = ctxWithToolResults(3);
  const before = ctx.getMessages().length;
  ctx.microCompact(1);

  assert.equal(ctx.getMessages().length, before); // 铁律一：消息块一个不少
  const types = ctx
    .getMessages()
    .flatMap((m) =>
      Array.isArray(m.content)
        ? m.content.map((b) => (b as { type?: string }).type)
        : [],
    );
  assert.deepEqual(types, [
    "tool_use", "tool_result",
    "tool_use", "tool_result",
    "tool_use", "tool_result",
  ]);
});

test("microCompact 返回释放的 token 估算（4000 ASCII 字符 ≈ 1000 token）", () => {
  const ctx = ctxWithToolResults(3);
  // 清掉 2 条 × 4000 ASCII 字符 ÷ 4 = 2000
  assert.equal(ctx.microCompact(1), 2000);
});

test("microCompact(0) 清空全部 tool_result", () => {
  // 回归：slice(0, -0) 等价于 slice(0, 0)，keep = 0 曾经一条都清不到、返回 0，
  // 上层会据此误判"已经压不动了"。
  const ctx = ctxWithToolResults(3);
  const freed = ctx.microCompact(0);

  assert.equal(freed, 3000);
  assert.deepEqual(toolResultContents(ctx.getMessages()), [
    CLEARED,
    CLEARED,
    CLEARED,
  ]);
});

test("没有 tool_result 时 microCompact 返回 0", () => {
  const ctx = newCtx();
  ctx.addMessage({ role: "user", content: "hello" });
  assert.equal(ctx.microCompact(5), 0);
  assert.equal(ctx.microCompact(0), 0);
});

test("已清空的 tool_result 不会被重复计入释放量", () => {
  const ctx = ctxWithToolResults(3);
  assert.equal(ctx.microCompact(0), 3000);
  assert.equal(ctx.microCompact(0), 0);
});

// ============================================================
// 会话恢复的 cwd 校验
// ============================================================

/** 在临时目录里写一份 session 文件，返回 [sessionFile, 清理函数] */
async function withSessionFile(
  sessionCwd: string,
): Promise<{ sessionFile: string; cleanup: () => Promise<void> }> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mini-agent-session-"));
  const sessionFile = path.join(dir, "session.json");
  const data: SessionData = {
    messages: [{ role: "user", content: "来自 projA 的历史" }],
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    cwd: sessionCwd,
  };
  await fs.writeFile(sessionFile, JSON.stringify(data, null, 2), "utf-8");
  return {
    sessionFile,
    cleanup: () => fs.rm(dir, { recursive: true, force: true }),
  };
}

test("loadSession 传入相同 cwd 时正常恢复", async () => {
  const { sessionFile, cleanup } = await withSessionFile("/tmp/projA");
  const ctx = newCtx(sessionFile);

  assert.equal(await ctx.loadSession("/tmp/projA"), true);
  assert.equal(ctx.getMessages().length, 1);

  await cleanup();
});

test("loadSession 比对的是规范化后的路径，写法差异不算换了目录", async () => {
  // 裸字符串比较会把 "/tmp/projA/" 判成另一个项目，白白拒掉本该恢复的会话。
  const { sessionFile, cleanup } = await withSessionFile("/tmp/projA");
  const ctx = newCtx(sessionFile);

  assert.equal(await ctx.loadSession("/tmp/projA/"), true);
  assert.equal(ctx.getMessages().length, 1);

  await cleanup();
});

test("loadSession 发现 cwd 不一致时拒绝恢复", async () => {
  // 回归：全局默认 session 被多个项目共用，不校验就会把 projA 的对话恢复进 projB。
  const { sessionFile, cleanup } = await withSessionFile("/tmp/projA");
  const ctx = newCtx(sessionFile);

  assert.equal(await ctx.loadSession("/tmp/projB"), false);
  assert.equal(ctx.getMessages().length, 0); // 一条都没串进来

  await cleanup();
});

test("loadSession 不传 cwd 时保持旧行为（第 6 章的调用方式仍成立）", async () => {
  const { sessionFile, cleanup } = await withSessionFile("/tmp/projA");
  const ctx = newCtx(sessionFile);

  assert.equal(await ctx.loadSession(), true);
  assert.equal(ctx.getMessages().length, 1);

  await cleanup();
});

test("loadSession 对没有 cwd 字段的老会话按来源不明处理", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mini-agent-session-"));
  const sessionFile = path.join(dir, "session.json");
  await fs.writeFile(
    sessionFile,
    JSON.stringify({ messages: [{ role: "user", content: "老格式" }] }),
    "utf-8",
  );
  const ctx = newCtx(sessionFile);

  assert.equal(await ctx.loadSession("/tmp/projB"), false);
  assert.equal(ctx.getMessages().length, 0);

  await fs.rm(dir, { recursive: true, force: true });
});
