// import React, {Component, useState} from "react";
// import ReactDOM from "react-dom";

import React from "./react/";
import ReactDOM, { useState } from "./react/react-dom";
import Component from "./react/Component";
import "./index.css";

function FunctionComponent({ name }) {
  const [count, setCount] = useState(0);
  return (
    <div className="border">
      {name}
      <button onClick={() => setCount(count + 1)}>click add:{count}</button>

      <div className="border">
        {count % 2 ? (
          <button
            onClick={() => {
              console.log("omg"); //sy-log
            }}
          >
            click
          </button>
        ) : (
          <div>omg</div>
        )}
      </div>
    </div>
  );
}

class ClassComponent extends Component {
  static defaultProps = {
    color: "pink",
  };
  render() {
    return (
      <div className="border">
        <p className={this.props.color}>color</p>
        {this.props.name}
      </div>
    );
  }
}

const jsx = (
  <div className="border">
    <p>React</p>
    <FunctionComponent name="FunctionComponent" />
    <ClassComponent name="ClassComponent" />
  </div>
);

ReactDOM.render(jsx, document.getElementById("root"));
