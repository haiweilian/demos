import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, StateSchema, GraphNode, START } from "@langchain/langgraph";
import * as z from "zod";

const MyState = new StateSchema({
  topic: z.string(),
  joke: z.string().default(""),
});

const model = new ChatOpenAI({
  model: process.env.MODEL,
  temperature: 0,
  configuration: {
    baseURL: process.env.BASE_URL,
    apiKey: process.env.API_KEY,
  },
});

const callModel: GraphNode<typeof MyState> = async (state) => {
  // 调用 LLM，生成一个关于指定主题的笑话
  // 注意：即使用 .invoke 而不是 .stream 运行 LLM，也会触发 message 事件
  const modelResponse = await model.invoke([
    {
      role: "user",
      content: `请生成一个关于 ${state.topic} 的笑话`,
    },
  ]);
  return { joke: modelResponse.content };
};

const graph = new StateGraph(MyState).addNode("callModel", callModel).addEdge(START, "callModel").compile();

// “messages” 流模式会返回一个元组迭代器：[messageChunk, metadata]
// 其中 messageChunk 是 LLM 流式返回的 token，metadata 是一个字典
// 包含调用 LLM 的图节点信息以及其他相关信息
for await (const [messageChunk, metadata] of await graph.stream({ topic: "冰淇淋" }, { streamMode: "messages" })) {
  if (messageChunk.content) {
    console.log(messageChunk.content + "|");
  }
}
