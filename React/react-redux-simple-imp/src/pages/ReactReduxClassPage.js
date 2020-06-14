import React, { Component } from "react";
// import { connect } from "react-redux";
import { connect } from "../react-redux";

export default connect(
  // mapStateToProps
  ({ count }) => ({ count }),
  // mapDispatchToProps object | function
  {
    add: () => ({ type: "ADD" }),
    minus: () => ({ type: "MINUS" }),
  }
)(
  class ReactReduxClassPage extends Component {
    render() {
      console.log("props", this.props);
      const { count, add, minus } = this.props;
      return (
        <div>
          <h3>ReactReduxClassPage</h3>
          <p>{count}</p>
          <button onClick={add}> add</button>
          <button onClick={minus}> minus</button>
        </div>
      );
    }
  }
);
