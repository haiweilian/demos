import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";

import { ConditionalEdgeRouter, END, GraphNode, MessagesValue, ReducedValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import * as z from "zod";

// 第一步：定义工具和模型
const model = new ChatOpenAI({
  model: process.env.MODEL,
  temperature: 0,
  configuration: {
    baseURL: process.env.BASE_URL,
    apiKey: process.env.API_KEY,
  },
});

// 定义工具
const add = tool(({ a, b }) => a + b, {
  name: "add",
  description: "将两个数字相加",
  schema: z.object({
    a: z.number().describe("第一个数字"),
    b: z.number().describe("第二个数字"),
  }),
});

const multiply = tool(({ a, b }) => a * b, {
  name: "multiply",
  description: "将两个数字相乘",
  schema: z.object({
    a: z.number().describe("第一个数字"),
    b: z.number().describe("第二个数字"),
  }),
});

const divide = tool(({ a, b }) => a / b, {
  name: "divide",
  description: "将两个数字相除",
  schema: z.object({
    a: z.number().describe("第一个数字"),
    b: z.number().describe("第二个数字"),
  }),
});

// 为模型绑定工具，告诉模型有哪些工具可以调用
const toolsByName = {
  [add.name]: add,
  [multiply.name]: multiply,
  [divide.name]: divide,
};
const tools = Object.values(toolsByName);
const modelWithTools = model.bindTools(tools);

// 第二步：定义状态
const MessagesState = new StateSchema({
  messages: MessagesValue,
  llmCalls: new ReducedValue(z.number().default(0), { reducer: (x, y) => x + y }),
});

// 第三步：定义模型节点
// 模型节点负责调用模型，根据用户输入和工具调用生成回复
const llmCall: GraphNode<typeof MessagesState> = async (state) => {
  console.log("调用了模型");
  return {
    messages: [await modelWithTools.invoke([new SystemMessage("你是一个乐于助人的助手，负责根据用户输入完成算术计算。"), ...state.messages])],
    llmCalls: 1,
  };
};

// 第四步：定义工具节点
// 工具节点负责调用工具，根据模型的工具调用请求执行实际的计算
// const toolNode: GraphNode<typeof MessagesState> = async (state) => {
//   console.log("调用了工具");
//   const lastMessage = state.messages.at(-1);

//   if (lastMessage == null || !AIMessage.isInstance(lastMessage)) {
//     return { messages: [] };
//   }

//   const result: ToolMessage[] = [];
//   for (const toolCall of lastMessage.tool_calls ?? []) {
//     const tool = toolsByName[toolCall.name];
//     const observation = await tool.invoke(toolCall);
//     result.push(observation);
//   }

//   return { messages: result };
// };
const toolNode = new ToolNode(tools);

// 第五步：定义是否继续执行的逻辑
// 决定是否继续执行模型节点或工具节点
const shouldContinue: ConditionalEdgeRouter<typeof MessagesState, "toolNode"> = (state) => {
  const lastMessage = state.messages.at(-1);

  // 只有在最后一条消息是 AIMessage 时，才读取 tool_calls
  if (!lastMessage || !AIMessage.isInstance(lastMessage)) {
    return END;
  }

  // 如果模型发起了工具调用，则进入工具节点
  if (lastMessage.tool_calls?.length) {
    return "toolNode";
  }

  // 否则结束流程，直接回复用户
  return END;
};

// 第六步：构建并编译 Agent
const agent = new StateGraph(MessagesState)
  .addNode("llmCall", llmCall) // 添加节点
  .addNode("toolNode", toolNode) // 添加节点

  .addEdge(START, "llmCall") // 添加边，从 START 节点到 llmCall 节点
  .addConditionalEdges("llmCall", shouldContinue, ["toolNode", END]) // 添加条件边，根据 shouldContinue 决定是否继续执行工具节点或结束流程
  .addEdge("toolNode", "llmCall")

  .compile();

// 调用示例
const result = await agent.invoke({
  messages: [new HumanMessage("请帮我计算 3 加 4。")],
});

console.log(result);

for (const message of result.messages) {
  console.log(`[${message.type}]: ${message.text}`);
}

// 完整流转过程（一看就懂）

// 我们走一遍完整流程，你就明白结果怎么到模型手里：
// 1. 用户提问 → state.messages = [用户消息]
// 2. 执行 llmCall
//   模型思考 → 生成带 tool_calls 的 AI 消息
//   → state.messages = [用户消息，AI 工具调用消息]
// 3. 执行 toolNode
//   调用工具 → 生成工具结果消息（ToolMessage）
//   → 追加到状态：state.messages = [用户消息，AI 调用，工具结果]
// 4. 通过边跳回 llmCall
//   ✅ 模型自动读取最新的 state.messages
//   → 模型直接看到：用户问题 + 自己的调用 + 工具结果！
// 5. 模型总结结果 → 结束流程
