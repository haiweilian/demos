// src/hooks/hookBus.ts
// 对应 Claude Code: src/utils/hooks.ts 的 getMatchingHooks() + executeHooks()

import type { Hook, HookEvent, HookInput, HookResult } from "./types.js";

const DEFAULT_HOOK_TIMEOUT_MS = 5000;

export class HookBus {
  /** 按事件名分桶存放钩子。对应 Claude Code 的 HooksSettings 结构。 */
  private hooks = new Map<HookEvent, Hook[]>();

  /** 注册一个钩子。 */
  register(hook: Hook): void {
    const bucket = this.hooks.get(hook.event) ?? [];
    bucket.push(hook);
    this.hooks.set(hook.event, bucket);
  }

  /** 取出某事件下、且 matcher 命中的钩子。
   *  对应 Claude Code: getMatchingHooks() 里的 matchesPattern()。 */
  private getMatching(input: HookInput): Hook[] {
    const bucket = this.hooks.get(input.event) ?? [];
    // 只有工具类事件才带 toolName，用它做匹配查询值。
    const matchQuery =
      input.event === "PreToolUse" || input.event === "PostToolUse"
        ? input.toolName
        : undefined;

    return bucket.filter((h) => {
      if (!h.matcher || h.matcher === "*") return true; // 不设 matcher = 匹配全部
      if (matchQuery === undefined) return true;         // 非工具事件忽略 matcher
      return h.matcher === matchQuery;                   // 精确名匹配
    });
  }

  /** 广播一个事件，执行所有匹配钩子，聚合出流程决策。
   *  对应 Claude Code: executeHooks() + AggregatedHookResult。 */
  async emit(input: HookInput): Promise<AggregatedResult> {
    const matching = this.getMatching(input);
    if (matching.length === 0) {
      // 快速路径：无钩子直接返回。对应 Claude Code 的 hasHookForEvent()。
      return { blocked: false, additionalContexts: [] };
    }

    const aggregated: AggregatedResult = { blocked: false, additionalContexts: [] };

    // 按注册顺序逐个执行。每个钩子独立超时、独立 try/catch。
    for (const hook of matching) {
      const budget = hook.timeoutMs ?? DEFAULT_HOOK_TIMEOUT_MS;
      let result: HookResult | void;
      try {
        result = await withTimeout(
          Promise.resolve(hook.callback(input)),
          budget,
          hook.name,
        );
      } catch (err) {
        // 钩子抛错或超时：默认只记录、不影响主流程（旁路钩子的"超时 ≠ 拦截"）。
        const message = (err as Error).message;
        console.error(`[Hook] "${hook.name}" failed: ${message}`);
        // fail-closed 兜底：安全闸门（如权限确认）没能给出结论时，"没结论"只能
        // 当"不放行"。否则闸门一超时就静默放行，比没有闸门更危险。
        if (hook.failClosed) {
          aggregated.blocked = true;
          aggregated.blockReason = `钩子 "${hook.name}" 未能完成检查（${message}），按拦截处理`;
        }
        continue;
      }

      if (!result) continue; // 什么都没返回 = 放行、无补充

      // 聚合：任一钩子要拦截，整体就拦截（拦截优先）。
      if (result.block) {
        aggregated.blocked = true;
        if (result.reason) aggregated.blockReason = result.reason;
      }
      // 补充上下文累加（多个钩子的 context 全部保留）。
      if (result.additionalContext) {
        aggregated.additionalContexts.push(result.additionalContext);
      }
    }

    return aggregated;
  }
}

/** 聚合多个钩子的结果。对应 Claude Code: AggregatedHookResult。 */
export interface AggregatedResult {
  blocked: boolean;
  blockReason?: string;
  additionalContexts: string[];
}

/** 给一个 Promise 套超时；超时则 reject。 */
function withTimeout<T>(p: Promise<T>, ms: number, name: string): Promise<T> {
  // 不设上限（Infinity）就不要挂定时器：setTimeout 存不下 Infinity，
  // Node 会把它截成 1ms 立刻触发，反而把钩子秒杀。
  if (!Number.isFinite(ms)) return p;
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Hook "${name}" timed out after ${ms}ms`)),
      ms,
    );
    // 无论钩子完成还是抛错，都要清掉定时器，别让它拖住进程退出
    p.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}
