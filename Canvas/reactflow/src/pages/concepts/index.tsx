import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  SelectionMode,
  Panel,
} from "@xyflow/react";
// import "@xyflow/react/dist/base.css";
import "@xyflow/react/dist/style.css";
import { useCallback, useState } from "react";

const panOnDrag = [1, 2];

export default function Concepts() {
  // 节点结构
  const initialNodes: Node[] = [
    {
      id: "n1",
      position: { x: 500, y: 200 },
      data: { label: "Node 1" },
      type: "input",
    },
    {
      id: "n2",
      position: { x: 600, y: 400 },
      data: { label: "Node 2" },
    },
  ];

  // 连接结构
  const initialEdges: Edge[] = [
    // {
    //   id: "n1-n2",
    //   source: "n1",
    //   target: "n2",
    //   type: "step",
    //   label: "连接",
    // },
  ];

  // 不处理任何状态，你需要更新外部数据来更新视图
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback((changes) => {
    console.log("节点变化", changes);
    return setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot));
  }, []);
  const onEdgesChange = useCallback((changes) => {
    console.log("连接变化", changes);
    return setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot));
  }, []);

  const onConnect = useCallback((params) => {
    console.log("连接", params);
    return setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot));
  }, []);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        panOnScroll // 开启滚轮平移，比如触摸板滑动就会平移视图
        selectionOnDrag // 开启选择拖动
        panOnDrag={panOnDrag}
        selectionMode={SelectionMode.Partial} // 选择模式，Partial：部分选择，Strict：严格选择
        fitView // 填充视图
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-left">top-left</Panel>
        <Panel position="top-right">top-right</Panel>
      </ReactFlow>
    </div>
  );
}
