import { useState, useEffect } from "react";

function Example() {
  // 声明一个叫 "count" 的 state 变量
  const [count, setCount] = useState(0);
  const [count2, setCount2] = useState(0);

  // 每次渲染之后执行
  useEffect(() => {
    console.log("1", count);
    document.title = `title: ${count}`;
  });

  // 只有当 count 变化的时候才会变化
  useEffect(() => {
    console.log("2", count);
    document.title = `title: ${count}`;
  }, [count]);

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     console.log(count);
  //   }, 1000);
  //   // 每次从新时调用清楚函数
  //   return () => clearInterval(timer);
  // });

  return (
    <div>
      <p>count: {count}</p>
      <button onClick={() => setCount(count + 1)}>click button</button>
      <button onClick={() => setCount2(count2 + 1)}>click button2</button>
    </div>
  );
}

export default Example;
