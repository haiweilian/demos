import React from "react";

interface State {
  c: number;
  f: number;
  [x: string]: number;
}

interface Props {
  state: State;
  handleChange: handleChange;
}

type handleChange = (value: number) => void;

function C(props: Props) {
  return <input type="number" value={props.state.c} onChange={(event) => props.handleChange(Number(event.target.value))} />;
}

function F(props: Props) {
  return <input type="number" value={props.state.f} onChange={(event) => props.handleChange(Number(event.target.value))} />;
}

class Parent extends React.Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      c: 0,
      f: 0,
    };
  }

  handleChange = (value: number) => {
    this.setState({
      c: value,
      f: value,
    });
  };

  render() {
    return (
      <div>
        <C state={this.state} handleChange={this.handleChange} />
        <F state={this.state} handleChange={this.handleChange} />
      </div>
    );
  }
}

export default Parent;
