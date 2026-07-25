# Project Analyzer MCP Server

本书**第 14–15 章「写一个 MCP Server」**的配套独立项目。这是一个可独立 `npm install` / `build` / `test` / 运行的 MCP Server，用来分析任意项目的**结构**、**依赖**与**代码复杂度**，并把这三种能力以标准 MCP 协议暴露给 Claude Code 这类客户端。

它演示了 MCP 协议的三类核心能力：

- **Tools（工具）**：`analyze_structure`、`analyze_dependencies`、`analyze_complexity`——可被模型主动调用的只读分析工具。
- **Resources（资源）**：`project://structure`、`project://dependencies`——可被客户端按 URI 读取的快照，支持 `subscribe` 变更订阅（基于 `fs.watch`）。
- **Prompts（提示词模板）**：`project-review`——把项目实际信息填充进一段结构化审查指引，注入对话流。

同时演示了两种传输层：**stdio** 与 **Streamable HTTP**。Server 核心（`src/server.ts`）与传输层完全解耦——`createProjectAnalyzerServer()` 只负责注册请求处理器，由 `src/index.ts` / `src/http.ts` 决定消息如何到达。

> 分析逻辑全部用 Node.js 内置模块实现，唯一运行时依赖是 `@modelcontextprotocol/sdk`。圈复杂度等指标用正则近似计算（非 AST），足够演示构建模式。

## 目录结构

```
project-analyzer-mcp/
├── package.json
├── tsconfig.json
├── .mcp.json             # Claude Code 项目级 MCP 配置（模板）
├── src/
│   ├── index.ts          # stdio 传输入口
│   ├── http.ts           # Streamable HTTP 传输入口
│   ├── server.ts         # Server 核心：注册能力、处理请求
│   ├── tools/
│   │   ├── analyzeStructure.ts
│   │   ├── analyzeDependencies.ts
│   │   └── analyzeComplexity.ts
│   ├── resources/
│   │   └── projectResources.ts
│   └── prompts/
│       └── projectReview.ts
└── test/
    └── tools.test.ts
```

## 安装与构建

```bash
npm install
npm run build
npm test   # 预期 3 个用例全部通过（node:test）
```

构建产物输出到 `dist/`。开发期也可以用 `tsx` 直接跑源码，无需先 build。

## 运行方式

### 1. stdio 模式

stdio 模式由客户端把本进程作为子进程拉起，stdin/stdout 充当 JSON-RPC 通道。**注意：stdout 是协议通道，日志必须走 stderr（`console.error`），任何 `console.log` 都会破坏协议。**

```bash
# 开发期（直接跑源码）
npm run dev

# 构建后
npm run build
npm start

# 冒烟测试：用管道喂一条 initialize 请求
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' | node dist/index.js 2>/dev/null
# 预期：返回包含 capabilities（tools/resources/prompts）的 JSON
```

### 2. Streamable HTTP 模式

HTTP 模式把 Server 暴露在 `http://localhost:3100/mcp`（端口可用环境变量 `PORT` 覆盖），支持多并发会话（每个会话独立的 Server + Transport），并提供 `/health` 健康检查端点。

```bash
# 开发期
npm run dev:http

# 构建后
npm run build
npm run start:http

# 健康检查
curl http://localhost:3100/health
# {"status":"ok","activeSessions":0,"uptime":...}
```

HTTP 协议流程：

1. `POST /mcp` 发送 JSON-RPC 请求（首次请求创建会话，返回 `mcp-session-id`）
2. Server 用普通 JSON 或 SSE 流式响应
3. `GET /mcp`（带 `mcp-session-id` 头）建立 SSE 通道接收通知
4. `DELETE /mcp` 终止会话

## 接入 Claude Code

### stdio 模式

把下面的配置写到**项目根目录的 `.mcp.json`**（仓库已附带模板，把 `/path/to/` 换成你机器上的绝对路径）。注意：Claude Code 的 MCP Server 定义不放在 `.claude/settings.json` 里——项目级配置文件是 `.mcp.json`，用户级配置用 `claude mcp add --scope user` 命令注册（写入 `~/.claude.json`）。同名 Server 以项目级配置优先。

开发期用 `tsx` 直接跑源码：

```json
{
  "mcpServers": {
    "project-analyzer": {
      "command": "npx",
      "args": ["tsx", "/绝对路径/project-analyzer-mcp/src/index.ts"],
      "env": {}
    }
  }
}
```

编译后改用 `node dist/index.js`：

```json
{
  "mcpServers": {
    "project-analyzer": {
      "command": "node",
      "args": ["/绝对路径/project-analyzer-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

也可以不改文件，直接用命令注册（默认注册到当前项目的 local 作用域，加 `--scope user` 则全局可用）：

```bash
claude mcp add project-analyzer -- npx tsx /绝对路径/project-analyzer-mcp/src/index.ts
```

### HTTP 模式

先 `npm run start:http` 起服务，再在项目根目录的 `.mcp.json` 里配置：

```json
{
  "mcpServers": {
    "project-analyzer": {
      "type": "http",
      "url": "http://localhost:3100/mcp"
    }
  }
}
```

对应的命令行注册方式：

```bash
claude mcp add --transport http project-analyzer http://localhost:3100/mcp
```

### 在对话里调用

接入后，工具名会被命名空间化为 `mcp__project-analyzer__analyze_structure` 等。直接在对话里描述需求（例如「分析一下这个项目的依赖健康度」），模型会自动选用对应工具。`project-review` 提示词模板可作为斜杠命令式入口触发完整审查流程。

## 提供的能力清单

| 类型 | 名称 | 说明 |
|---|---|---|
| Tool | `analyze_structure` | 目录树、文件计数与大小、语言分布、最大文件 Top 10 |
| Tool | `analyze_dependencies` | 解析 package.json / requirements.txt 等，报告版本约束与风险 |
| Tool | `analyze_complexity` | 圈复杂度、嵌套深度、函数长度、热点排名与分布直方图 |
| Resource | `project://structure` | 当前工作目录结构的轻量 JSON 快照（深度 3） |
| Resource | `project://dependencies` | 当前工作目录的依赖清单快照 |
| Prompt | `project-review` | 填充项目信息的结构化审查指引（focus: security / performance / maintainability / all） |
