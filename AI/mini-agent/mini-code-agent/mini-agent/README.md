# MiniAgent

`MiniAgent` 是《手把手教你做一个 Mini Code Agent：从工具调用、上下文到 MCP 与多代理》的主线项目。

它是本教程原创教学实现，不是 Claude Code 源码复刻。它保留 Code Agent 最小但完整的骨架：Agent Loop、工具注册表、文件读写、命令执行、搜索、上下文、权限和 CLI。

权威源码仓库：[`jiji262/mini-code-agent`](https://github.com/jiji262/mini-code-agent/tree/main/mini-agent)

---

## 目录结构

```text
mini-agent/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── cli.ts
│   ├── agentLoop.ts
│   ├── context.ts
│   ├── permissions.ts
│   ├── registry.ts
│   ├── types.ts
│   └── tools/
│       ├── readFile.ts
│       ├── writeFile.ts
│       ├── editFile.ts
│       ├── runCommand.ts
│       └── search.ts
└── test/
    ├── context.test.ts
    ├── permissions.test.ts
    ├── registry.test.ts
    └── tools.test.ts
```

---

## 5 分钟跑通

```bash
npm ci
npm run build
export ANTHROPIC_API_KEY="sk-ant-..."
npm start -- --cwd . --no-session
```

第一条 prompt：

```text
请读取 package.json，告诉我这个项目有哪些 npm scripts。
```

成功现象：

```text
[Tool] ReadFile({"file_path":"package.json"...})
[Tool] OK: ...
```

随后 Agent 总结 `build`、`start`、`dev`、`typecheck`、`test` 等 scripts。

---

## 不用 API Key 的验证

```bash
npm run typecheck
npm test
npm run build
```

当前测试覆盖：

- 上下文 token 估算
- 权限三值决策
- 工具注册表
- `ReadFile` / `WriteFile` / `Edit` / `RunCommand` / `Search` 的本地行为

---

## 对应章节

| 章节 | 能力 | 主要文件 |
|---|---|---|
| 第 2 章 | Agent Loop | `src/agentLoop.ts` |
| 第 3 章 | 读文件 | `src/tools/readFile.ts`、`src/registry.ts` |
| 第 4 章 | 写文件与精确编辑 | `src/tools/writeFile.ts`、`src/tools/editFile.ts` |
| 第 5 章 | 执行命令与搜索 | `src/tools/runCommand.ts`、`src/tools/search.ts` |
| 第 6–7 章 | 上下文与压缩 | `src/context.ts` |
| 第 11 章 | 权限确认 | `src/permissions.ts`、`src/agentLoop.ts` |
| 第 12 章 | Hooks 教学扩展 | 正文给出可并入方案 |

MCP Server 示例在 `project-analyzer-mcp/`，多代理 Review 示例在 `multi-agent-review/`。

---

## 常见报错

### `ANTHROPIC_API_KEY environment variable is not set`

真实对话需要设置：

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

只跑 `npm test` 不需要 API Key。

### `Cannot find module` 或 `dist/index.js` 不存在

```bash
npm ci
npm run build
```

### 权限确认卡住

默认模式下写文件和执行命令可能会 ask。教学阶段可以先观察确认流程，不建议直接关闭权限检查。
