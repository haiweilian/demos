import "./module.js";
import "./style.less";

import React, { Component } from "react";
import { render } from "react-dom";
import { cube } from "./math.js";

import("./async").then((log) => {
  log.log("async");
});

console.log(cube(5));

class Button extends Component {
  render() {
    return <h1>Hello,Webpack.</h1>;
  }
}

render(<Button />, window.document.getElementById("app"));
