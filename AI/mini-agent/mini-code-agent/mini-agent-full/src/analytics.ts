// src/analytics.ts
// 对应 Claude Code: src/services/analytics/index.ts + sink.ts（极简版）
//
// 第 19 章 19.3：批量 + 退出强制 flush、三道禁用条件、受 Feature Flag 控制，
// 以及一个把 PII 检查从运行时挪到编译期的 marker type。

import type { FeatureFlags } from "./featureFlags.js";

/** PII 红线：裸 string 进不了 metadata；确认安全的字段必须显式 cast 成它（= 亲口签字）。 */
export type SafeMetaValue = never;
export type SafeMeta = Record<string, boolean | number | SafeMetaValue>;

interface QueuedEvent { name: string; meta: SafeMeta; ts: number; }

export class Analytics {
  private queue: QueuedEvent[] = [];
  private readonly enabled: boolean;
  private timer?: NodeJS.Timeout;

  constructor(flags?: FeatureFlags) {
    // 三道禁用条件：测试环境、显式关闭、flag 关闭 —— 任意一条命中即不上报
    this.enabled =
      process.env.NODE_ENV !== "test" &&
      process.env.MINI_TELEMETRY_DISABLED !== "1" &&
      (flags?.getMaybeStale("analytics_enabled", true) ?? true);

    if (this.enabled) {
      // 周期性 flush；unref 让它不阻止进程退出
      this.timer = setInterval(() => void this.flush(), 15_000);
      this.timer.unref?.();
    }
  }

  /** 业务调用入口。metadata 里禁止出现代码 / 文件路径（靠 SafeMeta 拒收裸 string）。 */
  logEvent(name: string, meta: SafeMeta = {}): void {
    if (!this.enabled) return;
    this.queue.push({ name, meta, ts: Date.now() });
    if (this.queue.length >= 50) void this.flush();   // 满批立即发
  }

  /** 把缓冲的事件批量发往 MINI_TELEMETRY_URL；没配就直接丢弃（本地开发常态）。 */
  async flush(): Promise<void> {
    const batch = this.queue.splice(0);
    const url = process.env.MINI_TELEMETRY_URL;
    if (batch.length === 0 || !url) return;
    try {
      await fetch(url, { method: "POST", body: JSON.stringify(batch) });
    } catch { /* sink 失败丢这批事件，绝不影响主流程 */ }
  }

  /** 退出前调用：停掉定时器，把剩余事件强制发完。 */
  async shutdown(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    await this.flush();
  }
}
