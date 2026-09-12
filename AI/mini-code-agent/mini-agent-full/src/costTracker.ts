// src/costTracker.ts
// 对应 Claude Code: src/cost-tracker.ts + src/costHook.ts
//
// 成本追踪的本质极简：单调累加 + 模型查表。
// 关键在于把四类 token 分桶统计（普通输入 / 输出 / 缓存命中 / 缓存写入），
// 混算会抹平 prompt caching 的折扣，既算不准成本，也判断不出缓存有没有省到钱。
//
// 第 19 章在本章版本上扩展了「软预算告警」：跨过预算线时上报一条 Analytics
// 事件并提示用户一次（去重）。这里给出的是扩展后的最终版。

import type Anthropic from "@anthropic-ai/sdk";

interface ModelPricing {
  input: number; output: number; cacheRead: number; cacheWrite: number; // 每百万 token 单价（美元）
}
interface Breakdown {
  input: number; output: number; cacheRead: number; cacheWrite: number;
  costUSD: number; calls: number;
}

// 单价随官方调整变化，以你使用的 API 文档为准；FALLBACK 用于未知模型，不崩只是价不准
const PRICING: Record<string, ModelPricing> = {
  "claude-sonnet-4-20250514": { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
};
const FALLBACK_PRICING: ModelPricing = { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 };

/** 未设 MINI_BUDGET_USD 时的软预算（美元），同书中 `?? "1.0"` 的口径。 */
const DEFAULT_BUDGET_USD = 1.0;

/**
 * 解析 MINI_BUDGET_USD。
 * 书中写的是 `Number(process.env.MINI_BUDGET_USD ?? "1.0")`，但 "5.0USD" → NaN、"" → 0、
 * "-1" → 负数，都会让 `totalCostUSD < budgetUSD` 在第一次 API 调用后就成立，
 * 于是刚花 $0.0000 就打印「超过软预算 $NaN」，还把 NaN 上报进 Analytics。
 * 所以这里补一道校验：不是有限正数就当作没设，退回默认值并提示一次（构造时打，一个进程一个 tracker）。
 */
function parseBudgetUSD(raw: string | undefined): number {
  if (raw === undefined) return DEFAULT_BUDGET_USD;
  const parsed = Number(raw);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  console.error(
    `[Budget] MINI_BUDGET_USD="${raw}" 不是有效的正数金额，` +
    `本次按默认软预算 $${DEFAULT_BUDGET_USD.toFixed(2)} 处理。`,
  );
  return DEFAULT_BUDGET_USD;
}

export class CostTracker {
  private totalCostUSD = 0;
  private perModel: Record<string, Breakdown> = {};
  private startTime = Date.now();

  // 第 19 章新增：软预算告警
  private budgetUSD = parseBudgetUSD(process.env.MINI_BUDGET_USD);  // 软预算，可配（非法值退回默认）
  private warned = false;

  // analytics 从构造函数注入（bootstrap 里 new CostTracker(analytics)）；
  // 只依赖一个最小接口，避免 CostTracker 反向依赖具体 Analytics 类。
  constructor(private analytics?: { logEvent(n: string, m: Record<string, number | boolean>): void }) {}

  /** 每次 API 响应回来后调用一次，传入 usage 和实际模型 */
  add(usage: Anthropic.Usage, model: string): void {
    const p = PRICING[model] ?? FALLBACK_PRICING;
    const input  = usage.input_tokens ?? 0;
    const output = usage.output_tokens ?? 0;
    const cacheR = usage.cache_read_input_tokens ?? 0;
    const cacheW = usage.cache_creation_input_tokens ?? 0;

    const cost =
      (input * p.input + output * p.output +
       cacheR * p.cacheRead + cacheW * p.cacheWrite) / 1_000_000;

    this.totalCostUSD += cost;

    const b = (this.perModel[model] ??= {
      input: 0, output: 0, cacheRead: 0, cacheWrite: 0, costUSD: 0, calls: 0,
    });
    b.input += input; b.output += output;
    b.cacheRead += cacheR; b.cacheWrite += cacheW;
    b.costUSD += cost; b.calls += 1;

    this.checkBudget(); // 第 19 章新增：累加完顺手看一眼预算
  }

  /** 供 /status 与退出时上报的快照：总额、运行时长、各模型分桶 */
  summary(): string {
    const dur = Math.round((Date.now() - this.startTime) / 1000);
    const lines = [`Total: $${this.totalCostUSD.toFixed(4)}   Duration: ${dur}s`];
    for (const [model, b] of Object.entries(this.perModel)) {
      lines.push(
        `  ${model}: $${b.costUSD.toFixed(4)} (${b.calls} call, ` +
        `in ${b.input} / out ${b.output} / cacheR ${b.cacheRead})`,
      );
    }
    return lines.join("\n");
  }

  /** 跨过软预算就告警一次（去重）。第 19 章新增，在 add() 末尾调用。 */
  private checkBudget(): void {
    if (this.warned || this.totalCostUSD < this.budgetUSD) return;
    this.warned = true;
    this.analytics?.logEvent("budget_exceeded", {
      budget_usd: this.budgetUSD,
      // 注意：只记金额，不记任何会话内容
    });
    console.error(
      `\n[Budget] 本次会话已花费 $${this.totalCostUSD.toFixed(4)}，` +
      `超过软预算 $${this.budgetUSD.toFixed(2)}。继续 / 换更便宜的模型 / 新开会话？`,
    );
  }
}
