// src/tools/webFetch.ts
//
// 【仓库补齐】第 19 章正文只把 webFetch 当作"本次要灰度的新工具"举例
// （见 19-engineering.md 的 createDefaultRegistry(flags) 片段），并未给出实现。
// 这里补一个最小可运行版本，好让 `MINI_FLAG_WEB_FETCH_ENABLED=true` 这条
// 过关命令真的能观察到"工具集里多出一个工具"。功能刻意做得很薄：
// 它存在的意义是被 Feature Flag 门控，而不是成为一个完备的抓取工具。
//
// 但"薄"不等于"没有边界"。一个能被模型驱动去访问任意 URL 的工具，天然是
// SSRF 面：模型可能被它读到的 README / issue / skill 文本诱导去打内网地址，
// 或者被一次 302 从"用户批准过的域名"带到元数据端点。所以下面三道闸门是
// 必需的，不是可选的：
//   1. 只允许 https
//   2. 主机不能落在环回 / 私网 / 链路本地等内部地址上
//   3. 不自动跟随重定向——每一跳都要重新过前两道闸门
//
// 已知边界：这里按"URL 里的字面量地址"判断，挡不住 DNS rebinding
// （域名解析到内网 IP）。要彻底修，得自定义 lookup、在连接建立那一刻校验
// 解析结果。教学版不做，但你把它搬进生产前必须补上。

import type { Tool, ToolResult } from "../types.js";

/** 返回给模型的正文上限，避免一个大页面把上下文顶爆 */
const MAX_CONTENT_CHARS = 20_000;

/** 单次请求超时（毫秒），防止慢站点把 Agent 循环卡住 */
const FETCH_TIMEOUT_MS = 10_000;

/** 最多跟随几跳重定向。每一跳都要重新校验目标地址 */
const MAX_REDIRECTS = 3;

/** 内部地址：环回、私网、链路本地（含云厂商元数据端点 169.254.169.254）、唯一本地地址 */
const BLOCKED_HOST_PATTERNS: RegExp[] = [
  /^localhost$/i,
  /^127\./,                       // 127.0.0.0/8 环回
  /^0\.0\.0\.0$/,
  /^10\./,                        // 10.0.0.0/8 私网
  /^192\.168\./,                  // 192.168.0.0/16 私网
  /^172\.(1[6-9]|2\d|3[01])\./,   // 172.16.0.0/12 私网
  /^169\.254\./,                  // 169.254.0.0/16 链路本地（云元数据端点在这里）
  /^\[?::1\]?$/,                  // IPv6 环回
  /^\[?f[cd][0-9a-f]{2}:/i,       // IPv6 唯一本地地址 fc00::/7
  /^\[?fe80:/i,                   // IPv6 链路本地
  /\.internal$/i,
  /\.local$/i,
];

/** 校验一个 URL 能不能抓。返回 null 表示通过，否则返回拒绝理由。 */
function rejectReason(url: URL): string | null {
  if (url.protocol !== "https:") {
    return `only https:// URLs are allowed, got ${url.protocol}`;
  }
  const host = url.hostname;
  for (const pattern of BLOCKED_HOST_PATTERNS) {
    if (pattern.test(host)) {
      return `refusing to fetch an internal address: ${host}`;
    }
  }
  return null;
}

export const webFetchTool: Tool = {
  name: "WebFetch",
  description:
    "Fetch the text content of an https:// URL. " +
    "Use this when the task requires information that is not available locally. " +
    "Returns plain text, truncated if the page is large.",
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "The https:// URL to fetch. Only https is allowed.",
      },
    },
    required: ["url"],
  },
  // 它不改本地文件系统，但会发出网络请求。标 false 让它走权限闸门：
  // 未被专门识别的副作用工具在第 11 章的 fail-closed 分发里默认 ask。
  isReadOnly: false,

  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const raw = String(args.url ?? "");

    let target: URL;
    try {
      target = new URL(raw);
    } catch {
      return { content: `Error: invalid URL: ${raw}`, isError: true };
    }

    const initialReject = rejectReason(target);
    if (initialReject) {
      return { content: `Error: ${initialReject}`, isError: true };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      // 手动跟随重定向：自动跟随等于把"用户批准的 URL"和"实际抓取的 URL"
      // 悄悄解绑，一次 302 就能把 https://docs.example.com 变成元数据端点。
      let response: Response;
      let hops = 0;
      for (;;) {
        response = await fetch(target, {
          signal: controller.signal,
          redirect: "manual",
        });

        const isRedirect = response.status >= 300 && response.status < 400;
        if (!isRedirect) break;

        const location = response.headers.get("location");
        if (!location) break; // 声称重定向却没给 Location，当普通响应处理

        if (++hops > MAX_REDIRECTS) {
          return {
            content: `Error: too many redirects (>${MAX_REDIRECTS}) starting from ${raw}`,
            isError: true,
          };
        }

        // 相对 Location 要基于当前 URL 解析
        const next = new URL(location, target);
        const reject = rejectReason(next);
        if (reject) {
          // 这条错误信息要说清"从哪跳到哪"，否则用户只会困惑于自己批准过的域名
          return {
            content:
              `Error: refusing to follow redirect from ${target.href} to ${next.href} — ${reject}`,
            isError: true,
          };
        }
        target = next;
      }

      if (!response.ok) {
        return {
          content: `Error: HTTP ${response.status} ${response.statusText} for ${target.href}`,
          isError: true,
        };
      }

      const body = await response.text();
      const truncated = body.length > MAX_CONTENT_CHARS;
      const content = truncated ? body.slice(0, MAX_CONTENT_CHARS) : body;

      // 实际抓的可能不是模型给的那个 URL（跟过重定向），如实告诉它
      const header = target.href === raw ? "" : `(followed redirects to ${target.href})\n\n`;

      return {
        content: truncated
          ? `${header}${content}\n\n--- Truncated at ${MAX_CONTENT_CHARS} chars (total ${body.length}). ---`
          : `${header}${content}`,
        isError: false,
      };
    } catch (err) {
      const error = err as Error;
      if (error.name === "AbortError") {
        return {
          content: `Error: request timed out after ${FETCH_TIMEOUT_MS}ms: ${target.href}`,
          isError: true,
        };
      }
      return { content: `Error fetching ${target.href}: ${error.message}`, isError: true };
    } finally {
      clearTimeout(timer);
    }
  },
};
