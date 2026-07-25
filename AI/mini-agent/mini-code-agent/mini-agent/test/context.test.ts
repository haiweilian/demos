import { test } from "node:test";
import assert from "node:assert/strict";
import Anthropic from "@anthropic-ai/sdk";
import { ContextManager } from "../src/context.js";

// 构造 Anthropic 客户端不会发起网络请求；这里只测不调 API 的纯逻辑。
function newCtx(): ContextManager {
  return new ContextManager("system prompt", new Anthropic({ apiKey: "test-key" }));
}

test("空上下文 token 估算为 0", () => {
  assert.equal(newCtx().getEstimatedTokens(), 0);
});

test("加入消息后 token 估算 > 0，消息可读回", () => {
  const ctx = newCtx();
  ctx.addMessage({ role: "user", content: "hello world ".repeat(100) });
  assert.ok(ctx.getEstimatedTokens() > 0);
  assert.equal(ctx.getMessages().length, 1);
});

test("中文比同长度英文估出更多 token（1.5 字符/词的密度）", () => {
  const en = newCtx();
  en.addMessage({ role: "user", content: "a".repeat(300) });
  const zh = newCtx();
  zh.addMessage({ role: "user", content: "字".repeat(300) });
  assert.ok(zh.getEstimatedTokens() > en.getEstimatedTokens());
});
