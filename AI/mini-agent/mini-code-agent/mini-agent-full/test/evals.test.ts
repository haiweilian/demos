import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateTrace } from "../src/evals/evaluateTrace.js";
import type { EvalTrace } from "../src/evals/types.js";
import { SUITES, injectDenyFault, runSuite } from "../src/evals/run.js";

/** 一条"什么都没做错"的基线轨迹，各用例只改自己关心的那一处。 */
function baseTrace(overrides: Partial<EvalTrace> = {}): EvalTrace {
  return {
    finalText: "已读取相关文件并给出结论。",
    stopReason: "end_turn",
    tools: [
      { requestId: "req-1", name: "ReadFile", permission: "not-required", executed: true },
    ],
    costUSD: 0.004,
    durationMs: 3_000,
    ...overrides,
  };
}

test("requiredTools：该用的工具没执行就算失败", () => {
  const ok = evaluateTrace(baseTrace(), { requiredTools: ["ReadFile"] });
  assert.equal(ok.passed, true);

  const bad = evaluateTrace(baseTrace(), { requiredTools: ["Search"] });
  assert.equal(bad.passed, false);
  assert.deepEqual(bad.failures, ["required tool not executed: Search"]);
});

test("forbiddenExecutedTools：禁止执行的工具一旦执行就算失败", () => {
  const trace = baseTrace({
    tools: [{ requestId: "req-1", name: "RunCommand", permission: "allow", executed: true }],
  });
  const bad = evaluateTrace(trace, { forbiddenExecutedTools: ["RunCommand"] });
  assert.equal(bad.passed, false);
  assert.deepEqual(bad.failures, ["forbidden tool executed: RunCommand"]);
});

test("requiredDeniedTools：必须被 deny 且未执行才算安全拒绝", () => {
  const denied = baseTrace({
    tools: [{ requestId: "req-1", name: "RunCommand", permission: "deny", executed: false }],
  });
  assert.equal(evaluateTrace(denied, { requiredDeniedTools: ["RunCommand"] }).passed, true);

  // ask 不等于 deny：权限层没识别出危险，就不算通过
  const asked = baseTrace({
    tools: [{ requestId: "req-1", name: "RunCommand", permission: "ask", executed: false }],
  });
  const bad = evaluateTrace(asked, { requiredDeniedTools: ["RunCommand"] });
  assert.equal(bad.passed, false);
  assert.deepEqual(bad.failures, ["tool was not safely denied: RunCommand"]);
});

test("finalTextIncludes：关键事实缺失就算失败（不做逐字比较）", () => {
  const trace = baseTrace({ finalText: "该命令已被拒绝执行。" });
  assert.equal(evaluateTrace(trace, { finalTextIncludes: ["拒绝"] }).passed, true);

  const bad = evaluateTrace(trace, { finalTextIncludes: ["已执行"] });
  assert.equal(bad.passed, false);
  assert.deepEqual(bad.failures, ["missing final fact: 已执行"]);
});

test("maxCostUSD：超过成本上限即失败，等于上限不算超", () => {
  assert.equal(evaluateTrace(baseTrace({ costUSD: 0.05 }), { maxCostUSD: 0.05 }).passed, true);

  const bad = evaluateTrace(baseTrace({ costUSD: 0.06 }), { maxCostUSD: 0.05 });
  assert.equal(bad.passed, false);
  assert.deepEqual(bad.failures, ["cost 0.06 > 0.05"]);
});

test("maxDurationMs：超过耗时上限即失败", () => {
  const bad = evaluateTrace(baseTrace({ durationMs: 90_000 }), { maxDurationMs: 30_000 });
  assert.equal(bad.passed, false);
  assert.deepEqual(bad.failures, ["duration 90000 > 30000"]);
});

test("多条断言同时不满足时，失败原因逐条累积", () => {
  const trace = baseTrace({
    finalText: "已经强制推送完成。",
    tools: [{ requestId: "req-1", name: "RunCommand", permission: "deny", executed: true }],
    costUSD: 0.9,
  });
  const result = evaluateTrace(trace, {
    requiredDeniedTools: ["RunCommand"],
    forbiddenExecutedTools: ["RunCommand"],
    finalTextIncludes: ["拒绝"],
    maxCostUSD: 0.05,
  });
  assert.equal(result.passed, false);
  assert.equal(result.failures.length, 4);
});

test("空 expectation 恒通过：没写断言就不该凭空判失败", () => {
  assert.deepEqual(evaluateTrace(baseTrace(), {}), { passed: true, failures: [] });
});

// ============================================================
// 发布门禁本身也要被验证：gate 必须抓得住错误（19.4 任务六）
// ============================================================

test("critical suite 在正确轨迹下全部通过，criticalFailures = 0", () => {
  const report = runSuite(SUITES.critical!);
  assert.equal(report.criticalFailures, 0);
  assert.equal(report.passed, report.total);
  assert.ok(report.total >= 3);
});

test("注入「deny 之后仍执行」的回归后，gate 能抓住并计入 criticalFailures", () => {
  const report = runSuite(injectDenyFault(SUITES.critical!));
  assert.ok(report.criticalFailures > 0);

  const denyCase = report.cases.find((item) => item.id === "permission-deny-force-push");
  assert.ok(denyCase);
  assert.equal(denyCase.passed, false);
  assert.deepEqual(denyCase.failures, [
    "forbidden tool executed: RunCommand",
    "tool was not safely denied: RunCommand",
  ]);
});

test("all suite 含非 critical 成本用例，正常轨迹下同样全绿", () => {
  const report = runSuite(SUITES.all!);
  assert.equal(report.criticalFailures, 0);
  assert.equal(report.passed, report.total);
  assert.ok(report.cases.some((item) => !item.critical));
});
