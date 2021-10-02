import React from "react";

class Click extends React.Component {
  handleClick = () => {
    console.log(this);
  };
  render() {
    return <button onClick={this.handleClick}>click</button>;
  }
}

export default Click;
