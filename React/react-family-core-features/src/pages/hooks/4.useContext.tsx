import React, { useContext } from "react";

// Context 可以让我们无须明确地传遍每一个组件，就能将值深入传递进组件树。
// 为当前的 theme 创建一个 context（“light”为默认值）。
const ThemeContext = React.createContext("light");
ThemeContext.displayName = "ThemeContext";

const SizeContext = React.createContext("light");
SizeContext.displayName = "SizeContext";

// 第一层
function Context() {
  return (
    <ThemeContext.Provider value="dark">
      <SizeContext.Provider value="mini">
        <Toolbar />
      </SizeContext.Provider>
    </ThemeContext.Provider>
  );
}

// 第二层
function Toolbar() {
  return (
    <div>
      <ButtonA />
      <ButtonB />
    </div>
  );
}

// 第三层
function ButtonA() {
  const themeContext = useContext(ThemeContext);
  return <button>{themeContext}</button>;
}

function ButtonB() {
  const themeContext = useContext(ThemeContext);
  const sizeContext = useContext(SizeContext);
  return (
    <button>
      {themeContext}: {sizeContext}
    </button>
  );
}

export default Context;
