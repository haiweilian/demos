import React from "react";

function A() {
  return <div>A Profiler</div>;
}

function B() {
  return <div>B Profiler</div>;
}

function Profiler() {
  return (
    <React.Profiler id="profiler" onRender={callback}>
      <A />
      <B />
    </React.Profiler>
  );
}

function callback(...arg: any) {
  console.log(arg);
}

export default Profiler;
