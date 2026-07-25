// src/featureFlags.ts
// 对应 Claude Code: src/services/analytics/growthbook.ts（极简版）
//
// 第 19 章 19.2：三层缓存（内存 / 磁盘 / 默认值）+ 环境变量覆盖 + 可选远程刷新。
// 主干纪律只有两条：查询按优先级逐层回退；拉取失败绝不让主线崩。

import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

/** flag 只支持三种标量类型，避免评估逻辑复杂化。 */
export type FlagValue = boolean | number | string;

/**
 * 磁盘缓存路径。书中固定为 ~/.mini-agent/flags.json；
 * 这里额外允许 MINI_AGENT_HOME 覆盖 home 目录，只为让测试不污染真实 home，
 * 不设该变量时行为与书中完全一致。
 */
const DISK_PATH = path.join(
  process.env.MINI_AGENT_HOME ?? os.homedir(),
  ".mini-agent",
  "flags.json",
);

export class FeatureFlags {
  private memory = new Map<string, FlagValue>();
  private disk: Record<string, FlagValue> = {};

  /** 开机时调用一次：先读磁盘缓存，再（可选）拉远程刷新内存。文件缺失/损坏走默认值，不报错。 */
  static async load(): Promise<FeatureFlags> {
    const flags = new FeatureFlags();
    try {
      flags.disk = toFlagRecord(JSON.parse(await fs.readFile(DISK_PATH, "utf8")), DISK_PATH);
    } catch { /* 缺失/损坏：保持空对象，查询时走默认值 */ }
    await flags.refresh();
    return flags;
  }

  /**
   * 三层查询：环境变量覆盖 → 内存 → 磁盘 → 默认值。
   * 函数名刻意带 MaybeStale，提醒调用方：这个值可能不是最新的。
   */
  getMaybeStale<T extends FlagValue>(key: string, defaultValue: T): T {
    const envKey = `MINI_FLAG_${key.toUpperCase()}`;
    if (process.env[envKey] !== undefined) {
      return coerce(process.env[envKey]!, defaultValue);  // 本地开发覆盖
    }
    if (this.memory.has(key)) return this.memory.get(key) as T;
    if (key in this.disk) return this.disk[key] as T;
    return defaultValue;
  }

  /** 拉取远程 flag。生产换成你的配置服务。 */
  async refresh(): Promise<void> {
    const url = process.env.MINI_FLAGS_URL;
    if (!url) return;                          // 没配远程源就只用本地，正常
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      const fresh = toFlagRecord(await res.json(), url);   // 非对象响应当作空 payload
      if (Object.keys(fresh).length === 0) return;   // 空 payload 不清缓存（铁律）
      this.memory = new Map(Object.entries(fresh));  // 整批替换内存缓存
      await this.syncToDisk();                       // 落盘，供下次冷启动兜底
    } catch {
      // 远程不可达：保持现有缓存，绝不让 Agent 因为拉 flag 失败而崩
    }
  }

  /** 把内存缓存写回磁盘，下次冷启动 / 离线时兜底。 */
  private async syncToDisk(): Promise<void> {
    await fs.mkdir(path.dirname(DISK_PATH), { recursive: true });
    await fs.writeFile(DISK_PATH, JSON.stringify(Object.fromEntries(this.memory)));
  }
}

/**
 * 把一份"合法 JSON 但未必是对象"的输入收敛成 flag 表。
 * 书中直接把 JSON.parse / res.json() 的结果当对象用，但 `null` / `42` / `[]` 都是合法 JSON，
 * 落到 `key in this.disk` 就是 TypeError，一次手抖改坏 flags.json 会把开机打断。
 * 这里统一校验：不是普通对象就当空配置，并打一行能定位到来源的警告——可观测层可以瞎，主线不能停。
 */
function toFlagRecord(raw: unknown, source: string): Record<string, FlagValue> {
  if (typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
    return raw as Record<string, FlagValue>;
  }
  const kind = raw === null ? "null" : Array.isArray(raw) ? "array" : typeof raw;
  console.error(`[FeatureFlags] ${source} 不是 JSON 对象（实际是 ${kind}），已忽略，本次走默认值`);
  return {};
}

/** 环境变量都是字符串：按默认值的类型转换（"true"/"1" → true，数字串 → number）。 */
function coerce<T extends FlagValue>(raw: string, defaultValue: T): T {
  if (typeof defaultValue === "boolean") return (raw === "true" || raw === "1") as T;
  if (typeof defaultValue === "number") return Number(raw) as T;
  return raw as T;
}
