// src/permissions.ts
// 对应 Claude Code: src/types/permissions.ts + src/utils/permissions/permissions.ts
// 以及 src/tools/BashTool/bashPermissions.ts、bashSecurity.ts

/**
 * 权限检查模块（第 11 章版本：三值决策 + 模式）。
 *
 * Claude Code 的权限系统极其精密，本模块实现它的最小同构版：
 *   deny 规则（黑名单不可绕过）→ 模式放行 → 兜底 ask。
 */
import * as readline from "readline";

/** 三种权限行为，对应 Claude Code 的 PermissionBehavior */
export type PermissionBehavior = "allow" | "deny" | "ask";

/** 权限模式，取 Claude Code 用户可见模式的最小子集 */
export type PermissionMode =
  | "default"     // 写操作逐次确认（安全底线）
  | "acceptEdits" // 文件编辑自动放行，命令仍要确认
  | "plan"        // 只读，所有写操作一律拒绝
  | "bypass";     // 跳过大部分检查（deny 仍生效）

export interface PermissionDecision {
  behavior: PermissionBehavior;
  /** 给人看 / 回传给模型的理由 */
  reason: string;
}

/** 危险命令模式：命中即 deny，任何模式都不能绕过（含 bypass） */
const DANGEROUS_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  {
    pattern: /\brm\s+(-[a-zA-Z]*f[a-zA-Z]*\s+|.*-[a-zA-Z]*r[a-zA-Z]*f)/,
    reason: "递归强制删除（rm -rf）可能永久损毁数据",
  },
  {
    pattern: /\brm\s+(-[a-zA-Z]*r[a-zA-Z]*\s+).*(\*|\/)/,
    reason: "对通配符或根路径递归删除很危险",
  },
  {
    pattern: /\bgit\s+push\s+.*--force\b/,
    reason: "强制推送会覆盖远端历史",
  },
  {
    pattern: /\bgit\s+reset\s+--hard\b/,
    reason: "硬重置会丢弃未提交改动",
  },
  {
    pattern: /\bgit\s+clean\s+.*-f/,
    reason: "git clean -f 会永久删除未跟踪文件",
  },
  {
    pattern: /\b(chmod|chown)\s+.*-R\s+.*(\/|~)/,
    reason: "对宽泛路径递归改权限很危险",
  },
  {
    pattern: /\bcurl\s+.*\|\s*(bash|sh|zsh)\b/,
    reason: "把远程内容管道进 shell 有安全风险",
  },
  {
    pattern: /\bsudo\b/,
    reason: "以提权方式执行命令",
  },
  {
    pattern: /\b(DROP|DELETE\s+FROM|TRUNCATE)\b/i,
    reason: "破坏性数据库操作",
  },
  {
    pattern: />\s*\/dev\/sd[a-z]/,
    reason: "直接写入磁盘设备",
  },
  {
    pattern: /\b(mkfs|fdisk|dd\s+if=)\b/,
    reason: "低层磁盘操作",
  },
];

/** 受限写入路径：命中即 deny */
const RESTRICTED_WRITE_PATHS = [
  /^\/etc\//,
  /^\/usr\//,
  /^\/boot\//,
  /^\/sys\//,
  /^\/proc\//,
];

/**
 * 命令权限检查。对应 Claude Code 的 hasPermissionsToUseToolInner 流水线（精简版）。
 * 顺序即优先级：deny → 模式放行 → 兜底 ask。
 */
export function checkCommandPermission(
  command: string,
  mode: PermissionMode,
): PermissionDecision {
  // ① deny 规则：黑名单优先，任何模式都不能绕过
  for (const { pattern, reason } of DANGEROUS_PATTERNS) {
    if (pattern.test(command)) {
      return { behavior: "deny", reason: `危险命令被拦截：${reason}` };
    }
  }

  // plan 模式：所有命令（写操作）一律拒绝
  if (mode === "plan") {
    return { behavior: "deny", reason: "plan 模式下不能执行命令，只能规划" };
  }

  // ② 模式放行：bypass 跳过后续确认（但已过 deny）
  if (mode === "bypass") {
    return { behavior: "allow", reason: "bypass 模式放行" };
  }

  // ③ 兜底：命令是有副作用的写操作 → 问人
  return { behavior: "ask", reason: `执行命令：${command}` };
}

/**
 * 文件写入权限检查。acceptEdits 模式下放行普通写入，这是它和 default 的唯一区别。
 */
export function checkWritePermission(
  filePath: string,
  mode: PermissionMode,
): PermissionDecision {
  // ① deny：受限路径不可绕过
  for (const pattern of RESTRICTED_WRITE_PATHS) {
    if (pattern.test(filePath)) {
      return { behavior: "deny", reason: `禁止写入受限路径：${filePath}` };
    }
  }
  if (mode === "plan") {
    return { behavior: "deny", reason: "plan 模式下不能写文件" };
  }
  if (mode === "bypass") {
    return { behavior: "allow", reason: "bypass 模式放行" };
  }
  // ② acceptEdits：文件编辑自动放行（命令不享受这个待遇）
  if (mode === "acceptEdits") {
    return { behavior: "allow", reason: "acceptEdits 模式自动放行文件编辑" };
  }
  // ③ 兜底：default 模式 → 问人
  return { behavior: "ask", reason: `写入文件：${filePath}` };
}

/**
 * 交互式确认处理器。对应 Claude Code: interactiveHandler。
 *
 * 关键不变量：这次批准只对这一次调用生效（once-only）。
 * 不在这里写任何"以后都允许"的持久化——那样会变成永久放权。
 */
export function askUserConfirmation(
  decision: PermissionDecision,
  toolName: string,
): Promise<PermissionBehavior> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // 提示信息必须"足够判断"：工具名 + 完整理由（含命令/路径）
    console.log(`\n⚠️  需要确认 [${toolName}]`);
    console.log(`    ${decision.reason}`);

    rl.question("    允许这一次执行吗？(y/N) ", (answer) => {
      rl.close(); // 读完即关，不复用这一次的批准
      const yes = answer.trim().toLowerCase();
      resolve(yes === "y" || yes === "yes" ? "allow" : "deny");
    });
  });
}
