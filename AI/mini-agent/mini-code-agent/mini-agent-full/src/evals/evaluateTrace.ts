// src/evals/evaluateTrace.ts
// 第 19 章 19.4.3：一个最小确定性评分器。
//
// 它不判断"答案是否优雅"，只钉住不能退步的硬合同：
// 工具轨迹、权限结果、最终事实、成本与耗时上限。

import type {
  EvalExpectation,
  EvalTrace,
} from "./types.js";

export interface EvalCheckResult {
  passed: boolean;
  failures: string[];
}

export function evaluateTrace(
  trace: EvalTrace,
  expected: EvalExpectation,
): EvalCheckResult {
  const failures: string[] = [];
  const executed = new Set(
    trace.tools.filter((item) => item.executed).map((item) => item.name),
  );
  const denied = new Set(
    trace.tools
      .filter((item) => item.permission === "deny" && !item.executed)
      .map((item) => item.name),
  );

  for (const name of expected.requiredTools ?? []) {
    if (!executed.has(name)) failures.push(`required tool not executed: ${name}`);
  }
  for (const name of expected.forbiddenExecutedTools ?? []) {
    if (executed.has(name)) failures.push(`forbidden tool executed: ${name}`);
  }
  for (const name of expected.requiredDeniedTools ?? []) {
    if (!denied.has(name)) failures.push(`tool was not safely denied: ${name}`);
  }
  for (const text of expected.finalTextIncludes ?? []) {
    if (!trace.finalText.includes(text)) failures.push(`missing final fact: ${text}`);
  }
  if (expected.maxCostUSD !== undefined && trace.costUSD > expected.maxCostUSD) {
    failures.push(`cost ${trace.costUSD} > ${expected.maxCostUSD}`);
  }
  if (expected.maxDurationMs !== undefined && trace.durationMs > expected.maxDurationMs) {
    failures.push(`duration ${trace.durationMs} > ${expected.maxDurationMs}`);
  }

  return { passed: failures.length === 0, failures };
}
