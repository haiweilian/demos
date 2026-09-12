import { test, after } from "node:test";
import assert from "node:assert/strict";
import { Analytics } from "../src/analytics.js";
import type { FeatureFlags, FlagValue } from "../src/featureFlags.js";

// 第 19 章 19.3：可观测层的三条纪律都要有测试守着 ——
//   1. 三道禁用条件任意一条命中就彻底不上报（删掉 logEvent 里的 if (!enabled) return
//      也没人发现，就等于禁用开关是摆设）；
//   2. 批量 + 退出强制 flush；
//   3. sink 失败绝不影响主线（"可观测层可以瞎，主线不能停"）。
// 全程不发真实请求：fetch 被替换成记录调用的假实现。

const TELEMETRY_URL = "https://telemetry.example.invalid/ingest";
const REAL_FETCH = globalThis.fetch;

type EnvPatch = Record<string, string | undefined>;

const ENV_KEYS = ["NODE_ENV", "MINI_TELEMETRY_DISABLED", "MINI_TELEMETRY_URL"] as const;

function applyEnv(patch: EnvPatch): void {
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

/** 进程原始环境，测试结束后原样还原。 */
const ORIGINAL_ENV: EnvPatch = Object.fromEntries(
  ENV_KEYS.map((key) => [key, process.env[key]]),
);

/** 本文件的基线环境：三道禁用条件都不命中，且配了 sink 地址。 */
const BASELINE_ENV: EnvPatch = {
  NODE_ENV: undefined,
  MINI_TELEMETRY_DISABLED: undefined,
  MINI_TELEMETRY_URL: TELEMETRY_URL,
};
applyEnv(BASELINE_ENV);

after(() => {
  globalThis.fetch = REAL_FETCH;
  applyEnv(ORIGINAL_ENV);
});

interface FetchCall {
  url: string;
  method: string | undefined;
  body: { name: string; meta: Record<string, unknown>; ts: number }[];
}

/** 记录每次上报的假 sink；shouldFail 时模拟后端不可达。 */
function stubFetch(shouldFail = false): FetchCall[] {
  const calls: FetchCall[] = [];
  globalThis.fetch = (async (input: unknown, init?: RequestInit) => {
    calls.push({
      url: String(input),
      method: init?.method,
      body: JSON.parse(String(init?.body ?? "[]")),
    });
    if (shouldFail) throw new Error("telemetry sink unreachable");
    return new Response("", { status: 202 });
  }) as unknown as typeof fetch;
  return calls;
}

/** 假 FeatureFlags：只回放固定值并记录查询，不读磁盘不发网络。 */
function fakeFlags(
  values: Record<string, FlagValue>,
  queries: { key: string; defaultValue: FlagValue }[] = [],
): FeatureFlags {
  return {
    getMaybeStale(key: string, defaultValue: FlagValue): FlagValue {
      queries.push({ key, defaultValue });
      return key in values ? values[key]! : defaultValue;
    },
  } as unknown as FeatureFlags;
}

/**
 * enabled 是构造时一次性算好的，所以环境变量必须在 new 之前设好，构造完立刻回到基线。
 * 注意 MINI_TELEMETRY_URL 是 flush 时才读的，所以它由基线环境全程持有。
 */
function newAnalytics(
  options: { env?: EnvPatch; flags?: FeatureFlags } = {},
): Analytics {
  applyEnv({ ...BASELINE_ENV, ...(options.env ?? {}) });
  try {
    return new Analytics(options.flags);
  } finally {
    applyEnv(BASELINE_ENV);
  }
}

// ============================================================
// 启用 / 禁用
// ============================================================

test("三道条件都不命中时启用：事件入队，flush 批量 POST 到 sink", async () => {
  const calls = stubFetch();
  const analytics = newAnalytics();

  analytics.logEvent("agent_init", { permission_check: true });
  analytics.logEvent("tool_use", { is_error: false });
  await analytics.flush();

  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.url, TELEMETRY_URL);
  assert.equal(calls[0]?.method, "POST");
  assert.deepEqual(calls[0]?.body.map((event) => event.name), ["agent_init", "tool_use"]);
  assert.equal(typeof calls[0]?.body[0]?.ts, "number");

  await analytics.shutdown();
});

test("NODE_ENV=test 禁用：logEvent 不入队，flush 也就无事可发", async () => {
  const calls = stubFetch();
  const analytics = newAnalytics({ env: { NODE_ENV: "test" } });

  analytics.logEvent("tool_use", { is_error: false });
  await analytics.flush();

  assert.deepEqual(calls, []);
});

test("MINI_TELEMETRY_DISABLED=1 禁用：用户显式关掉就一条都不发", async () => {
  const calls = stubFetch();
  const analytics = newAnalytics({ env: { MINI_TELEMETRY_DISABLED: "1" } });

  analytics.logEvent("tool_use", { is_error: false });
  await analytics.flush();

  assert.deepEqual(calls, []);
});

test("flag analytics_enabled=false 禁用，且查询用的默认值是 true", async () => {
  const calls = stubFetch();
  const queries: { key: string; defaultValue: FlagValue }[] = [];
  const analytics = newAnalytics({
    flags: fakeFlags({ analytics_enabled: false }, queries),
  });

  analytics.logEvent("tool_use", { is_error: false });
  await analytics.flush();

  assert.deepEqual(calls, []);
  assert.deepEqual(queries, [{ key: "analytics_enabled", defaultValue: true }]);
});

test("flag analytics_enabled=true 时正常上报（门控只挡该挡的）", async () => {
  const calls = stubFetch();
  const analytics = newAnalytics({ flags: fakeFlags({ analytics_enabled: true }) });

  analytics.logEvent("tool_use", { is_error: false });
  await analytics.flush();

  assert.equal(calls.length, 1);
  await analytics.shutdown();
});

// ============================================================
// 队列与 flush
// ============================================================

test("flush 之后队列清空：再 flush 一次不会重复上报", async () => {
  const calls = stubFetch();
  const analytics = newAnalytics();

  analytics.logEvent("tool_use", { is_error: false });
  await analytics.flush();
  await analytics.flush();

  assert.equal(calls.length, 1);
  await analytics.shutdown();
});

test("没配 MINI_TELEMETRY_URL 时直接丢弃这批事件（本地开发常态，不阻塞主线）", async () => {
  const calls = stubFetch();
  const analytics = newAnalytics();

  analytics.logEvent("tool_use", { is_error: false });
  applyEnv({ MINI_TELEMETRY_URL: undefined });
  await analytics.flush();
  applyEnv(BASELINE_ENV);
  assert.deepEqual(calls, []);

  // 丢弃是彻底的：事后补上 URL 也不会把老事件翻出来重发
  await analytics.flush();
  assert.deepEqual(calls, []);

  await analytics.shutdown();
});

test("满 50 条自动触发一次 flush，不必等定时器", async () => {
  const calls = stubFetch();
  const analytics = newAnalytics();

  for (let i = 0; i < 49; i++) analytics.logEvent("tool_use", { is_error: false });
  assert.equal(calls.length, 0, "不到 50 条不该提前发");

  analytics.logEvent("tool_use", { is_error: false });
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.body.length, 50);

  await analytics.shutdown();
});

// ============================================================
// 失败隔离与退出
// ============================================================

test("sink 失败不抛异常、不影响后续埋点（可观测层可以瞎，主线不能停）", async () => {
  const failing = stubFetch(true);
  const analytics = newAnalytics();

  analytics.logEvent("tool_use", { is_error: false });
  await assert.doesNotReject(() => analytics.flush());
  assert.equal(failing.length, 1);

  // 失败那批被丢掉，但埋点通道本身没坏
  const healthy = stubFetch();
  analytics.logEvent("tool_use", { is_error: true });
  await analytics.flush();
  assert.equal(healthy.length, 1);
  assert.deepEqual(healthy[0]?.body.map((event) => event.name), ["tool_use"]);

  await analytics.shutdown();
});

test("shutdown 把剩余事件强制发完；再次调用不会重复发", async () => {
  const calls = stubFetch();
  const analytics = newAnalytics();

  analytics.logEvent("session_end", { turns: 3 });
  await analytics.shutdown();

  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0]?.body.map((event) => event.name), ["session_end"]);

  await analytics.shutdown();
  assert.equal(calls.length, 1);
});

// ============================================================
// PII 红线（编译期）
// ============================================================

test("metadata 的 PII 红线由类型系统守着，运行时只放行 boolean / number", () => {
  const calls = stubFetch();
  const analytics = newAnalytics({ env: { NODE_ENV: "test" } });

  // @ts-expect-error 裸 string 不是 SafeMetaValue：文件路径 / 命令这类 PII 进不了 metadata
  analytics.logEvent("tool_use", { file_path: "/Users/me/secret.ts" });

  // 合法的两种标量照常
  analytics.logEvent("tool_use", { is_error: false, turns: 2 });
  assert.deepEqual(calls, []);
});
