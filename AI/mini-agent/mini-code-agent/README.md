# Mini Code Agent 示例源码

本仓库包含四个可以独立运行的 TypeScript 项目：

| 目录 | 对应内容 | 对应章节 | 是否需要 API Key |
|---|---|---|---|
| `mini-agent/` | 主线基线：最小 Code Agent，支持读文件、写文件、跑命令、搜索、上下文与权限 | 2–6、11 | 启动真实对话需要 `ANTHROPIC_API_KEY`；测试不需要 |
| `mini-agent-full/` | 完整整合版：在基线之上补齐会话记忆、跨会话记忆、MagicDocs、Hooks、MCP 客户端、Skills、工程化与离线 Eval | 5、7–19 | 同上 |
| `project-analyzer-mcp/` | MCP Server 示例：暴露项目结构、依赖、复杂度分析工具 | 13–15 | 不需要 |
| `multi-agent-review/` | 多代理 Review 示例：Coordinator + Security/Performance/Style Worker | 17–18 | 运行真实审查需要 `ANTHROPIC_API_KEY`；测试不需要 |

**先读哪个？** 跟着正文一章章往下写的时候看 `mini-agent/`——它刻意只保留单代理核心，正文里"基线只含单代理核心""这段要你自己写进项目"说的都是它。想直接看"全书写完是什么样"，或者某章的【教学实现】卡住了想对答案，去 `mini-agent-full/`，它的 README 逐条说明了哪些地方与正文有出入、为什么。

## 5 分钟跑通 MiniAgent

### 环境要求

- Node.js 20+
- npm 10+
- 一个 Anthropic API Key（真实对话需要）

### 安装

```bash
git clone https://github.com/jiji262/mini-code-agent.git
cd mini-code-agent/mini-agent
npm ci
npm run build
```

### 启动

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
npm start -- --cwd . --no-session
```

看到欢迎界面后，输入第一条 prompt：

```text
请读取 package.json，告诉我这个项目有哪些 npm scripts。
```

预期现象：

1. 终端出现 `[Tool] ReadFile(...)`。
2. 工具返回 `package.json` 内容摘要。
3. Agent 用自然语言列出 `build`、`start`、`dev`、`typecheck`、`test` 等脚本。

### 不使用 API Key 的本地验证

```bash
npm run typecheck
npm test
npm run build
```

这三条命令不会调用模型，只验证 TypeScript、工具注册表、文件读写、搜索、命令执行、权限判断等本地逻辑。

## 一键验证四个项目

在仓库根目录运行：

```bash
./scripts/smoke.sh
```

该脚本会依次进入四个项目执行：

```bash
npm ci
npm run typecheck
npm test
npm run build
```

全部通过时输出：

```text
All smoke checks passed.
```

## 常见报错

### `ANTHROPIC_API_KEY environment variable is not set`

真实对话需要先设置 API Key：

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

如果你只想验证本地代码是否能跑，执行 `npm test` 即可，不需要 API Key。

### `npm: command not found`

请先安装 Node.js 20+。安装后确认：

```bash
node -v
npm -v
```

### `Cannot find module ...` 或 `dist/index.js` 不存在

先安装并构建：

```bash
npm ci
npm run build
```

### MCP stdio 模式没有响应

`project-analyzer-mcp` 的 stdio 输出是 JSON-RPC 协议通道。不要在 stdio 入口里用 `console.log` 打调试日志，日志应写到 stderr。

## 保持两份实现同步

`mini-agent/` 与 `mini-agent-full/` 共享 12 个本该逐字相同的文件（五个工具、权限、类型、入口、四个基线测试）。改动其中任何一个后，跑：

```bash
./scripts/check-baseline-drift.sh
```

只改了一边就会失败并打出 diff。

## 源码来源

- `mini-agent/`：本教程原创教学实现。
- `mini-agent-full/`：同上，把正文各章的【教学实现】整合并接线后的版本。
- `project-analyzer-mcp/`：本教程原创 MCP 示例。
- `multi-agent-review/`：本教程原创多代理示例。

教程会参考 Claude Code 的公开架构与使用体验来解释设计取舍，但本仓库不是 Claude Code 源码复刻，也不承诺与 Claude Code 内部实现逐行一致。
