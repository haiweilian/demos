import React, { ReactNode } from "react";

interface Props {
  render: (state: any) => ReactNode;
}

// 自定义渲染内容的技术
class Mouse extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.state = { x: 0, y: 0 };
  }

  handleMouseMove(event: any) {
    this.setState({
      x: event.clientX,
      y: event.clientY,
    });
  }

  render() {
    return (
      <div style={{ width: "100px", height: "100px", background: "red" }} onMouseMove={this.handleMouseMove}>
        {/*
          使用 `render`prop 动态决定要渲染的内容，
          而不是给出一个 <Mouse> 渲染结果的静态表示
        */}
        {this.props.render(this.state)}
      </div>
    );
  }
}

function renderProps() {
  return (
    <Mouse
      render={(mouse: any) => (
        <span>
          x: {mouse.x}; y: {mouse.y}
        </span>
      )}
    />
  );
}

export default renderProps;
