import { StateGraph, StateSchema, ReducedValue, START, END, MemorySaver } from "@langchain/langgraph";
import { z } from "zod/v4";

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
const checkpointer = new MemorySaver();
const graph = workflow.compile({ checkpointer });

const config = { configurable: { thread_id: "2" } };
const stream = await graph.streamEvents({ foo: "a" }, { version: "v3", ...config });

// 全部事件
for await (const message of stream) {
  console.log(JSON.stringify(message, null, 2));
}

// 特定事件
for await (const message of stream.values) {
  console.log(JSON.stringify(message, null, 2));
}

// 流程启动
// {
//   "type": "event",
//   "seq": 0,
//   "method": "lifecycle",
//   "params": {
//     "namespace": [],
//     "timestamp": 1778825561849,
//     "data": {
//       "event": "running",
//       "graph_name": "root"
//     }
//   }
// }

// 检查点和初始值
// {
//   "type": "event",
//   "seq": 1,
//   "method": "checkpoints",
//   "params": {
//     "namespace": [],
//     "timestamp": 1778825561856,
//     "data": {
//       "id": "1f150251-4d28-68f0-8000-908815f93dc6",
//       "parent_id": "1f150251-4d21-63c0-ffff-2c585713771e",
//       "step": 0,
//       "source": "loop"
//     }
//   }
// }
// {
//   "type": "event",
//   "seq": 2,
//   "method": "values",
//   "params": {
//     "namespace": [],
//     "timestamp": 1778825561856,
//     "data": {
//       "foo": "a",
//       "bar": []
//     }
//   }
// }

// 执行任务 nodeA
// {
//   "type": "event",
//   "seq": 3,
//   "method": "tasks",
//   "params": {
//     "namespace": [],
//     "timestamp": 1778825561856,
//     "data": {
//       "id": "872013c4-4155-5ba2-b670-cac17f620208",
//       "name": "nodeA",
//       "input": {
//         "foo": "a",
//         "bar": []
//       },
//       "triggers": [
//         "branch:to:nodeA"
//       ],
//       "interrupts": []
//     }
//   }
// }
// {
//   "type": "event",
//   "seq": 4,
//   "method": "updates",
//   "params": {
//     "namespace": [],
//     "timestamp": 1778825561857,
//     "node": "nodeA",
//     "data": {
//       "node": "nodeA",
//       "values": {
//         "foo": "a",
//         "bar": [
//           "a"
//         ]
//       }
//     }
//   }
// }
// {
//   "type": "event",
//   "seq": 5,
//   "method": "tasks",
//   "params": {
//     "namespace": [],
//     "timestamp": 1778825561857,
//     "data": {
//       "id": "872013c4-4155-5ba2-b670-cac17f620208",
//       "name": "nodeA",
//       "result": {
//         "foo": "a",
//         "bar": [
//           "a"
//         ]
//       },
//       "interrupts": []
//     }
//   }
// }

// 检查点和 NodeA 的结果
// {
//   "type": "event",
//   "seq": 6,
//   "method": "checkpoints",
//   "params": {
//     "namespace": [],
//     "timestamp": 1778825561858,
//     "data": {
//       "id": "1f150251-4d2d-6710-8001-b30b5fc91f40",
//       "parent_id": "1f150251-4d28-68f0-8000-908815f93dc6",
//       "step": 1,
//       "source": "loop"
//     }
//   }
// }
// {
//   "type": "event",
//   "seq": 7,
//   "method": "values",
//   "params": {
//     "namespace": [],
//     "timestamp": 1778825561858,
//     "data": {
//       "foo": "a",
//       "bar": [
//         "a"
//       ]
//     }
//   }
// }

// 执行任务 nodeB
// {
//   "type": "event",
//   "seq": 8,
//   "method": "tasks",
//   "params": {
//     "namespace": [],
//     "timestamp": 1778825561858,
//     "data": {
//       "id": "73312ede-27e6-5cad-8388-be99ad760c7b",
//       "name": "nodeB",
//       "input": {
//         "foo": "a",
//         "bar": [
//           "a"
//         ]
//       },
//       "triggers": [
//         "branch:to:nodeB"
//       ],
//       "interrupts": []
//     }
//   }
// }
// {
//   "type": "event",
//   "seq": 9,
//   "method": "updates",
//   "params": {
//     "namespace": [],
//     "timestamp": 1778825561858,
//     "node": "nodeB",
//     "data": {
//       "node": "nodeB",
//       "values": {
//         "foo": "b",
//         "bar": [
//           "b"
//         ]
//       }
//     }
//   }
// }
// {
//   "type": "event",
//   "seq": 10,
//   "method": "tasks",
//   "params": {
//     "namespace": [],
//     "timestamp": 1778825561858,
//     "data": {
//       "id": "73312ede-27e6-5cad-8388-be99ad760c7b",
//       "name": "nodeB",
//       "result": {
//         "foo": "b",
//         "bar": [
//           "b"
//         ]
//       },
//       "interrupts": []
//     }
//   }
// }

// 检查点和 NodeB 的结果
// {
//   "type": "event",
//   "seq": 11,
//   "method": "checkpoints",
//   "params": {
//     "namespace": [],
//     "timestamp": 1778825561860,
//     "data": {
//       "id": "1f150251-4d2f-6e20-8002-23b6e2e9cb19",
//       "parent_id": "1f150251-4d2d-6710-8001-b30b5fc91f40",
//       "step": 2,
//       "source": "loop"
//     }
//   }
// }
// {
//   "type": "event",
//   "seq": 12,
//   "method": "values",
//   "params": {
//     "namespace": [],
//     "timestamp": 1778825561860,
//     "data": {
//       "foo": "b",
//       "bar": [
//         "a",
//         "b"
//       ]
//     }
//   }
// }

// 流程完成
// {
//   "type": "event",
//   "seq": 13,
//   "method": "lifecycle",
//   "params": {
//     "namespace": [],
//     "timestamp": 1778825561861,
//     "data": {
//       "event": "completed",
//       "graph_name": "root"
//     }
//   }
// }
