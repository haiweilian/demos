import React from "react";
import { BrowserRouter, Route, NavLink, Switch } from "react-router-dom";
import Core from "./pages/core";
import High from "./pages/high";
import Hooks from "./pages/hooks";
import "./App.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <NavLink to="/" exact activeClassName="active">
          首页
        </NavLink>
        <span>|</span>
        <NavLink to="/core" exact activeClassName="active">
          核心概念
        </NavLink>
        <span>|</span>
        <NavLink to="/high" exact activeClassName="active">
          高级指引
        </NavLink>
        <span>|</span>
        <NavLink to="/hooks" exact activeClassName="active">
          Hooks
        </NavLink>
        <span>|</span>
        <Switch>
          <Route path="/core" component={Core}></Route>
          <Route path="/high" component={High}></Route>
          <Route path="/hooks" component={Hooks}></Route>
          <Route path="/" component={() => <div>首页</div>}></Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
