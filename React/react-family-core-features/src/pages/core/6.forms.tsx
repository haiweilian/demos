import React, { ChangeEvent, FormEvent } from "react";

interface State {
  value: string;
}

class FormInput extends React.Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      value: "hhh",
    };
  }

  handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      value: e.target.value,
    });
  };

  handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    alert("提交: " + this.state.value);
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          名字：{this.state.value}
          <input type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
        <input type="submit" value="提交" />
      </form>
    );
  }
}

class FormSelect extends React.Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      value: "mango",
    };
  }

  handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    this.setState({
      value: e.target.value,
    });
  };

  handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    alert("提交: " + this.state.value);
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          选择：{this.state.value}
          <select value={this.state.value} onChange={this.handleChange}>
            <option value="grapefruit">葡萄柚</option>
            <option value="lime">酸橙</option>
            <option value="coconut">椰子</option>
            <option value="mango">芒果</option>
          </select>
        </label>
        <input type="submit" value="提交" />
      </form>
    );
  }
}

export default function Form() {
  return (
    <div>
      <FormInput />
      <FormSelect />
    </div>
  );
}
