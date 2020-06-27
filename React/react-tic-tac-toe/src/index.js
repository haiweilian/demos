import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

// class Square extends React.Component {
//   // constructor(props) {
//   //   super(props);
//   //   this.state = {
//   //     value: null,
//   //   };
//   // }
//   render() {
//     return (
//       <button className="square" onClick={() => this.props.onClick()}>
//         {this.props.value}
//       </button>
//     );
//   }
//

// 使用函数组件渲染
function Square(props) {
  return (
    <button className={"square " + props.className} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     squares: Array(9).fill(null),
  //     xIsNext: true,
  //   };
  // }

  // handleClick(i) {
  //   const squares = this.state.squares.slice();
  //   if (calculateWinner(squares) || squares[i]) {
  //     return;
  //   }
  //   squares[i] = this.state.xIsNext ? "X" : "O";
  //   this.setState({
  //     squares: squares,
  //     xIsNext: !this.state.xIsNext,
  //   });
  // }

  renderSquare(i, lineHight) {
    return (
      // value 当前历史数组的第几个
      <Square
        key={i}
        className={lineHight.includes(i) ? "red" : ""}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    // const winner = calculateWinner(this.state.squares);
    // let status;
    // if (winner) {
    //   status = "Winner: " + winner;
    // } else {
    //   status = `Next player: ${this.state.xIsNext ? "X" : "O"}`;
    // }
    // 5. 每当有人获胜时，高亮显示连成一线的 3 颗棋子。
    let lineHight = calculateWinner(this.props.squares) || [];

    // 6. 当无人获胜时，显示一个平局的消息。
    if (!this.props.squares.includes(null)) {
      alert("平局");
    }

    return (
      <div>
        {/* <div className="status">{status}</div> */}
        {/* 3. 使用两个循环来渲染出棋盘的格子，而不是在代码里写死（hardcode）。 */}
        {[0, 3, 6].map((row) => {
          return (
            <div className="board-row" key={row}>
              {[0, 1, 2].map((col) => {
                return this.renderSquare(row + col, lineHight);
              })}
            </div>
          );
        })}
        {/* <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div> */}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          step: 0,
          // col: 1,
          // row: 1,
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      xIsAsc: true,
    };
  }

  handleClick(i) {
    // 根据步骤截取历史，不然使用“回到历史就不对了”
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    // 获取当前的数据
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    // 胜利 或者 已经下过
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      // 把最新步骤添加为历史
      history: history.concat([
        {
          squares: squares,
          // 记录步骤
          step: history.length,
          // 1. 在游戏历史记录列表显示每一步棋的坐标，格式为 (列号, 行号)。
          col: (i % 3) + 1, // 列号
          row: Math.floor(i / 3) + 1, // 行号
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    // 设置步数，重新渲染
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  sortHistory() {
    this.setState({
      xIsAsc: !this.state.xIsAsc,
    });
  }

  render() {
    const history = this.state.history;
    // 获取当前数据
    const current = history[this.state.stepNumber];
    // 判断当前是否胜利
    const winner = calculateWinner(current.squares);
    // 渲染历史数组
    let moves = history.slice();
    // 4. 添加一个可以升序或降序显示历史记录的按钮。
    if (!this.state.xIsAsc) {
      moves.reverse();
    }
    moves = moves.map((step, move) => {
      const desc = step.step ? "Go to move #" + step.step : "Go to game start";
      return (
        // 2. 在历史记录列表中加粗显示当前选择的项目。
        <li
          key={step.step}
          className={this.state.stepNumber === step.step ? "red" : ""}
        >
          <button onClick={() => this.jumpTo(step.step)}>{desc}</button>
          <small>
            ({step.col}, {step.row})
          </small>
        </li>
      );
    });
    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.sortHistory()}>
            reverse {this.state.xIsAsc ? "asc" : "desc"}
          </button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      // return squares[a];
      return lines[i];
    }
  }
  return null;
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));
