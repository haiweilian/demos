// src/hooks/types.ts
// 对应 Claude Code: src/types/hooks.ts 的 HookInput 联合类型

/** MiniAgent 支持的生命周期事件名。
 *  对应 Claude Code 的 HOOK_EVENTS 常量（我们只取核心几个，本章不实现）。 */
export type HookEvent =
  | "SessionStart"
  | "UserPromptSubmit"
  | "PreToolUse"
  | "PostToolUse"
  | "Stop";

/** 每个事件广播时携带的输入。用 event 字段做可辨识联合。 */
export type HookInput =
  | { event: "SessionStart"; cwd: string }
  | { event: "UserPromptSubmit"; prompt: string }
  // isReadOnly 随事件带上，权限钩子才能只拦有副作用的工具：钩子拿不到工具本身，
  // 只拿得到这个事件对象，不带这个字段，第 11 章的权限合同在重构后就没法兑现。
  | { event: "PreToolUse"; toolName: string; toolInput: Record<string, unknown>; isReadOnly: boolean }
  | { event: "PostToolUse"; toolName: string; toolInput: Record<string, unknown>; isError: boolean }
  | { event: "Stop"; finalText: string };

/** 钩子返回的结果。三个字段对应三种意图，都可选、可叠加。
 *  对应 Claude Code: syncHookResponseSchema（src/types/hooks.ts）的精简版。 */
export interface HookResult {
  /** 设为 false 表示拦截：阻止后续动作（如阻止工具执行）。默认放行。 */
  block?: boolean;
  /** 拦截或提示时给出的原因，会反馈给模型或打印给用户。 */
  reason?: string;
  /** 要注入对话的补充上下文（如 SessionStart 加载的环境信息）。 */
  additionalContext?: string;
}

/** 一个钩子的定义。
 *  callback 拿到事件输入，返回结果（同步或异步均可）。 */
export interface Hook {
  /** 钩子名，用于日志和去重。 */
  name: string;
  /** 订阅哪个事件。 */
  event: HookEvent;
  /** 可选：只在 toolName 匹配时才触发（仅对工具类事件有意义）。 */
  matcher?: string;
  /** 单个钩子的超时（毫秒）。不设则用总线默认值；
   *  设成 Number.POSITIVE_INFINITY 表示不设上限（等人按键这类钩子必须如此）。 */
  timeoutMs?: number;
  /** 把这个钩子标记成"安全闸门"。默认 false —— 旁路钩子（审计、注入上下文）
   *  超时或抛错只记日志、不影响放行。设为 true 时反过来：钩子没能给出结论，
   *  总线就按"拦截"处理。理由见 12.4.3。 */
  failClosed?: boolean;
  /** 钩子逻辑。返回 HookResult；什么都不返回视为"放行、无补充"。 */
  callback(input: HookInput): HookResult | void | Promise<HookResult | void>;
}
