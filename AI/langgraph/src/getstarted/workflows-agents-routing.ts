import { StateGraph, StateSchema, GraphNode, ConditionalEdgeRouter } from "@langchain/langgraph";
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

// 用于路由逻辑的结构化输出 Schema
const routeSchema = z.object({
  step: z.enum(["poem", "story", "joke"]).describe("路由流程中的下一步"),
});

// 某些 OpenAI 兼容模型不支持 json_schema，显式使用 function calling 更稳妥
const router = llm.withStructuredOutput(routeSchema, {
  method: "functionCalling",
});

// 图状态
const State = new StateSchema({
  input: z.string(),
  decision: z.string(),
  output: z.string(),
});

// 节点
// 写故事
const llmCall1: GraphNode<typeof State> = async (state) => {
  const result = await llm.invoke([
    {
      role: "system",
      content: "你是一位讲故事专家。",
    },
    {
      role: "user",
      content: state.input,
    },
  ]);
  return { output: result.content };
};

// 写笑话
const llmCall2: GraphNode<typeof State> = async (state) => {
  const result = await llm.invoke([
    {
      role: "system",
      content: "你是一位笑话创作专家。",
    },
    {
      role: "user",
      content: state.input,
    },
  ]);
  return { output: result.content };
};

// 写诗歌
const llmCall3: GraphNode<typeof State> = async (state) => {
  const result = await llm.invoke([
    {
      role: "system",
      content: "你是一位诗人。",
    },
    {
      role: "user",
      content: state.input,
    },
  ]);
  return { output: result.content };
};

const llmCallRouter: GraphNode<typeof State> = async (state) => {
  // 将输入路由到合适的节点
  const decision = await router.invoke([
    {
      role: "system",
      content: "根据用户的请求，将输入路由到 story、joke 或 poem。",
    },
    {
      role: "user",
      content: state.input,
    },
  ]);

  return { decision: decision.step };
};

// 条件边函数：路由到对应的节点
const routeDecision: ConditionalEdgeRouter<typeof State, "llmCall1" | "llmCall2" | "llmCall3"> = (state) => {
  // 返回下一步要访问的节点名称
  if (state.decision === "story") {
    return "llmCall1";
  } else if (state.decision === "joke") {
    return "llmCall2";
  } else {
    return "llmCall3";
  }
};

// 构建工作流
const routerWorkflow = new StateGraph(State)
  .addNode("llmCall1", llmCall1)
  .addNode("llmCall2", llmCall2)
  .addNode("llmCall3", llmCall3)
  .addNode("llmCallRouter", llmCallRouter)
  .addEdge("__start__", "llmCallRouter")
  .addConditionalEdges("llmCallRouter", routeDecision, ["llmCall1", "llmCall2", "llmCall3"])
  .addEdge("llmCall1", "__end__")
  .addEdge("llmCall2", "__end__")
  .addEdge("llmCall3", "__end__")
  .compile();

// 调用
const state = await routerWorkflow.invoke({
  input: "给我写一个关于猫的笑话",
});
console.log(state.output);
