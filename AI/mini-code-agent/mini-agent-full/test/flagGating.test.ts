import { test, after } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { createDefaultRegistry } from "../src/registry.js";
import { webFetchTool } from "../src/tools/webFetch.js";
import type { FeatureFlags, FlagValue } from "../src/featureFlags.js";

// 第 19 章 19.2：灰度门控的"开"方向。
// test/registry.test.ts 只断言了默认（flag 关）时的五个核心工具，
// 把 createDefaultRegistry() 里那段 if (flags?.getMaybeStale(...)) 整段删掉
// 它也不会红 —— 于是"灰度开关能不能真的把工具放出来"没有任何测试守着。
// 本文件补的就是这一半，外加被门控的 WebFetch 自身的输入校验（全程不联网）。

// featureFlags.ts 的 DISK_PATH 在模块加载时算好，所以先把 home 指到临时目录，
// 再动态 import —— 保证整个测试文件不写到真实的 ~/.mini-agent。
const TMP_HOME = await fs.mkdtemp(path.join(os.tmpdir(), "mini-flag-gating-"));
process.env.MINI_AGENT_HOME = TMP_HOME;
delete process.env.MINI_FLAGS_URL;
delete process.env.MINI_FLAG_WEB_FETCH_ENABLED;

const { FeatureFlags: RealFeatureFlags } = await import("../src/featureFlags.js");

const REAL_FETCH = globalThis.fetch;

after(async () => {
  globalThis.fetch = REAL_FETCH;
  delete process.env.MINI_FLAG_WEB_FETCH_ENABLED;
  await fs.rm(TMP_HOME, { recursive: true, force: true });
});

/** 一次 flag 查询的现场记录：既看值，也看调用方用的 key 和默认值。 */
interface FlagQuery {
  key: string;
  defaultValue: FlagValue;
}

/** 假 FeatureFlags：不读磁盘、不发网络，只回放固定值并记录查询。 */
function fakeFlags(
  values: Record<string, FlagValue>,
  queries: FlagQuery[] = [],
): FeatureFlags {
  return {
    getMaybeStale(key: string, defaultValue: FlagValue): FlagValue {
      queries.push({ key, defaultValue });
      return key in values ? values[key]! : defaultValue;
    },
  } as unknown as FeatureFlags;
}

function toolNames(flags?: FeatureFlags): string[] {
  return createDefaultRegistry(flags).getAll().map((tool) => tool.name).sort();
}

// ============================================================
// 灰度门控：关 / 开两个方向都要有断言
// ============================================================

test("不传 flags 时按关处理：工具集里没有 WebFetch（fail-closed）", () => {
  assert.ok(!toolNames().includes("WebFetch"));
});

test("flag 关：WebFetch 不进工具集，也就不会出现在发给模型的 tools 里", () => {
  const registry = createDefaultRegistry(fakeFlags({ web_fetch_enabled: false }));
  assert.equal(registry.get("WebFetch"), undefined);
  assert.ok(!registry.toAPIFormat().some((tool) => tool.name === "WebFetch"));
});

test("flag 开：WebFetch 进工具集，且注册的就是 webFetchTool 本体", () => {
  const registry = createDefaultRegistry(fakeFlags({ web_fetch_enabled: true }));
  assert.equal(registry.get("WebFetch"), webFetchTool);
  assert.ok(registry.toAPIFormat().some((tool) => tool.name === "WebFetch"));

  // 其余五个核心工具不受影响，灰度只做加法
  assert.deepEqual(
    registry.getAll().map((tool) => tool.name).sort(),
    ["Edit", "ReadFile", "RunCommand", "Search", "WebFetch", "WriteFile"],
  );
});

test("查询用的 key 是 web_fetch_enabled，默认值是 false（新工具默认关闭）", () => {
  const queries: FlagQuery[] = [];
  createDefaultRegistry(fakeFlags({}, queries));
  assert.deepEqual(queries, [{ key: "web_fetch_enabled", defaultValue: false }]);
});

test("环境变量覆盖走通真实 FeatureFlags：MINI_FLAG_WEB_FETCH_ENABLED=true 即可看到新工具", async () => {
  const flags = await RealFeatureFlags.load();
  assert.ok(!toolNames(flags).includes("WebFetch"));

  process.env.MINI_FLAG_WEB_FETCH_ENABLED = "true";
  assert.ok(toolNames(flags).includes("WebFetch"));

  delete process.env.MINI_FLAG_WEB_FETCH_ENABLED;
  assert.ok(!toolNames(flags).includes("WebFetch"));
});

// ============================================================
// 被门控的工具本身：输入校验必须在发请求之前挡住
// ============================================================

/** 把 fetch 换成"一被调用就失败"的哨兵，用来证明校验分支根本没发请求。 */
function forbidFetch(): { calls: number } {
  const state = { calls: 0 };
  globalThis.fetch = (async () => {
    state.calls++;
    throw new Error("测试中不允许发起真实网络请求");
  }) as typeof fetch;
  return state;
}

/** 让 fetch 返回固定响应，用来覆盖校验通过之后的分支。 */
function stubFetch(body: string, init?: ResponseInit): { calls: number } {
  const state = { calls: 0 };
  globalThis.fetch = (async () => {
    state.calls++;
    return new Response(body, init);
  }) as typeof fetch;
  return state;
}

/** 一次出站请求的现场记录：请求了谁，以及用的哪种重定向策略。 */
interface FetchRecord {
  url: string;
  redirect: RequestRedirect | undefined;
}

/**
 * 按 URL 路由的假 fetch。响应用工厂函数生成 —— Response 的 body 只能读一次，
 * 同一路由被打两次时必须给新对象。没配路由的 URL 直接抛错，
 * 这样"跳到了不该跳的地方"会立刻炸出来，而不是悄悄拿到一个默认响应。
 */
function routeFetch(routes: Record<string, () => Response>): FetchRecord[] {
  const seen: FetchRecord[] = [];
  globalThis.fetch = (async (input: unknown, init?: RequestInit) => {
    const url = String(input);
    seen.push({ url, redirect: init?.redirect });
    const route = routes[url];
    if (!route) throw new Error(`测试未给 ${url} 配置响应（不该请求这个地址）`);
    return route();
  }) as unknown as typeof fetch;
  return seen;
}

function redirectTo(location: string, status = 302): () => Response {
  return () => new Response("", { status, headers: { location } });
}

test("非 https 协议直接返回 isError，且不发任何请求", async () => {
  const fetchState = forbidFetch();

  const http = await webFetchTool.execute({ url: "http://example.com/a" }, "/tmp");
  assert.equal(http.isError, true);
  assert.match(http.content, /only https:\/\/ URLs are allowed/);

  const file = await webFetchTool.execute({ url: "file:///etc/passwd" }, "/tmp");
  assert.equal(file.isError, true);
  assert.match(file.content, /only https:\/\/ URLs are allowed/);

  assert.equal(fetchState.calls, 0);
});

test("非法 URL / 缺 url 参数返回 isError，不抛异常也不发请求", async () => {
  const fetchState = forbidFetch();

  const broken = await webFetchTool.execute({ url: "not a url" }, "/tmp");
  assert.equal(broken.isError, true);
  assert.match(broken.content, /invalid URL/);

  const missing = await webFetchTool.execute({}, "/tmp");
  assert.equal(missing.isError, true);
  assert.match(missing.content, /invalid URL/);

  assert.equal(fetchState.calls, 0);
});

test("指向内部地址的 URL 被挡在发请求之前（环回 / 私网 / 云元数据端点）", async () => {
  const fetchState = forbidFetch();
  const internalUrls = [
    "https://localhost/admin",
    "https://127.0.0.1/admin",
    "https://169.254.169.254/latest/meta-data/",
    "https://10.0.0.5/",
    "https://192.168.1.1/",
  ];

  for (const url of internalUrls) {
    const result = await webFetchTool.execute({ url }, "/tmp");
    assert.equal(result.isError, true, `${url} 应当被拒绝`);
  }
  assert.equal(fetchState.calls, 0, "被拒绝的地址一次请求都不该发出");
});

// ============================================================
// 重定向：SSRF 的主入口 —— 首跳干净不代表落点干净
// ============================================================

const DOCS = "https://docs.example.invalid/a";

test("每一跳都以 redirect: manual 发出（自动跟随 = 批准的 URL 与实际抓取的 URL 解绑）", async () => {
  const seen = routeFetch({
    [DOCS]: redirectTo("/final"),
    "https://docs.example.invalid/final": () => new Response("ok", { status: 200 }),
  });

  await webFetchTool.execute({ url: DOCS }, "/tmp");

  assert.equal(seen.length, 2);
  assert.deepEqual(
    seen.map((record) => record.redirect),
    ["manual", "manual"],
  );
});

test("302 跳向内网时拒绝跟随，且那个内网地址一次都没被请求过", async () => {
  const seen = routeFetch({
    [DOCS]: redirectTo("https://169.254.169.254/latest/meta-data/"),
  });

  const result = await webFetchTool.execute({ url: DOCS }, "/tmp");

  assert.equal(result.isError, true);
  // 报错要说清"从哪跳到哪"，否则用户只会困惑于自己批准过的域名
  assert.match(result.content, /refusing to follow redirect from https:\/\/docs\.example\.invalid\/a/);
  assert.match(result.content, /refusing to fetch an internal address: 169\.254\.169\.254/);
  // 关键：请求停在第一跳，元数据端点从未被打过
  assert.deepEqual(seen.map((record) => record.url), [DOCS]);
});

test("302 降级到 http 同样被拒（协议闸门对每一跳都生效）", async () => {
  const seen = routeFetch({ [DOCS]: redirectTo("http://docs.example.invalid/plain") });

  const result = await webFetchTool.execute({ url: DOCS }, "/tmp");

  assert.equal(result.isError, true);
  assert.match(result.content, /only https:\/\/ URLs are allowed, got http:/);
  assert.deepEqual(seen.map((record) => record.url), [DOCS]);
});

test("重定向链超过上限时中止，不无限跳", async () => {
  const seen = routeFetch({
    [DOCS]: redirectTo("/h1"),
    "https://docs.example.invalid/h1": redirectTo("/h2"),
    "https://docs.example.invalid/h2": redirectTo("/h3"),
    "https://docs.example.invalid/h3": redirectTo("/h4"),
    "https://docs.example.invalid/h4": () => new Response("终点", { status: 200 }),
  });

  const result = await webFetchTool.execute({ url: DOCS }, "/tmp");

  assert.equal(result.isError, true);
  assert.match(result.content, /too many redirects \(>3\)/);
  // 第 4 跳的目标不该再被请求
  assert.deepEqual(
    seen.map((record) => record.url),
    [DOCS, "https://docs.example.invalid/h1", "https://docs.example.invalid/h2",
      "https://docs.example.invalid/h3"],
  );
});

test("跳到同样干净的外部地址时正常跟随，并如实告诉模型最终 URL", async () => {
  const seen = routeFetch({
    [DOCS]: redirectTo("https://cdn.example.invalid/page"),
    "https://cdn.example.invalid/page": () => new Response("正文内容", { status: 200 }),
  });

  const result = await webFetchTool.execute({ url: DOCS }, "/tmp");

  assert.equal(result.isError, false);
  assert.match(result.content, /\(followed redirects to https:\/\/cdn\.example\.invalid\/page\)/);
  assert.match(result.content, /正文内容/);
  assert.deepEqual(
    seen.map((record) => record.url),
    [DOCS, "https://cdn.example.invalid/page"],
  );
});

test("非 2xx 响应转成 isError，正文不回灌给模型", async () => {
  stubFetch("not found", { status: 404, statusText: "Not Found" });
  const result = await webFetchTool.execute(
    { url: "https://example.invalid/missing" },
    "/tmp",
  );
  assert.equal(result.isError, true);
  assert.match(result.content, /HTTP 404/);
  assert.ok(!result.content.includes("not found"));
});

test("超长正文按上限截断，并在末尾说明截断事实", async () => {
  const body = "x".repeat(20_001);
  stubFetch(body, { status: 200 });
  const result = await webFetchTool.execute({ url: "https://example.invalid/big" }, "/tmp");
  assert.equal(result.isError, false);
  assert.match(result.content, /Truncated at 20000 chars \(total 20001\)/);
  assert.ok(result.content.length < body.length + 200);
});
