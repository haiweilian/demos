import React, { Suspense } from "react";
import Context from "./2.context";
import Portals from "./3.portals";
import Profiler from "./4.profiler";
import Refs from "./5.refs-and-the-dom";
import RenderProps from "./6.render-props";

const CodeSplitting = React.lazy(() => {
  return new Promise((resolve) => {
    import("./1.code-splitting").then((res: any) => {
      setTimeout(() => {
        resolve(res);
      }, 2000);
    });
  });
});

function High() {
  return (
    <>
      <h1>1、</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <CodeSplitting />
      </Suspense>
      <h1>2、</h1>
      <Context />
      <h1>3、</h1>
      <Portals />
      <h1>4、</h1>
      <Profiler />
      <h1>5、</h1>
      <Refs />
      <h1>6、</h1>
      <RenderProps />
    </>
  );
}

export default High;
