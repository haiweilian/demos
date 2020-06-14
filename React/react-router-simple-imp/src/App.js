import React, { Component } from "react";

import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  useRouteMatch,
  useHistory,
  useLocation,
  useParams,
  withRouter,
  Prompt,
  // } from "react-router-dom";
} from "./react-router-dom";

import _404Page from "./pages/_404Page";
import HomePage from "./pages/HomePage";
import UserPage from "./pages/UserPage";
import LoginPage from "./pages/LoginPage";
import ProductPage from "./pages/ProductPage";

function App() {
  return (
    <div className="App">
      <Router>
        <Link to="/">首页</Link>
        <Link to="/user">用户中心</Link>
        <Link to="/login">登录</Link>
        <Link to="/product/123">商品</Link>
        <Link to="/outer/class">其他class</Link>
        <Link to="/outer/hooks">其他hooks</Link>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route path="/user" component={UserPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/product/:id" component={ProductPage} />
          <Route path="/outer/class" render={() => <OuterClass />} />
          <Route path="/outer/hooks" render={() => <OuterHooks />} />
          <Route component={_404Page} />
        </Switch>
      </Router>
    </div>
  );
}

@withRouter
class OuterClass extends Component {
  constructor(props) {
    super(props);
    this.state = { confirm: true };
  }
  render() {
    console.log("OuterClass", this.props);
    return (
      <div>
        <h3>OuterClass</h3>
        <Link to="/">go home</Link>
        <Prompt
          when={this.state.confirm}
          message={(location) => {
            return "Are you sure you want to leave-fun";
          }}
        />
      </div>
    );
  }
}

function OuterHooks() {
  const match = useRouteMatch();
  const history = useHistory();
  const location = useLocation();
  const params = useParams();

  console.log("match", match); //sy-log
  console.log("history", history); //sy-log
  console.log("location", location); //sy-log
  console.log("params", params); //sy-log

  return <h3>OuterHooks</h3>;
}

export default App;
