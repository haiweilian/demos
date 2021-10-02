import React, { useRef } from "react";

function Refs() {
  return (
    <>
      <CustomTextInput />
      <CustomTextInputFn />
      <CustoRefsCallback />
      <AutoFocusTextInput />
    </>
  );
}

// class 组件使用 createRef
class CustomTextInput extends React.Component {
  private textInput: React.RefObject<HTMLInputElement>;
  constructor(props: any) {
    super(props);
    // 创建一个 ref 来存储 textInput 的 DOM 元素
    this.textInput = React.createRef();
    this.focusTextInput = this.focusTextInput.bind(this);
  }

  focusTextInput() {
    // 直接使用原生 API 使 text 输入框获得焦点
    // 注意：我们通过 "current" 来访问 DOM 节点
    console.log(this.textInput.current);
    this.textInput.current?.focus();
  }

  render() {
    // 告诉 React 我们想把 <input> ref 关联到
    // 构造器里创建的 `textInput` 上
    return (
      <div>
        <input type="text" ref={this.textInput} />
        <input type="button" value="Focus the text input" onClick={this.focusTextInput} />
      </div>
    );
  }
}

// 函数式组件使用 useRef
function CustomTextInputFn() {
  const textInput = useRef<HTMLInputElement>(null);

  function focusTextInput() {
    textInput.current?.focus();
  }

  return (
    <div>
      <input type="text" ref={textInput} />
      <input type="button" value="Focus the text input" onClick={focusTextInput} />
    </div>
  );
}

// ref callback
function CustoRefsCallback() {
  const refs = [];
  // 每个 ref 执行一次回调，用于比如搜集列表的 ref
  function setTextInputRef(el: HTMLLIElement) {
    refs.push(el);
    console.log("callback", el);
  }
  return (
    <ul>
      {[1, 2].map((item) => (
        <li key={item} ref={setTextInputRef}>
          {item}
        </li>
      ))}
    </ul>
  );
}

class AutoFocusTextInput extends React.Component {
  private textInput: React.RefObject<any>;
  constructor(props: any) {
    super(props);
    this.textInput = React.createRef();
  }
  componentDidMount() {
    this.textInput.current.focusTextInput();
  }
  render() {
    // 当 CustomTextInput 为 class 有效
    return <CustomTextInput ref={this.textInput} />;
  }
}

export default Refs;
