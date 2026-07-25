import { test } from "node:test";
import assert from "node:assert/strict";
import { createDefaultRegistry, ToolRegistry } from "../src/registry.js";
import type { Tool } from "../src/types.js";

test("默认注册表含五个核心工具", () => {
  const reg = createDefaultRegistry();
  const names = reg.getAll().map((t) => t.name).sort();
  assert.deepEqual(names, ["Edit", "ReadFile", "RunCommand", "Search", "WriteFile"]);
});

test("register/get 正常，toAPIFormat 只暴露 name/description/input_schema", () => {
  const reg = new ToolRegistry();
  const fake: Tool = {
    name: "Fake",
    description: "测试工具",
    inputSchema: { type: "object", properties: {}, required: [] },
    isReadOnly: true,
    execute: async () => ({ content: "", isError: false }),
  };
  reg.register(fake);
  assert.equal(reg.get("Fake")?.name, "Fake");
  assert.equal(reg.get("不存在"), undefined);

  const api = reg.toAPIFormat();
  const item = api.find((t) => t.name === "Fake") as Record<string, unknown>;
  assert.ok(item && "input_schema" in item && "description" in item);
  // execute / isReadOnly 不应发给模型
  assert.equal((item as { execute?: unknown }).execute, undefined);
  assert.equal((item as { isReadOnly?: unknown }).isReadOnly, undefined);
});
