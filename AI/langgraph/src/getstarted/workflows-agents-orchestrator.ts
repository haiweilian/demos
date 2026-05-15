import { StateGraph, StateSchema, ReducedValue, GraphNode, Send } from "@langchain/langgraph";
import * as z from "zod";
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
  model: process.env.MODEL,
  temperature: 0,
  configuration: {
    baseURL: process.env.BASE_URL,
    apiKey: process.env.API_KEY,
  },
});

type SectionSchema = {
  name: string;
  description: string;
};
type SectionsSchema = {
  sections: SectionSchema[];
};

// 用于报告规划的结构化输出 Schema
const sectionsSchema = z.object({
  sections: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
    }),
  ),
});

// 某些 OpenAI 兼容模型不支持 json_schema，显式使用 function calling 更稳妥
const planner = llm.withStructuredOutput(sectionsSchema, {
  method: "functionCalling",
});

// 图状态
const State = new StateSchema({
  topic: z.string(),
  sections: z.array(z.custom<SectionsSchema>()),
  completedSections: new ReducedValue(
    z.array(z.string()).default(() => []),
    { reducer: (a, b) => a.concat(b) },
  ),
  finalReport: z.string(),
});

// Worker 状态
const WorkerState = new StateSchema({
  section: z.custom<SectionsSchema>(),
  completedSections: new ReducedValue(
    z.array(z.string()).default(() => []),
    { reducer: (a, b) => a.concat(b) },
  ),
});

// 节点
const orchestrator: GraphNode<typeof State> = async (state) => {
  // 生成报告规划
  const reportSections = await planner.invoke([
    { role: "system", content: "为这份报告生成一个写作规划。" },
    { role: "user", content: `报告主题如下：${state.topic}` },
  ]);

  return { sections: reportSections.sections };
};

const llmCall: GraphNode<typeof WorkerState> = async (state) => {
  // 生成章节内容
  const section = await llm.invoke([
    {
      role: "system",
      content: "请根据提供的章节名称和描述撰写报告章节。每个章节前不要添加开场白。使用 Markdown 格式。",
    },
    {
      role: "user",
      content: `章节名称：${state.section.name}；章节描述：${state.section.description}`,
    },
  ]);

  // 将生成好的章节写入 completedSections
  return { completedSections: [section.content] };
};

const synthesizer: GraphNode<typeof State> = async (state) => {
  // 已完成章节列表
  const completedSections = state.completedSections;

  // 将已完成章节格式化为字符串，用于最终报告
  const completedReportSections = completedSections.join("\n\n---\n\n");

  return { finalReport: completedReportSections };
};

// 条件边函数：创建 llmCall worker，让每个 worker 各自撰写一个报告章节
const assignWorkers: ConditionalEdgeRouter<typeof State, "llmCall"> = (state) => {
  // 通过 Send() API 并行启动各个章节的写作任务
  // 使用 Send 可以不必像 并行那样写死每个边，动态创建子任务
  return state.sections.map((section) => new Send("llmCall", { section }));
};

// 构建工作流
const orchestratorWorker = new StateGraph(State)
  .addNode("orchestrator", orchestrator)
  .addNode("llmCall", llmCall)
  .addNode("synthesizer", synthesizer)
  .addEdge("__start__", "orchestrator")
  .addConditionalEdges("orchestrator", assignWorkers, ["llmCall"])
  .addEdge("llmCall", "synthesizer")
  .addEdge("synthesizer", "__end__")
  .compile();

// 调用
const state = await orchestratorWorker.invoke({
  topic: "生成一份关于 LLM 缩放定律的报告",
});
console.log(state.finalReport);
