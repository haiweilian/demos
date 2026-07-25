# MiniAgent（完整整合版）

这是"跟完全书之后，你的项目应该长什么样"。

`../mini-agent/` 是**主线基线**，对应第 2–6、11 章：五个工具 + 权限 + 上下文/压缩 + CLI，刻意保持精简，正文里所有"基线只含单代理核心"的说法说的就是它。

本目录在基线之上，把第 5、7–19 章标为**【教学实现】**的模块全部落地并接线，配了单元测试。正文里那些"这段要你自己写进项目"的代码，在这里都能找到可运行的落点。

两个目录是独立工程，各自 `npm ci` 即可，互不依赖。

## 5 分钟跑通

```bash
cd mini-agent-full
npm ci
npm run typecheck && npm test && npm run build
```

预期末尾是 `# pass 227`、`# fail 0`，构建无输出。这一步不调模型，不需要 API Key。

启动真实对话：

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
npm start -- --cwd . --no-session
```

不想花 token 也能验证接线，用一个假 Key 跑那些不发请求的命令：

```bash
printf '/help\n/skills\n/status\n/exit\n' | ANTHROPIC_API_KEY=test-key node dist/index.js --cwd . --no-session
```

`/skills` 应当列出 `verify`、`commit`（内置）与 `review`（项目级，来自本目录的 `.miniagent/skills/`）；`/status` 应当同时出现 `─── Cost ───` 与 `Session memory:` 两段。

## 每章落在哪个文件

| 章 | 能力 | 文件 |
|---|---|---|
| 5 | 工具分区调度（只读并发、有副作用串行） | `src/agentLoop.ts` 的 `partition()` |
| 7 | 成本分桶追踪、软预算告警、MicroCompact | `src/costTracker.ts`、`src/context.ts` |
| 8 | SessionMemory 工作笔记 | `src/sessionMemory.ts` |
| 9 | 跨会话项目记忆、`/remember` `/memories` `/forget` | `src/projectMemory.ts`、`src/cli.ts` |
| 10 | MagicDocs 文档跟随更新与风险分级 | `src/magicDocs.ts` |
| 12 | Hooks 总线，权限退居为一个钩子 | `src/hooks/` |
| 13 | MCP 客户端接入、远程工具命名空间 | `src/mcp/` |
| 16 | Skills 延迟加载、SkillTool、`/命令`合流 | `src/skills/`、`src/tools/skillTool.ts` |
| 19 | Headless bootstrap、Feature Flag、Analytics、离线 Eval | `src/bootstrap.ts`、`src/featureFlags.ts`、`src/analytics.ts`、`src/evals/` |

第 14、15 章（MCP Server 侧）在 `../project-analyzer-mcp/`，第 17、18 章在 `../multi-agent-review/`。

## 验证正文里的过关命令

```bash
# 第 19 章：离线 Eval 门禁（critical 全绿，退出码 0）
npm run eval -- --suite critical

# 第 19 章：Feature Flag 灰度——默认没有 WebFetch，flag 打开才出现
node --import tsx -e 'import {FeatureFlags} from "./src/featureFlags.js";import {createDefaultRegistry} from "./src/registry.js";console.log(createDefaultRegistry(await FeatureFlags.load()).getAll().map(t=>t.name).join(", "))'
MINI_FLAG_WEB_FETCH_ENABLED=true node --import tsx -e 'import {FeatureFlags} from "./src/featureFlags.js";import {createDefaultRegistry} from "./src/registry.js";console.log(createDefaultRegistry(await FeatureFlags.load()).getAll().map(t=>t.name).join(", "))'
```

## 与正文不一致的地方（读之前先看这一节）

正文按章增量讲解，几章合到一个工程里就会有几处需要合并裁决。下面每一条都是有意为之，不是笔误。

**1. `runAgentLoop` 收了一个 `deps` 对象，而不是四个新位置参数。**
第 7、8、12、19 章各自要求"给 `runAgentLoop` 的签名加一个参数"，四章加完就是十个位置参数。这里合成
`runAgentLoop(client, registry, context, config, deps, onText?, abortSignal?)`，函数体第一行把 `deps` 解构成
`hookBus / sessionMemory / costTracker / analytics`——所以正文那些 `costTracker.add(...)`、`hookBus.emit(...)` 的代码行在函数体里仍然一字不差。

**1b. Skill 相关代码是"做完动手实践之后"的样子。**
第 16 章 16.5.1 把 `SkillTool.execute` 的求值与拼标签摊开写，动手实践任务二才让你抽成 `activateSkill(skill, args)`。本仓库直接是抽完的版本，所以 `skillTool.ts` 里那两行变成了一句 `await activateSkill(...)`。逻辑一致，只是位置不同。

**2. 权限钩子等人按键时不设超时上限。**
`makePermissionHook` 里的 `timeoutMs: Number.POSITIVE_INFINITY` 有个副作用要说清楚：在非交互场景（`echo x | mini-agent` 这种 stdin 已 EOF 的跑法）遇到 `ask` 分支会一直挂着。这不是回归——第 11 章基线本来就是无上限等待，注释原文写的就是"可能阻塞，等用户按键"。宁可挂住，也不能替用户回答。

**3. 第 9、12、16 章的组装收进了 `bootstrap()`。**
三章都把自己的初始化写在 `cli.ts` 里（那时还没有 `bootstrap`）。第 19 章既然把开机仪式抽了出来，这里就一并收进去。`AgentRuntime` 保留了正文列出的全部字段（`client / registry / context / flags / analytics / cost`），只增补了 `sessionMemory / memoryStore / hookBus / skills`。system prompt 的三段拼接（基础提示 + 项目记忆 + Skill 菜单）必须在 `new ContextManager()` 之前完成，因为它是构造时固定的。

**4. 三个文件是正文提到但没给实现的，本仓库补齐了。**

- `src/tools/webFetch.ts`：第 19 章只写了 `import { webFetchTool } from "./tools/webFetch.js"; // 假设这是本次要灰度的新工具`。补一个最薄的实现，好让灰度开关有东西可门控。
- `src/evals/run.ts`：第 19 章给了 `EvalCase` / `evaluateTrace`，但过关标准要求 `npm run eval -- --suite critical` 可执行且失败时非零退出。补一个离线 runner，fixture 全部内联、不调模型。
- `.miniagent/skills/review/SKILL.md`：第 16 章反复用 `/review src/cli.ts` 演示，仓库里得真有这个 skill 才跑得通。

**5. `MINI_AGENT_HOME` 环境变量。**
`src/featureFlags.ts` 的磁盘缓存路径支持用它覆盖，默认行为与正文的 `os.homedir()` 完全一致。加它纯粹是为了让测试不往真实 home 目录写文件。

**5b. 一轮独立代码审查之后补上的加固。**
整合完成后跑过一轮独立审查（5 个维度 + 逐条对抗式复核 + 变异测试）。审出的问题里，**权限钩子 fail-open**（第 12 章）与 **SkillTool 拆散 `tool_use`/`tool_result`**（第 16 章）两条源自正文本身，已经在书稿里改掉了，所以不再算偏离。下面这些是仓库单方面补的加固，正文里没有对应描述：

- 工具 `execute` 抛异常的路径上也会发 `PostToolUse` 与埋点。原先只有成功路径发，审计流水会缺失败记录、失败率统计永远偏低。
- `ContextManager.loadSession(cwd?)` 会比对会话文件里记的 `cwd`。默认 session 文件是全局的，不比对的话在 A 项目聊完再去 B 项目启动，会把 A 的整段对话恢复出来，而 system prompt 拼的是 B 的记忆和 Skill 菜单。
- `microCompact(0)` 原先因为 `slice(0, -0)` 退化成 `slice(0, 0)`，一条都清不掉。
- `ProjectMemoryStore` 的写入串行化：`append` 与 `forget` 原先会并发互相覆盖，实测能静默丢记忆。跨进程仍需文件锁，超出教学范围，代码注释里点明了这层边界。
- `applyDocPatch` 补上了工作目录约束。正文第 10 章声称它"继承第 4 章的三条边界"，其中第一条是路径约束，但 `EditFileTool` 里其实没有这个校验——现在是代码兑现正文的说法。
- `FeatureFlags` 对 `flags.json` 做类型校验（写成 `null` 或 `42` 原先会让每次 flag 查询抛 `TypeError`，直接打断开机）；`CostTracker` 对 `MINI_BUDGET_USD` 做有效性校验（原先 `5.0USD` 会让预算变成 `NaN`，第一次调用就误报超支）。
- MCP 客户端：连接失败路径会关闭 client（原先泄漏子进程到会话结束）、stderr 接出来消费（原先 pipe 不读，话痨 Server 会被背压卡死在握手阶段）、非 text 内容块给出可读占位（原先静默变空字符串且 `isError` 仍为 false）。
- `webFetch` 不再自动跟随重定向，每一跳都重新校验，并拒绝环回/私网/链路本地地址。否则一次 302 就能把"用户批准过的域名"带到云元数据端点。已知边界写在文件头：挡不住 DNS rebinding。
- `src/evals/run.ts` 把门禁判定导出成 `exitCodeFor()`，否则"通过率 < 95%"那道闸门在进程边界上测不到，改坏了也没人发现。

测试也补了一轮：`agentLoop`（分区调度、钩子拦截、异常回填、max_turns、abort）、`cli` 命令分发、`analytics`、Feature Flag 的"开"方向、MicroCompact、记忆写入门控此前全无覆盖。用变异测试逐条验证过——把对应代码改坏，新加的测试确实会红。

**6. 正文明确留给读者的，这里没有实现。**
`UserPromptSubmit` 与 `Stop` 两个钩子事件的接线（第 12 章思考题）、带作用域的工具收束（第 16 章任务三，正文给的是【伪代码】）、Skill 菜单预算截断（第 16 章明说本章不实现）、第 20 章的 `audit.ts` / `config.test.ts` / `capability.test.ts`（标签是【教学简化】，不是可直接入库的实现）。

## 防漂移

`mini-agent/` 与 `mini-agent-full/` 共享 12 个本该逐字相同的文件（五个工具、权限、类型、入口、四个基线测试）。在仓库根目录跑：

```bash
./scripts/check-baseline-drift.sh
```

只改了一边就会失败。`./scripts/smoke.sh` 会把本目录一起纳入构建与测试。
