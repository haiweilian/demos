import { Handle, Position } from "@xyflow/react";
import { useCallback } from "react";

export function TextUpdaterNode(props) {
  const onChange = useCallback((evt) => {
    console.log(evt.target.value);
  }, []);

  return (
    <>
      <style>
        {`.text-updater-node {
  height: 50px;
  border: 1px solid #eee;
  padding: 5px;
  border-radius: 5px;
  background: white;
}

.text-updater-node label {
  display: block;
  color: #777;
  font-size: 12px;
}`}
      </style>
      <div className="text-updater-node">
        <div>
          <label htmlFor="text">Text:</label>
          <input id="text" name="text" onChange={onChange} className="nodrag" />
        </div>
        <Handle type="source" position={Position.Right} id="a">
          a
        </Handle>
        <Handle type="source" position={Position.Right} id="b" style={{ top: "90%", backgroundColor: "red" }} />
      </div>
    </>
  );
}
