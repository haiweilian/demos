import { nodes, edges } from "./data-base";
import { z } from "zod";
import { StateGraph, StateSchema, GraphNode, ReducedValue } from "@langchain/langgraph";

// TODO:
// 1. 能正确获取到依赖节点的输出值

// 已完成：
// 1. 基本数据处理，支持多入口/多出口节点同时执行。

// state 不允许动态添加变量，可以顶一个对象来存储所有
const state = new StateSchema({
  values: new ReducedValue(z.record(z.string(), z.unknown()).default({}), {
    inputSchema: z.record(z.string(), z.unknown()),
    reducer: (current, patch) => ({
      ...current,
      ...patch,
    }),
  }),
});

interface MyContext {
  userId: string;
  projectId: string;
  flowId: string;
}

nodes.forEach((node) => {
  (node as any).dependencies = [];
});

edges.forEach((edge) => {
  const targetNode = nodes.find((node) => node.id === edge.target);
  if (!targetNode) {
    return;
  }

  (targetNode as any).dependencies.push(edge.source);
});

const promptInput: GraphNode<typeof state, MyContext> = (state, config) => {
  console.log("promptInput", state, config.context, config.metadata);
  const node = (config.metadata?.node || {}) as any;
  return { values: { [node.id]: node.params?.prompt } };
};

const imageInput: GraphNode<typeof state, MyContext> = (state, config) => {
  console.log("imageInput", state, config.context, config.metadata);
  const node = (config.metadata?.node || {}) as any;
  return { values: { [node.id]: node.params?.image } };
};

const imageHandle: GraphNode<typeof state, MyContext> = (state, config) => {
  const node = (config.metadata?.node || {}) as any;

  console.log("imageHandle", {
    state,
    context: config.context,
    metadata: config.metadata,
    dependencies: node.dependencies,
  });

  return {
    values: {
      [node.id]: {
        path: "http://example.com/ai-image.jpg",
      },
    },
  };
};

const nodeTypes: Record<string, GraphNode<typeof state, MyContext>> = {
  promptInput,
  imageInput,
  imageHandle,
};

const graph = new StateGraph(state, {});

// 添加节点
nodes.forEach((node) => {
  graph.addNode(node.id, nodeTypes[node.type] as any, {
    // 节点元数据附加
    metadata: {
      node,
    },
  });
});

// 添加边
edges.forEach((edge) => {
  graph.addEdge(edge.source as any, edge.target as any);
});

// 添加入口和出口节点
const incomingCounts = new Map<string, number>();
const outgoingCounts = new Map<string, number>();

nodes.forEach((node) => {
  incomingCounts.set(node.id, 0);
  outgoingCounts.set(node.id, 0);
});

edges.forEach((edge) => {
  incomingCounts.set(edge.target, (incomingCounts.get(edge.target) ?? 0) + 1);
  outgoingCounts.set(edge.source, (outgoingCounts.get(edge.source) ?? 0) + 1);
});

nodes
  .filter((node) => (incomingCounts.get(node.id) ?? 0) === 0)
  .forEach((node) => {
    graph.addEdge("__start__", node.id as any);
  });

nodes
  .filter((node) => (outgoingCounts.get(node.id) ?? 0) === 0)
  .forEach((node) => {
    graph.addEdge(node.id as any, "__end__");
  });

// 编译图
const compiledGraph = graph.compile();
const result = await compiledGraph.invoke(
  {},
  {
    // 上传文数据附加
    context: {
      userId: "123",
      projectId: "456",
      flowId: "789",
    },
  },
);
console.log("最终结果", result);
