import React from "react";

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
      <ButtonA></ButtonA>,<ButtonB></ButtonB>
    </div>
  );
}

// 第三层
class ButtonA extends React.Component {
  // 指定 contextType 读取当前的 theme context。
  // React 会往上找到最近的 theme Provider，然后使用它的值。
  // 在这个例子中，当前的 theme 值为 “dark”。
  static contextType = ThemeContext;
  render() {
    return <button>{this.context}</button>;
  }
}

function ButtonB() {
  return (
    <ThemeContext.Consumer>
      {(theme) => (
        <SizeContext.Consumer>
          {(size) => (
            <button>
              {theme}: {size}
            </button>
          )}
        </SizeContext.Consumer>
      )}
    </ThemeContext.Consumer>
  );
}

export default Context;
