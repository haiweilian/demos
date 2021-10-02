import React from "react";

interface State {
  date: Date;
}

class Clock extends React.Component<any, State> {
  timer: any;

  constructor(props: any) {
    super(props);
    this.state = {
      date: new Date(),
    };
  }

  tick() {
    this.setState({
      date: new Date(),
    });
  }

  componentDidMount() {
    console.log("componentDidMount");
    this.timer = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    console.log("componentWillUnmount");
    clearInterval(this.timer);
  }

  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    );
  }
}

export default Clock;
