import React, { Component } from "react";
import store from "../store/index";

export default class ReduxPage extends Component {
  componentDidMount() {
    this.unsubscribe = store.subscribe(() => {
      this.forceUpdate();
    });
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
  }

  add = () => {
    store.dispatch({
      type: "ADD",
    });
  };

  minus = () => {
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
