// src/projectMemory.ts
// 第 9 章：跨会话记忆（教学实现，public repo 的 mini-agent/ 基线没有此文件）
//
// 核心原则：只存"从当前项目状态推不出来、但以后仍会影响决策"的信息。
// 一条记忆要走完六个阶段：捕获 → 审核 → 存储 → 检索 → 注入 → 遗忘。
// 本文件负责其中的审核、存储、检索、遗忘；捕获（/remember 命令）和
// 注入（system prompt 拼接）在 src/cli.ts 里接线。

import { randomUUID } from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";

// ============================================================
// 数据模型：让每条记忆都可追踪
// ============================================================

export type ProjectMemoryKind =
  | "constraint"
  | "preference"
  | "correction"
  | "environment";

export interface ProjectMemoryItem {
  id: string;
  projectRoot: string;
  kind: ProjectMemoryKind;
  text: string;
  source: "user" | "agent-confirmed";
  createdAt: string;
}

export type NewProjectMemory = Pick<
  ProjectMemoryItem,
  "projectRoot" | "kind" | "text" | "source"
>;

/**
 * JSONL 是本地可编辑文件，读回来的每一行都必须当成不可信输入校验。
 * 这里不做 schema 库，只做最小结构判断。
 */
function isProjectMemoryItem(value: unknown): value is ProjectMemoryItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.projectRoot === "string" &&
    typeof item.text === "string" &&
    typeof item.createdAt === "string" &&
    ["constraint", "preference", "correction", "environment"].includes(
      String(item.kind),
    ) &&
    ["user", "agent-confirmed"].includes(String(item.source))
  );
}

// ============================================================
// 项目身份：不能只比较用户传进来的字符串
// ============================================================

/**
 * 把项目根目录规范化成一个稳定身份。
 * 优先用 realpath 解开符号链接；目录暂时不存在时退回 path.resolve。
 * 写入和读取必须共用这一个函数，否则项目隔离会失效。
 */
async function canonicalProjectRoot(projectRoot: string): Promise<string> {
  const resolved = path.resolve(projectRoot);
  try {
    return await fs.realpath(resolved);
  } catch {
    return resolved;
  }
}

// ============================================================
// 写入门控：先拒绝不该留下的内容
// ============================================================

const SENSITIVE_MEMORY_PATTERNS: RegExp[] = [
  /\b(?:sk|api)[-_][A-Za-z0-9_-]{12,}\b/i,
  /\bBearer\s+[A-Za-z0-9._~+\/-]+=*\b/i,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /(?:password|passwd|token|secret)\s*[:=]\s*\S+/i,
  /(?:^|\s)~?\/\.ssh(?:\/|\s|$)/,
];

/**
 * 校验并规范化一条记忆文本。
 *
 * 故意压成单行：长期记忆应该是一条可审查的事实，
 * 而不是一整段会被模型误当成任务的提示词。
 *
 * 注意：正则扫描不是绝对安全边界，只是第二道保险。
 * 第一道门始终是"用户显式写入 + 写入前展示内容"。
 */
export function validateMemoryText(text: string): string {
  const normalized = text.trim().replace(/\s+/g, " ");

  if (!normalized) throw new Error("Memory text cannot be empty");
  if (normalized.length > 300) {
    throw new Error("Memory must be a short fact (max 300 characters)");
  }
  if (/<\/?project-memory>/i.test(normalized)) {
    throw new Error("Memory contains a reserved delimiter");
  }
  if (SENSITIVE_MEMORY_PATTERNS.some((pattern) => pattern.test(normalized))) {
    throw new Error("Memory may contain sensitive information");
  }

  return normalized;
}

// ============================================================
// 最小 JSONL 仓库：追加、隔离、去重、遗忘
// ============================================================

export class ProjectMemoryStore {
  constructor(private readonly filePath: string) {}

  /**
   * 实例级写队列：把所有写操作串成一条 Promise 链。
   *
   * append 和 forget 都是"读全量 → 改 → 写回"，两个操作交叉执行时，
   * 后写的一方会用自己那份陈旧快照覆盖先写的一方（实测并发 append + forget
   * 时，append 返回了记录、forget 返回 true，但新记忆在文件里彻底消失且不报错）。
   * 串行化之后，每个写操作都读到上一个写完的结果。
   *
   * 边界：这只挡住同一进程内的并发。两个终端各开一个 MiniAgent 写同一份
   * JSONL 仍会互相覆盖，要彻底解决得上文件锁（跨平台锁实现超出本章范围，
   * 也不值得为此引入第三方依赖）。
   */
  private writeQueue: Promise<unknown> = Promise.resolve();

  /** 把一个写操作排进队列；前一个失败不能卡死后面的写入 */
  private enqueueWrite<T>(task: () => Promise<T>): Promise<T> {
    const result = this.writeQueue.then(task, task);
    this.writeQueue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  async append(input: NewProjectMemory): Promise<ProjectMemoryItem> {
    return this.enqueueWrite(() => this.appendSerialized(input));
  }

  private async appendSerialized(
    input: NewProjectMemory,
  ): Promise<ProjectMemoryItem> {
    const projectRoot = await canonicalProjectRoot(input.projectRoot);
    const text = validateMemoryText(input.text);
    const existing = await this.listForProject(projectRoot);
    // 去重发生在写入前，用 kind + text 精确比较，不做语义相似度判断
    const duplicate = existing.find(
      (item) => item.kind === input.kind && item.text === text,
    );
    if (duplicate) return duplicate;

    const item: ProjectMemoryItem = {
      ...input,
      id: randomUUID(),
      projectRoot,
      text,
      createdAt: new Date().toISOString(),
    };

    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.appendFile(this.filePath, JSON.stringify(item) + "\n", "utf-8");
    return item;
  }

  async listForProject(projectRoot: string): Promise<ProjectMemoryItem[]> {
    const canonicalRoot = await canonicalProjectRoot(projectRoot);
    const items = await this.readAll();
    return items.filter((item) => item.projectRoot === canonicalRoot);
  }

  /**
   * 按 id + projectRoot 查一条记忆。
   * `/forget <id>` 要先把目标文本展示给用户确认，删除前必须能看见删的是什么。
   */
  async findById(
    projectRoot: string,
    id: string,
  ): Promise<ProjectMemoryItem | undefined> {
    const items = await this.listForProject(projectRoot);
    return items.find((item) => item.id === id);
  }

  /**
   * 按 id + projectRoot 删除一条记忆，用临时文件原子替换，
   * 避免重写到一半进程退出留下半个文件。写操作同样走队列串行化。
   */
  async forget(projectRoot: string, id: string): Promise<boolean> {
    return this.enqueueWrite(() => this.forgetSerialized(projectRoot, id));
  }

  private async forgetSerialized(
    projectRoot: string,
    id: string,
  ): Promise<boolean> {
    const canonicalRoot = await canonicalProjectRoot(projectRoot);
    const items = await this.readAll();
    const kept = items.filter(
      (item) => !(item.projectRoot === canonicalRoot && item.id === id),
    );

    if (kept.length === items.length) return false;

    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const tempPath = `${this.filePath}.tmp`;
    const content = kept.map((item) => JSON.stringify(item)).join("\n");
    await fs.writeFile(tempPath, content ? content + "\n" : "", "utf-8");
    await fs.rename(tempPath, this.filePath);
    return true;
  }

  /** 一行损坏不拖垮全部启动：跳过坏行并在 stderr 提醒，其余记忆照常加载 */
  private async readAll(): Promise<ProjectMemoryItem[]> {
    let raw: string;
    try {
      raw = await fs.readFile(this.filePath, "utf-8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }

    return raw.split("\n").flatMap((line) => {
      if (!line.trim()) return [];
      try {
        const parsed: unknown = JSON.parse(line);
        if (!isProjectMemoryItem(parsed)) throw new Error("invalid record shape");
        return [parsed];
      } catch {
        console.error("[Memory] Skipped one invalid JSONL record");
        return [];
      }
    });
  }
}

// ============================================================
// 检索：先排序，再限量
// ============================================================

const MEMORY_PRIORITY: Record<ProjectMemoryKind, number> = {
  correction: 4,
  constraint: 3,
  preference: 2,
  environment: 1,
};

/**
 * 完全确定性的检索：先按类别优先级，同类别内较新的在前，最后限量。
 * 不引入向量检索——记忆量小、类别明确，当前项目已经是强过滤条件。
 */
export function selectMemories(
  items: ProjectMemoryItem[],
  limit = 10,
): ProjectMemoryItem[] {
  return [...items]
    .sort((a, b) => {
      const priority = MEMORY_PRIORITY[b.kind] - MEMORY_PRIORITY[a.kind];
      if (priority !== 0) return priority;
      return b.createdAt.localeCompare(a.createdAt);
    })
    .slice(0, Math.max(0, limit));
}
