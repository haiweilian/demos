# multi-agent-review

本书**第 18 章「做一个多代理 Review 系统」**的配套独立项目。一个 Coordinator 扫描源文件、并行派遣三个专业 Worker（Security / Performance / Style），再由聚合器去重、排序，最终给出 PASS / FAIL / WARN 判定。

直接基于 `@anthropic-ai/sdk`，不引入更高层封装，目的是让你看清**任务调度、消息总线、结果聚合**这些底层机器是怎么转的。

## 这是一个独立项目

它**不是** `MiniAgent`（主线单体 Agent）的子目录，也不嵌套在其中。它有自己的 `package.json` / `tsconfig.json`，依赖与 `MiniAgent` 不同，需要单独 `npm install`、单独构建、单独运行。三个项目（`MiniAgent`、`project-analyzer-mcp`、`multi-agent-review`）各自维护 `node_modules`，互不干扰。

## 架构：Coordinator + 3 Worker

三阶段工作流：**Research（扫描）→ Dispatch（并行派遣）→ Synthesis（聚合）**。

```
                       Coordinator
              ┌────────────┼────────────┐
              │            │            │
      SecurityWorker  PerformanceWorker  StyleWorker
       (注入/凭证/      (嵌套循环/泄漏/     (函数长度/命名/
        路径遍历…)       await-in-loop…)    错误处理…)
              │            │            │
              └────────────┼────────────┘
                           ▼
                   ResultAggregator
              （去重 / 排序 / PASS·FAIL·WARN 判定）
```

- **Coordinator**（`src/coordinator.ts`）—— 核心编排器。扫描项目（`scanProject`），用 `Promise.allSettled` 并行派遣三个 Worker，最后调用聚合器合并结果。三个 Worker 分析维度完全独立、无数据依赖，因此可以安全并行。
- **MessageBus**（`src/communication/messagebus.ts`）—— 类型安全的代理间通信。用 `discriminated union` 定义消息类型，单进程内以 `EventEmitter` 实现，接口对齐 Claude Code 的 SendMessage 模式。
- **TaskManager**（`src/tasks/taskManager.ts`）—— 追踪每个审查任务的生命周期（pending → running → completed / failed）。
- **Worker**（`src/workers/*`）—— 三个专业审查者，都实现 `ReviewWorker` 接口。`analyze()` **只返回 `ReviewFinding[]`**，没有文件写入能力——用类型系统在编译期约束「审查者不改文件」，这正是三个 Worker 能安全并行的前提。
  - `SecurityWorker`：静态模式匹配（硬编码凭证、SQL/命令注入、`eval`、路径遍历、CORS 配置）+ 对高优先级文件用 Claude 做深度语义分析。
  - `PerformanceWorker`：算法复杂度（嵌套循环、链式数组操作、循环内编译正则）、资源泄漏（监听器、`setInterval`、未关闭流）、异步模式（瀑布式 await、await-in-loop）、打包体积 + 对超过 100 行的复杂文件用 Claude 做深度性能分析（最多 5 个）。
  - `StyleWorker`：函数长度 / 参数数量 / 命名约定 / 代码组织 / 注释质量 / 错误处理，纯静态分析。
- **ResultAggregator**（`src/aggregator/resultAggregator.ts`）—— 去重（同文件同行同类别保留更严重的）、按严重程度排序、给出判定：有 critical 或 ≥3 个 high 判 `FAIL`，有 high 或 ≥5 个 medium 判 `WARN`，否则 `PASS`。
- **Reporter**（`src/utils/reporter.ts`）—— 把聚合报告格式化为终端文本或 JSON。

## 安装

```bash
npm install
```

依赖：`@anthropic-ai/sdk`（运行时）；`typescript` / `tsx` / `@types/node`（开发时）。

没有 API Key 也能先验证安装：`npm test`（静态分析工具的单元测试）和 `npm run typecheck` 都是纯本地运行，不调 API、不消耗 token。

## 运行

需要 `ANTHROPIC_API_KEY` 环境变量（Worker 的深度分析阶段会调用 Claude API；纯静态检查不消耗 token）。

```bash
# 开发期用 tsx 直接跑源码，审查当前目录
ANTHROPIC_API_KEY=sk-ant-xxx npx tsx src/main.ts .

# 审查指定项目
ANTHROPIC_API_KEY=sk-ant-xxx npm run review -- ./my-project

# JSON 输出（适合 CI 集成）
ANTHROPIC_API_KEY=sk-ant-xxx npx tsx src/main.ts ./my-project --json | jq '.verdict'

# 用更快更便宜的模型（代码默认模型 claude-sonnet-4-20250514 已列入 deprecated，尚可使用，建议按需覆盖）
ANTHROPIC_API_KEY=sk-ant-xxx npx tsx src/main.ts . --model claude-haiku-4-5-20251001

# 帮助
npx tsx src/main.ts --help
```

构建并以编译产物运行：

```bash
npm run build      # tsc → dist/
ANTHROPIC_API_KEY=sk-ant-xxx node dist/main.js .
```

## 退出码（可直接接 CI）

| 退出码 | 含义 |
|--------|------|
| `0` | `PASS` 或 `WARN`（无 critical / 多个 high 级别问题，不阻断流水线） |
| `1` | `FAIL`（发现 critical 或多个 high 级别问题） |
| `2` | 系统错误（扫描失败、API 错误等） |

注意：当前实现里缺少 `ANTHROPIC_API_KEY` 时也以退出码 `1` 退出（`src/main.ts`），CI 会把它误报成审查 `FAIL`——接入流水线前先确认 secret 已配置。

## 目录结构

```
multi-agent-review/
├── package.json
├── tsconfig.json
├── test/
│   └── utils.test.ts            # 静态分析工具的单元测试（不需要 API Key）
└── src/
    ├── main.ts                  # 入口：解析参数、跑审查、输出报告
    ├── coordinator.ts           # Coordinator 编排逻辑
    ├── workers/
    │   ├── types.ts             # Worker 接口与上下文定义
    │   ├── securityWorker.ts
    │   ├── performanceWorker.ts
    │   └── styleWorker.ts
    ├── tasks/
    │   ├── taskManager.ts       # 任务生命周期管理
    │   └── types.ts             # 任务 / 发现 / 报告类型
    ├── communication/
    │   └── messagebus.ts        # 类型安全的代理间通信
    ├── aggregator/
    │   └── resultAggregator.ts  # 去重 / 排序 / 判定
    └── utils/
        ├── fileScanner.ts       # 递归扫描源文件
        ├── codeParser.ts        # 正则解析导入 / 函数 / 字面量
        └── reporter.ts          # 终端 / JSON 报告格式化
```
