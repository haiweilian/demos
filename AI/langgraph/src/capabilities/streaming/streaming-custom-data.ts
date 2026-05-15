import { StateGraph, StateSchema, GraphNode, START, LangGraphRunnableConfig } from "@langchain/langgraph";
import * as z from "zod";

const State = new StateSchema({
  query: z.string(),
  answer: z.string(),
});

const node: GraphNode<typeof State> = async (state, config) => {
  // Use the writer to emit a custom key-value pair (e.g., progress update)
  // 使用 writer 发送自定义数据，例如进度更新
  config.writer({ custom_key: "Generating custom data inside node" });
  return { answer: "some data" };
};

const graph = new StateGraph(State).addNode("node", node).addEdge(START, "node").compile();

const inputs = { query: "example" };

// Set streamMode: "custom" to receive the custom data in the stream
for await (const chunk of await graph.stream(inputs, { streamMode: "custom" })) {
  console.log(chunk);
}
