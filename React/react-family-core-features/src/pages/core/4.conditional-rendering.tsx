import React from "react";

interface State {
  isLogged: boolean;
}

function IsLoggedFn(props: State) {
  if (props.isLogged) {
    return <h1>Welcome back!</h1>;
  } else {
    return <h1>Please sign up.</h1>;
  }
}

class Conditional extends React.Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      isLogged: false,
    };
  }
  handleClick = () => {
    this.setState({
      isLogged: !this.state.isLogged,
    });
  };
  render() {
    return (
      <div>
        <IsLoggedFn isLogged={this.state.isLogged} />
        <button onClick={this.handleClick}>切换登录</button>
      </div>
    );
  }
}

export default Conditional;
