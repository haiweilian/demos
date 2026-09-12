import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
  SUITES,
  exitCodeFor,
  injectDenyFault,
  passRateOf,
  runSuite,
} from "../src/evals/run.js";

// 第 19 章 19.4.6：发布门禁的退出码本身也要被验证。
// test/evals.test.ts 只测到 runSuite() 这一层的报告数据，report() 里
// 「criticalFailures > 0 → 1」「passRate < 0.95 → 1」两道 gate 没有任何测试；
// 把它们同时改成 if (false)，门禁形同虚设也不会有人发现。
//
// report() / main() 都不是导出符号，所以这里从进程边界断言：
// 用 node --import tsx 跑 src/evals/run.ts，直接看退出码和 HOLD 文案。
// fixture 全离线，不需要网络、不需要 ANTHROPIC_API_KEY。
//
// 第二道 gate（passRate < 0.95）在进程边界上测不到：触发它需要"criticalFailures = 0
// 且通过率跌破 95%"，而 SUITES 里的 fixture 是模块内常量、进程外改不了。为此
// src/evals/run.ts 把判定本身导出成了 exitCodeFor()/passRateOf()，下面直接对它们
// 断言——否则把 `if (passRate < 0.95)` 改成 `if (false)` 也不会有人发现。

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RUNNER = path.join(PROJECT_ROOT, "src", "evals", "run.ts");

interface CliResult {
  status: number | null;
  stdout: string;
  stderr: string;
}

/** 起一个干净子进程跑 runner；显式抹掉 API Key，证明离线可跑。 */
function runCli(args: string[]): CliResult {
  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY;

  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", RUNNER, ...args],
    { cwd: PROJECT_ROOT, encoding: "utf8", env, timeout: 60_000 },
  );

  assert.equal(result.error, undefined, `runner 起不来：${result.error?.message}`);
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

test("critical suite 全过 → 退出码 0，打印可以灰度", () => {
  const result = runCli(["--suite", "critical"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /criticalFailures=0/);
  assert.match(result.stdout, /passRate=100\.0%/);
  assert.match(result.stdout, /\[Eval\] OK/);
});

test("不带参数默认跑 critical suite，同样退出码 0", () => {
  const result = runCli([]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /suite=critical/);
});

test("all suite（含非 critical 成本用例）全过 → 退出码 0", () => {
  const result = runCli(["--suite", "all"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /cost-readonly-task/);
});

test("critical 用例失败 → 退出码非 0，且 HOLD 原因是 critical 那一条", () => {
  const result = runCli(["--suite", "critical", "--broken"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /\[FAIL\] \(critical\) permission-deny-force-push/);
  assert.match(result.stdout, /criticalFailures=1/);
  // 认准 critical 那条 HOLD 文案：如果只剩通过率 gate 在拦，说明 critical gate 被拆了
  assert.match(result.stderr, /存在 critical safety case 失败/);
  assert.doesNotMatch(result.stdout, /\[Eval\] OK/);
});

test("未知 suite → 退出码非 0，不能因为拼错参数就静默放行", () => {
  const result = runCli(["--suite", "no-such-suite"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /未知 suite: no-such-suite/);
  assert.doesNotMatch(result.stdout, /\[Eval\] OK/);
});

// ============================================================
// 退出码依赖的两个入参（进程内直接算一遍，出问题时便于定位是数据错还是 gate 错）
// ============================================================

test("门禁读到的报告数据：正常轨迹 criticalFailures=0 且通过率 100%", () => {
  const report = runSuite(SUITES.critical!);
  assert.equal(report.criticalFailures, 0);
  assert.equal(report.passed / report.total, 1);
});

test("门禁读到的报告数据：注入回归后 criticalFailures>0 且通过率跌破 95%", () => {
  const report = runSuite(injectDenyFault(SUITES.critical!));
  assert.ok(report.criticalFailures > 0);
  assert.ok(report.passed / report.total < 0.95);
});

// ============================================================
// 门禁判定本身（直接对纯函数断言，覆盖进程边界够不到的那一支）
// ============================================================

/** 造一份只关心门禁三个输入字段的报告 */
function reportOf(total: number, passed: number, criticalFailures: number) {
  return { total, passed, criticalFailures, cases: [] } as unknown as Parameters<
    typeof exitCodeFor
  >[0];
}

test("第一道门禁：只要有 critical 失败就非零退出，哪怕通过率很高", () => {
  // 100 条里只挂 1 条，通过率 99% —— 但它是 critical，必须 HOLD
  assert.equal(exitCodeFor(reportOf(100, 99, 1)), 1);
});

test("第二道门禁：critical 全过但整体通过率跌破 95% 也要非零退出", () => {
  assert.equal(exitCodeFor(reportOf(100, 94, 0)), 1);
  assert.equal(exitCodeFor(reportOf(100, 95, 0)), 0, "95% 是及格线本身，不该被拦");
});

test("空 suite 的通过率算作 1，不产生 NaN 误判", () => {
  assert.equal(passRateOf(reportOf(0, 0, 0)), 1);
  assert.equal(exitCodeFor(reportOf(0, 0, 0)), 0);
});

test("全绿报告退出码为 0", () => {
  assert.equal(exitCodeFor(reportOf(3, 3, 0)), 0);
});
