import { StateGraph, StateSchema, ReducedValue, START, END, MemorySaver } from "@langchain/langgraph";
import { z } from "zod/v4";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import Database from "better-sqlite3";

const State = new StateSchema({
  foo: z.string(),
  bar: new ReducedValue(
    z.array(z.string()).default(() => []),
    {
      inputSchema: z.array(z.string()),
      reducer: (x, y) => x.concat(y),
    },
  ),
});

const workflow = new StateGraph(State)
  .addNode("nodeA", (state) => {
    return { foo: "a", bar: ["a"] };
  })
  .addNode("nodeB", (state) => {
    return { foo: "b", bar: ["b"] };
  })
  .addEdge(START, "nodeA")
  .addEdge("nodeA", "nodeB")
  .addEdge("nodeB", END);

// 自定义检查点保存器
// const checkpointer = new MemorySaver();
const db = new Database("./langgraph.db");
const checkpointer = new SqliteSaver(db);
const graph = workflow.compile({ checkpointer });

const config = { configurable: { thread_id: "1" } };
await graph.invoke({ foo: "", bar: [] }, config);

// 获取最新检查点
const state = await graph.getState(config);
console.log("获取最新检查点:", state);

// 获取全部检查点
const allStates = [];
for await (const state of graph.getStateHistory(config)) {
  allStates.push(state);
}
console.log("获取全部检查点:", allStates);
