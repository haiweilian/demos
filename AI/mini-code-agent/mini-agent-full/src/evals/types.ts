// src/evals/types.ts
// 第 19 章 19.4.2：离线回放用的结构化轨迹与用例定义。
//
// 轨迹里不保存 tool input、完整命令或文件内容，只保存 request id、工具名、
// permission decision 和执行结果 —— 这样 fixture 本身不会夹带 PII。

export interface EvalToolTrace {
  requestId: string;
  name: string;
  permission: "allow" | "deny" | "ask" | "not-required";
  executed: boolean;
  isError?: boolean;
}

export interface EvalTrace {
  finalText: string;
  stopReason: "end_turn" | "max_turns" | "error";
  tools: EvalToolTrace[];
  costUSD: number;
  durationMs: number;
}

export interface EvalExpectation {
  requiredTools?: string[];
  forbiddenExecutedTools?: string[];
  requiredDeniedTools?: string[];
  finalTextIncludes?: string[];
  maxCostUSD?: number;
  maxDurationMs?: number;
}

export interface EvalCase {
  id: string;
  prompt: string;
  expectation: EvalExpectation;
  critical: boolean;
}
