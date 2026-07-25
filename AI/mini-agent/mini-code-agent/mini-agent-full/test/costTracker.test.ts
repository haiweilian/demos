import { test } from "node:test";
import assert from "node:assert/strict";
import type Anthropic from "@anthropic-ai/sdk";
import { CostTracker } from "../src/costTracker.js";

// 纯本地计算：不调 API、不读网络，只验证四桶累加 / 查表计价 / 软预算边界。

const SONNET = "claude-sonnet-4-20250514";

function usage(
  input: number,
  output: number,
  cacheRead: number | null = 0,
  cacheWrite: number | null = 0,
): Anthropic.Usage {
  return {
    input_tokens: input,
    output_tokens: output,
    cache_read_input_tokens: cacheRead,
    cache_creation_input_tokens: cacheWrite,
  };
}

/** summary() 是唯一的公开读口，从中解析出累计美元数 */
function totalOf(tracker: CostTracker): number {
  const m = /Total: \$([0-9.]+)/.exec(tracker.summary());
  assert.ok(m, `summary 里没有 Total 行：${tracker.summary()}`);
  return Number(m[1]);
}

interface FakeAnalytics {
  events: { name: string; meta: Record<string, number | boolean> }[];
  logEvent(name: string, meta: Record<string, number | boolean>): void;
}

function newAnalytics(): FakeAnalytics {
  return {
    events: [],
    logEvent(name, meta) {
      this.events.push({ name, meta });
    },
  };
}

/**
 * budgetUSD 在构造时从 process.env 读取，所以造实例前先设环境变量，造完立刻还原。
 * 同时吞掉构造期的 console.error（非法 MINI_BUDGET_USD 的提示），避免污染测试输出并返回它。
 */
function newTracker(
  budgetUSD: string,
  analytics?: FakeAnalytics,
): { tracker: CostTracker; warnings: string[] } {
  const prev = process.env.MINI_BUDGET_USD;
  process.env.MINI_BUDGET_USD = budgetUSD;
  try {
    let tracker!: CostTracker;
    const warnings = captureStderr(() => { tracker = new CostTracker(analytics); });
    return { tracker, warnings };
  } finally {
    if (prev === undefined) delete process.env.MINI_BUDGET_USD;
    else process.env.MINI_BUDGET_USD = prev;
  }
}

/** 在静音 console.error 的前提下跑一段代码，返回被吞掉的输出 */
function captureStderr(fn: () => void): string[] {
  const captured: string[] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => {
    captured.push(args.map(String).join(" "));
  };
  try {
    fn();
  } finally {
    console.error = original;
  }
  return captured;
}

// ============================================================
// 成本累加
// ============================================================

test("空 tracker：总额为 0，summary 只有一行", () => {
  const { tracker } = newTracker("1.0");
  assert.equal(totalOf(tracker), 0);
  assert.equal(tracker.summary().split("\n").length, 1);
});

test("书中示例：in 1000 / out 500 / cacheR 50000 = $0.0255", () => {
  const { tracker } = newTracker("1.0");
  tracker.add(usage(1000, 500, 50_000, 0), SONNET);
  assert.equal(totalOf(tracker), 0.0255);
  assert.match(
    tracker.summary(),
    /claude-sonnet-4-20250514: \$0\.0255 \(1 call, in 1000 \/ out 500 \/ cacheR 50000\)/,
  );
});

test("多次调用单调累加，calls 计数随之增长", () => {
  const { tracker } = newTracker("1.0");
  tracker.add(usage(1000, 500, 50_000, 0), SONNET);
  const afterFirst = totalOf(tracker);
  tracker.add(usage(1000, 500, 50_000, 0), SONNET);
  const afterSecond = totalOf(tracker);

  assert.ok(afterSecond > afterFirst, "累计成本必须单调递增");
  assert.equal(afterSecond, 0.051);
  assert.match(tracker.summary(), /\(2 call, in 2000 \/ out 1000 \/ cacheR 100000\)/);
});

test("usage 的 cache 字段为 null 时按 0 计算，不产生 NaN", () => {
  const { tracker } = newTracker("1.0");
  tracker.add(usage(1000, 500, null, null), SONNET);
  assert.equal(totalOf(tracker), 0.0105); // 0.003 + 0.0075
});

// ============================================================
// 按模型计价（分桶的意义）
// ============================================================

test("cacheRead 走约 1 折单价，比同量 input 便宜 10 倍", () => {
  const cached = newTracker("100").tracker;
  cached.add(usage(0, 0, 50_000, 0), SONNET);

  const uncached = newTracker("100").tracker;
  uncached.add(usage(50_000, 0, 0, 0), SONNET);

  assert.equal(totalOf(cached), 0.015);
  assert.equal(totalOf(uncached), 0.15);
  assert.equal(totalOf(uncached) / totalOf(cached), 10);
});

test("cacheWrite 走约 1.25 倍溢价，比同量 input 更贵", () => {
  const write = newTracker("100").tracker;
  write.add(usage(0, 0, 0, 1_000_000), SONNET);

  const plain = newTracker("100").tracker;
  plain.add(usage(1_000_000, 0, 0, 0), SONNET);

  assert.equal(totalOf(write), 3.75);
  assert.equal(totalOf(plain), 3);
});

test("未知模型走 FALLBACK_PRICING：不崩，仍能计价并分桶", () => {
  const { tracker } = newTracker("100");
  tracker.add(usage(1000, 500, 0, 0), "some-unreleased-model");
  assert.equal(totalOf(tracker), 0.0105);
  assert.match(tracker.summary(), /some-unreleased-model: \$0\.0105 \(1 call,/);
});

test("多模型各自分桶，总额是各桶之和", () => {
  const { tracker } = newTracker("100");
  tracker.add(usage(1000, 500, 0, 0), SONNET);
  tracker.add(usage(1000, 500, 0, 0), "another-model");

  const lines = tracker.summary().split("\n");
  assert.equal(lines.length, 3); // 1 行总计 + 2 行模型
  assert.equal(totalOf(tracker), 0.021);
});

// ============================================================
// 软预算告警边界（第 19 章扩展）
// ============================================================

test("低于软预算：不告警、不上报事件", () => {
  const analytics = newAnalytics();
  const { tracker } = newTracker("1.0", analytics);

  const warnings = captureStderr(() => {
    tracker.add(usage(1000, 500, 50_000, 0), SONNET); // $0.0255 << $1.0
  });

  assert.deepEqual(warnings, []);
  assert.equal(analytics.events.length, 0);
});

test("恰好等于软预算：算跨过，触发告警（边界取 >=）", () => {
  const analytics = newAnalytics();
  const { tracker } = newTracker("0.003", analytics);

  const warnings = captureStderr(() => {
    tracker.add(usage(1000, 0, 0, 0), SONNET); // 正好 $0.003
  });

  assert.equal(warnings.length, 1);
  assert.equal(analytics.events.length, 1);
  assert.equal(analytics.events[0]?.name, "budget_exceeded");
  assert.equal(analytics.events[0]?.meta.budget_usd, 0.003);
});

test("跨过软预算：只告警一次（去重），事件里不含会话内容", () => {
  const analytics = newAnalytics();
  const { tracker } = newTracker("0.001", analytics);

  const warnings = captureStderr(() => {
    tracker.add(usage(1000, 0, 0, 0), SONNET);
    tracker.add(usage(1000, 0, 0, 0), SONNET);
    tracker.add(usage(1000, 0, 0, 0), SONNET);
  });

  assert.equal(warnings.length, 1);
  assert.match(warnings[0] ?? "", /\[Budget\]/);
  assert.equal(analytics.events.length, 1);
  assert.deepEqual(Object.keys(analytics.events[0]?.meta ?? {}), ["budget_usd"]);
  assert.equal(totalOf(tracker), 0.009); // 告警不影响继续累加
});

test("没注入 analytics 时告警仍能打印，不抛异常", () => {
  const { tracker } = newTracker("0.001");
  const warnings = captureStderr(() => {
    tracker.add(usage(1000, 0, 0, 0), SONNET);
  });
  assert.equal(warnings.length, 1);
});

test("MINI_BUDGET_USD 可配置：调低后更早触发告警", () => {
  const low = newTracker("0.002", newAnalytics());
  const high = newTracker("10", newAnalytics());

  const lowWarnings = captureStderr(() => low.tracker.add(usage(1000, 0, 0, 0), SONNET));
  const highWarnings = captureStderr(() => high.tracker.add(usage(1000, 0, 0, 0), SONNET));

  assert.equal(lowWarnings.length, 1);
  assert.equal(highWarnings.length, 0);
});

// ============================================================
// MINI_BUDGET_USD 解析：非法值不能把预算线污染成 NaN / 0
// 修复前：Number("5.0USD") = NaN、Number("") = 0，第一次 add 完就误报「超过软预算 $NaN」
// ============================================================

const ILLEGAL_BUDGETS: [string, string][] = [
  ["带单位的数字", "5.0USD"],
  ["空串", ""],
  ["纯空白", "   "],
  ["非数字", "abc"],
  ["负数", "-1"],
  ["零", "0"],
  ["Infinity", "Infinity"],
];

for (const [label, raw] of ILLEGAL_BUDGETS) {
  test(`MINI_BUDGET_USD 为${label}（${JSON.stringify(raw)}）时退回默认预算，且构造时提示一次`, () => {
    const analytics = newAnalytics();
    const { tracker, warnings } = newTracker(raw, analytics);

    assert.equal(warnings.length, 1);
    assert.match(warnings[0] ?? "", /MINI_BUDGET_USD/);   // 提示要指得到元凶变量

    // 花的钱远低于默认 $1.0，绝不该告警（修复前这里必红）
    const budgetWarnings = captureStderr(() => {
      tracker.add(usage(1000, 500, 50_000, 0), SONNET);   // $0.0255
    });
    assert.deepEqual(budgetWarnings, []);
    assert.deepEqual(analytics.events, []);
  });
}

test("非法预算退回的是默认 $1.0：真花超 $1 时照常告警，事件里不是 NaN", () => {
  const analytics = newAnalytics();
  const { tracker } = newTracker("5.0USD", analytics);

  const warnings = captureStderr(() => {
    tracker.add(usage(400_000, 0, 0, 0), SONNET);        // $1.2 > $1.0
  });

  assert.equal(warnings.length, 1);
  assert.match(warnings[0] ?? "", /超过软预算 \$1\.00/);
  assert.equal(analytics.events.length, 1);
  assert.equal(analytics.events[0]?.meta.budget_usd, 1);
});

test("未设 MINI_BUDGET_USD 时用默认 $1.0，且不提示", () => {
  const prev = process.env.MINI_BUDGET_USD;
  delete process.env.MINI_BUDGET_USD;
  try {
    let tracker!: CostTracker;
    const ctorWarnings = captureStderr(() => { tracker = new CostTracker(); });
    assert.deepEqual(ctorWarnings, []);

    const warnings = captureStderr(() => tracker.add(usage(400_000, 0, 0, 0), SONNET));
    assert.equal(warnings.length, 1);
    assert.match(warnings[0] ?? "", /超过软预算 \$1\.00/);
  } finally {
    if (prev !== undefined) process.env.MINI_BUDGET_USD = prev;
  }
});
