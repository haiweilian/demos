// src/magicDocs.ts
// 第 10 章教学实现：MagicDocs —— 证据驱动的文档补丁流水线
//
// 核心立场：文档不是"模型顺手写的 Markdown"，而是团队与用户之间的契约。
// 因此代码变化 → 文档变化必须像一笔事务：
//
//   代码变化 → 判断影响 → 找到证据 → 生成候选 patch
//          → 重算风险 → 预览 diff → 检查旧文本仍匹配
//          → 自动应用 / 等待确认 / 拒绝
//
// 本模块只提供纯函数 + 一次复用 Edit 的应用入口，不主动扫描仓库、
// 不整文件覆盖、不对中高风险文档自动写盘。

import * as path from "path";
import { EditFileTool } from "./tools/editFile.js";
import type { ToolResult } from "./types.js";

// ============================================================
// 10.2 从代码变化到文档候选
// ============================================================

/**
 * 一次代码变化的影响说明。
 * 先产出"影响 + 证据"，而不是直接产出文案：
 * 只有说得清 publicBehavior，才有资格谈要不要改文档。
 */
export interface ChangeEvidence {
  changedFiles: string[];
  publicBehavior: string;
  verification: Array<{
    command: string;
    exitCode: number;
    summary: string;
  }>;
}

/**
 * 一个文档候选。
 * matchedText 是文档里真实命中的旧行为描述，
 * relationship 说明"这份文档为什么受这次行为变化影响"——
 * 它会在确认界面展示，帮助人判断 Agent 是否找对了地方。
 *
 * 候选允许为空：确认"这是内部重构，无用户可见变化"同样是正确结果。
 */
export interface DocCandidate {
  filePath: string;
  matchedText: string;
  relationship: string;
}

// ============================================================
// 10.3 候选补丁：内容、前提与证据放在一起
// ============================================================

/**
 * 一个可应用的文档补丁。
 *
 * oldText 不是为了生成漂亮 diff 才保存，它承担乐观并发控制：
 * "我是在文件里仍然存在这一段精确旧文本的前提下提出修改；
 *  前提不成立就必须重新读取和重新生成。"
 * 这与第 4 章 EditFileTool 的唯一匹配规则正好一致。
 *
 * evidence 不能只写"测试通过"，至少记录命令、退出码和简短结果，
 * 让审核者能回答：这句"现在支持 X"是根据哪次验证写的？
 */
export interface DocPatch {
  filePath: string;
  reason: string;
  oldText: string;
  newText: string;
  risk: "low" | "medium" | "high";
  evidence: ChangeEvidence["verification"];
}

// ============================================================
// 10.4 风险必须由执行端重算，不能相信模型自报
// ============================================================

const HIGH_RISK_PATHS = [
  "privacy",
  "terms",
  "license",
  "security",
  "pricing",
];

const HIGH_RISK_CLAIMS = [
  "price",
  "refund",
  "guarantee",
  "sla",
  "security",
  "fully compatible",
  "价格",
  "退款",
  "保证",
  "服务等级",
  "完全兼容",
  "不会上传",
];

/**
 * 保守分类器：风险不是"文字改了多少"，而是"写错后会造成什么后果"。
 *
 * - high：隐私、条款、许可证、安全、价格等承诺性内容，必须人工审核。
 * - medium：README 与一般文档，展示 diff 等确认。
 * - low：示例目录等非承诺性说明，满足证据门槛后才可自动应用。
 *
 * 它不是法律审查工具：任务是把明显高风险内容抬到人工路径，
 * 而不是证明其余文字绝对安全——漏掉同义词时 README 仍默认 medium。
 */
export function classifyDocRisk(
  filePath: string,
  newText: string,
): DocPatch["risk"] {
  const lowerPath = filePath.toLowerCase();
  const lowerText = newText.toLowerCase();

  if (HIGH_RISK_PATHS.some((part) => lowerPath.includes(part))) {
    return "high";
  }
  if (HIGH_RISK_CLAIMS.some((claim) => lowerText.includes(claim))) {
    return "high";
  }
  if (lowerPath.endsWith("readme.md") || lowerPath.includes("docs/")) {
    return "medium";
  }
  return "low";
}

/**
 * 把 risk 的创建集中到工厂函数，避免调用方随手伪造。
 * 但即使用了它，执行端仍要重算一次：
 * 对象可能来自模型 JSON、缓存文件或另一个进程，
 * 类型系统无法证明运行时数据可信。
 */
export function createDocPatch(
  input: Omit<DocPatch, "risk">,
): DocPatch {
  return {
    ...input,
    risk: classifyDocRisk(input.filePath, input.newText),
  };
}

// ============================================================
// 10.5 "有证据"具体指什么
// ============================================================

/** 没有运行证据，不写"已支持"；任何一条相关验证失败都不算通过。 */
function hasPassingEvidence(patch: DocPatch): boolean {
  return (
    patch.evidence.length > 0 &&
    patch.evidence.every((item) => item.exitCode === 0)
  );
}

/**
 * 自动应用门控。同时拒绝五种情况：
 * 1. 目标或文字实际属于中高风险；
 * 2. 对象里的 risk 与本地重算不一致（模型伪造 low 也拦得住）；
 * 3. 没有精确旧文本，无法做冲突检查；
 * 4. 新旧文本相同，属于无效 patch；
 * 5. 没有验证，或任何一条相关验证失败。
 */
export function canAutoApply(patch: DocPatch): boolean {
  const effectiveRisk = classifyDocRisk(patch.filePath, patch.newText);
  return (
    effectiveRisk === "low" &&
    patch.risk === effectiveRisk &&
    patch.oldText.trim().length > 0 &&
    patch.oldText !== patch.newText &&
    hasPassingEvidence(patch)
  );
}

// ============================================================
// 10.6 预览 diff：让人看见"为什么改"和"改了什么"
// ============================================================

/**
 * 确认界面的最小信息集：路径、影响关系、重算后的风险、证据摘要、精确 diff。
 * 不是完整 unified diff，但足以让人判断这次修改是否有根据。
 * 注意 risk 一行用的是重算结果，不是 patch 自带字段。
 */
export function formatDocPatchPreview(patch: DocPatch): string {
  const evidence = patch.evidence.length
    ? patch.evidence.map(
        (item) => `  - [${item.exitCode}] ${item.command}: ${item.summary}`,
      )
    : ["  - (no verification evidence)"];

  return [
    `[MagicDocs] ${patch.filePath}`,
    `reason: ${patch.reason}`,
    `risk:   ${classifyDocRisk(patch.filePath, patch.newText)}`,
    "evidence:",
    ...evidence,
    "diff:",
    `- ${patch.oldText}`,
    `+ ${patch.newText}`,
  ].join("\n");
}

// ============================================================
// 10.7 应用补丁：复用 Edit，并把冲突当正常结果
// ============================================================

/**
 * 应用一个文档补丁。
 *
 * 只有低风险 + 证据齐全 + 无伪造时才真正写盘，且写盘走第 4 章的
 * EditFileTool，守住三条边界：路径受工作目录约束（这一条由下面的 resolve
 * 校验兜底，见函数体注释）、old_string 必须唯一匹配、匹配失败返回可解释错误
 * 而不偷偷整文件重写。
 *
 * 中高风险分支在本章只打印预览并停住；第 11 章接入权限层后，
 * 这里会变成 PermissionDecision { behavior: "ask" }，展示同一份 preview，
 * 用户 Allow once 才调用 EditFileTool——且批准的是哪一个 DocPatch，
 * 执行的就必须是同一个，不允许确认后再让模型润色 newText。
 *
 * oldText 已不存在意味着候选过期：重新 ReadFile、重新生成候选、重走门控，
 * 不要退化成模糊匹配。冲突不是工具太笨，而是系统在说"世界已经变了"。
 */
export async function applyDocPatch(
  patch: DocPatch,
  cwd: string,
): Promise<ToolResult> {
  console.log(formatDocPatchPreview(patch));

  if (!canAutoApply(patch)) {
    return {
      content:
        `Doc patch to ${patch.filePath} requires confirmation ` +
        `or fresh verification. Not applied.`,
      isError: false,
    };
  }

  // 边界一（目标文件必须落在工作目录内）在 EditFileTool 里其实没有实现，
  // 而 editFile.ts 是与基线工程逐字共享的文件，不能在这里改动它。
  // 于是把这道校验补在写盘入口上：解析后必须仍在 cwd 内，否则一个判为 low
  // 且证据齐全的补丁就能把项目外的文件（如 /tmp/outside/notes.md）改掉。
  // 解析规则与 EditFileTool 一致：绝对路径直接用，相对路径相对 cwd 解析。
  const resolvedCwd = path.resolve(cwd);
  const resolvedTarget = path.resolve(resolvedCwd, patch.filePath);
  if (
    resolvedTarget !== resolvedCwd &&
    !resolvedTarget.startsWith(resolvedCwd + path.sep)
  ) {
    return {
      content:
        `Error: Doc patch target ${resolvedTarget} is outside the working ` +
        `directory ${resolvedCwd}. Not applied.`,
      isError: true,
    };
  }

  return EditFileTool.execute(
    {
      file_path: patch.filePath,
      old_string: patch.oldText,
      new_string: patch.newText,
    },
    cwd,
  );
}
