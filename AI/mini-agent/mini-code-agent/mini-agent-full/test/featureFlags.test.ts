import { test, after } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

// featureFlags.ts 的 DISK_PATH 在模块加载时算好，所以要先把 home 指到临时目录，
// 再动态 import —— 保证整个测试文件不写到真实的 ~/.mini-agent。
const TMP_HOME = await fs.mkdtemp(path.join(os.tmpdir(), "mini-flags-"));
process.env.MINI_AGENT_HOME = TMP_HOME;
delete process.env.MINI_FLAGS_URL;
delete process.env.MINI_FLAG_WEB_FETCH_ENABLED;
delete process.env.MINI_FLAG_MAX_TURNS;
delete process.env.MINI_FLAG_MODEL_ALIAS;

const { FeatureFlags } = await import("../src/featureFlags.js");

const DISK_FILE = path.join(TMP_HOME, ".mini-agent", "flags.json");
const REAL_FETCH = globalThis.fetch;

after(async () => {
  globalThis.fetch = REAL_FETCH;
  await fs.rm(TMP_HOME, { recursive: true, force: true });
});

/** 让 refresh() 拿到固定 payload，全程离线。 */
function stubFetch(payload: Record<string, unknown>): void {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify(payload), {
      headers: { "content-type": "application/json" },
    })) as typeof fetch;
}

/** 让 refresh() 拿到任意 JSON（含 null / 数组这类非对象），验证响应校验。 */
function stubFetchRaw(json: unknown): void {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify(json), {
      headers: { "content-type": "application/json" },
    })) as typeof fetch;
}

/** 模拟远端不可达。 */
function stubFetchFailure(): void {
  globalThis.fetch = (async () => {
    throw new Error("remote flag source unreachable");
  }) as typeof fetch;
}

async function writeDisk(obj: Record<string, unknown>): Promise<void> {
  await fs.mkdir(path.dirname(DISK_FILE), { recursive: true });
  await fs.writeFile(DISK_FILE, JSON.stringify(obj));
}

async function clearDisk(): Promise<void> {
  await fs.rm(DISK_FILE, { force: true });
}

/** 在静音 console.error 的前提下跑一段异步代码，返回被吞掉的输出 */
async function captureStderr(fn: () => Promise<void>): Promise<string[]> {
  const captured: string[] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => {
    captured.push(args.map(String).join(" "));
  };
  try {
    await fn();
  } finally {
    console.error = original;
  }
  return captured;
}

/** 每个用例开头都把三个来源清干净，避免用例之间互相污染。 */
async function resetSources(): Promise<void> {
  await clearDisk();
  delete process.env.MINI_FLAGS_URL;
  delete process.env.MINI_FLAG_WEB_FETCH_ENABLED;
  globalThis.fetch = REAL_FETCH;
}

test("三层都没值时返回调用方给的默认值（新工具默认关闭）", async () => {
  await resetSources();
  const flags = await FeatureFlags.load();
  assert.equal(flags.getMaybeStale("web_fetch_enabled", false), false);
});

test("磁盘缓存优先于默认值（冷启动 / 离线兜底）", async () => {
  await resetSources();
  await writeDisk({ web_fetch_enabled: true });
  const flags = await FeatureFlags.load();
  assert.equal(flags.getMaybeStale("web_fetch_enabled", false), true);
});

test("远端下发（内存）优先于磁盘缓存，并同步落盘", async () => {
  await resetSources();
  await writeDisk({ web_fetch_enabled: false });
  process.env.MINI_FLAGS_URL = "https://flags.example.invalid/mini";
  stubFetch({ web_fetch_enabled: true });

  const flags = await FeatureFlags.load();
  assert.equal(flags.getMaybeStale("web_fetch_enabled", false), true);

  // 落盘之后，下一次冷启动即使没有远端也能读到同一个值
  const persisted = JSON.parse(await fs.readFile(DISK_FILE, "utf8"));
  assert.deepEqual(persisted, { web_fetch_enabled: true });
});

test("环境变量覆盖优先级最高，高于远端下发的内存值", async () => {
  await resetSources();
  process.env.MINI_FLAGS_URL = "https://flags.example.invalid/mini";
  stubFetch({ web_fetch_enabled: true });
  const flags = await FeatureFlags.load();
  assert.equal(flags.getMaybeStale("web_fetch_enabled", false), true);

  // MINI_FLAG_<KEY 大写> 一旦存在，前面几层一律让位
  process.env.MINI_FLAG_WEB_FETCH_ENABLED = "false";
  assert.equal(flags.getMaybeStale("web_fetch_enabled", false), false);
});

test("环境变量按默认值类型做 coerce（boolean / number / string）", async () => {
  await resetSources();
  const flags = await FeatureFlags.load();

  process.env.MINI_FLAG_WEB_FETCH_ENABLED = "1";
  assert.equal(flags.getMaybeStale("web_fetch_enabled", false), true);

  process.env.MINI_FLAG_MAX_TURNS = "42";
  assert.equal(flags.getMaybeStale("max_turns", 10), 42);

  process.env.MINI_FLAG_MODEL_ALIAS = "haiku";
  assert.equal(flags.getMaybeStale("model_alias", "sonnet"), "haiku");

  delete process.env.MINI_FLAG_MAX_TURNS;
  delete process.env.MINI_FLAG_MODEL_ALIAS;
});

test("远端拉取失败不抛错，降级到磁盘缓存（可观测层可以瞎，主线不能停）", async () => {
  await resetSources();
  await writeDisk({ web_fetch_enabled: true });
  process.env.MINI_FLAGS_URL = "https://flags.example.invalid/mini";
  stubFetchFailure();

  const flags = await FeatureFlags.load();   // 不应 reject
  assert.equal(flags.getMaybeStale("web_fetch_enabled", false), true);
});

test("远端返回空 payload 不清空已有缓存（铁律）", async () => {
  await resetSources();
  process.env.MINI_FLAGS_URL = "https://flags.example.invalid/mini";
  stubFetch({ web_fetch_enabled: true });
  const flags = await FeatureFlags.load();
  assert.equal(flags.getMaybeStale("web_fetch_enabled", false), true);

  stubFetch({});                 // 一次网络抽风返回空结果
  await flags.refresh();
  assert.equal(flags.getMaybeStale("web_fetch_enabled", false), true);
});

test("磁盘缓存文件损坏时静默走默认值，不影响启动", async () => {
  await resetSources();
  await fs.mkdir(path.dirname(DISK_FILE), { recursive: true });
  await fs.writeFile(DISK_FILE, "{ this is not json");

  const flags = await FeatureFlags.load();
  assert.equal(flags.getMaybeStale("web_fetch_enabled", false), false);
});

// ============================================================
// 磁盘缓存是合法 JSON 但不是对象（`echo null > flags.json` 之类的手抖）
// 修复前：查询走到 `key in this.disk` 直接抛 TypeError，把开机打断
// ============================================================

for (const [label, raw] of [
  ["null", "null"],
  ["数字", "42"],
  ["数组", '["web_fetch_enabled"]'],
  ["字符串", '"web_fetch_enabled"'],
] as const) {
  test(`磁盘缓存是合法 JSON 但为${label}时当空配置，查询不抛错`, async () => {
    await resetSources();
    await fs.mkdir(path.dirname(DISK_FILE), { recursive: true });
    await fs.writeFile(DISK_FILE, raw);

    const warnings = await captureStderr(async () => {
      const flags = await FeatureFlags.load();
      // 修复前这一行抛 "Cannot use 'in' operator to search for ... in null"
      assert.equal(flags.getMaybeStale("web_fetch_enabled", false), false);
      assert.equal(flags.getMaybeStale("max_turns", 10), 10);
    });

    // 警告必须指得到元凶文件，否则用户只能看着 TypeError 猜
    assert.equal(warnings.length, 1);
    assert.match(warnings[0] ?? "", /\[FeatureFlags\]/);
    assert.ok(warnings[0]?.includes(DISK_FILE), `警告里没有 flags.json 路径：${warnings[0]}`);
  });
}

test("磁盘缓存是普通对象时不打警告（别把正常路径吵成噪音）", async () => {
  await resetSources();
  await writeDisk({ web_fetch_enabled: true });

  const warnings = await captureStderr(async () => {
    const flags = await FeatureFlags.load();
    assert.equal(flags.getMaybeStale("web_fetch_enabled", false), true);
  });
  assert.deepEqual(warnings, []);
});

test("远端返回非对象 JSON 时当空 payload，不清缓存也不抛错", async () => {
  await resetSources();
  await writeDisk({ web_fetch_enabled: true });
  process.env.MINI_FLAGS_URL = "https://flags.example.invalid/mini";

  for (const bad of [null, 42, ["web_fetch_enabled"], "web_fetch_enabled"]) {
    stubFetchRaw(bad);
    const warnings = await captureStderr(async () => {
      const flags = await FeatureFlags.load();
      assert.equal(flags.getMaybeStale("web_fetch_enabled", false), true); // 磁盘缓存仍在
    });
    assert.equal(warnings.length, 1, `payload=${JSON.stringify(bad)} 应有一行警告`);
    assert.ok(warnings[0]?.includes("https://flags.example.invalid/mini"));
  }

  // 磁盘缓存没被非法响应覆盖
  assert.deepEqual(JSON.parse(await fs.readFile(DISK_FILE, "utf8")), { web_fetch_enabled: true });
});
