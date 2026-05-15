import { StateGraph, StateSchema, GraphNode } from "@langchain/langgraph";
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

// 图状态
const State = new StateSchema({
  topic: z.string().optional(),
  joke: z.string(),
  story: z.string(),
  poem: z.string(),
  combinedOutput: z.string(),
});

// 节点
// 起始节点：随机设置主题为“猫”或“狗”
const pickTopic: GraphNode<typeof State> = async () => {
  const topics = ["猫", "狗"];
  const topic = topics[Math.floor(Math.random() * topics.length)];
  return { topic };
};

// 第一次调用 LLM，生成笑话
const callLlm1: GraphNode<typeof State> = async (state) => {
  console.log(`写一个关于${state.topic}的笑话`);
  const msg = await llm.invoke(`写一个关于${state.topic}的笑话`);
  return { joke: msg.content };
};

// 第二次调用 LLM，生成故事
const callLlm2: GraphNode<typeof State> = async (state) => {
  console.log(`写一个关于${state.topic}的故事`);
  const msg = await llm.invoke(`写一个关于${state.topic}的故事`);
  return { story: msg.content };
};

// 第三次调用 LLM，生成诗歌
const callLlm3: GraphNode<typeof State> = async (state) => {
  console.log(`写一首关于${state.topic}的诗`);
  const msg = await llm.invoke(`写一首关于${state.topic}的诗`);
  return { poem: msg.content };
};

// 将笑话、故事和诗歌合并为一个输出
const aggregator: GraphNode<typeof State> = async (state) => {
  const combined =
    `下面是一个关于${state.topic}的故事、笑话和诗歌！\n\n` + `故事：\n${state.story}\n\n` + `笑话：\n${state.joke}\n\n` + `诗歌：\n${state.poem}`;
  return { combinedOutput: combined };
};

// 构建工作流
const parallelWorkflow = new StateGraph(State)
  .addNode("pickTopic", pickTopic)
  .addNode("callLlm1", callLlm1)
  .addNode("callLlm2", callLlm2)
  .addNode("callLlm3", callLlm3)
  .addNode("aggregator", aggregator)
  .addEdge("__start__", "pickTopic")
  .addEdge("pickTopic", "callLlm1")
  .addEdge("pickTopic", "callLlm2")
  .addEdge("pickTopic", "callLlm3")
  .addEdge("callLlm1", "aggregator")
  .addEdge("callLlm2", "aggregator")
  .addEdge("callLlm3", "aggregator")
  .addEdge("aggregator", "__end__")
  .compile();

// 调用
const result = await parallelWorkflow.invoke({});
console.log(result.combinedOutput);
