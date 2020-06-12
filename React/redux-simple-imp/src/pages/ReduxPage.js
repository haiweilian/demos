import React, { Component } from "react";
import store from "../store/index";

export default class ReduxPage extends Component {
  componentDidMount() {
    // 添加订阅，当 state 更新的时候执行回调更新
    this.unsubscribe = store.subscribe(() => {
      console.log("3、subscribe-更新");
      this.forceUpdate();
    });
  }

  componentWillUnmount() {
    // 组件卸载时删除订阅
    this.unsubscribe && this.unsubscribe();
  }

  add = () => {
    // 触发更新执行，传递 action
    console.log("1、action---加");
    store.dispatch({
      type: "ADD",
    });
  };

  minus = () => {
    // 触发更新执行, 传递 action
    console.log("1、action---减");
    store.dispatch({
      type: "MINUS",
    });
  };

  render() {
    return (
      <div>
        <h3>ReduxPage</h3>
        <p>{store.getState().count}</p>
        <button onClick={this.add}>add</button>
        <button onClick={this.minus}>minus</button>
      </div>
    );
  }
}
