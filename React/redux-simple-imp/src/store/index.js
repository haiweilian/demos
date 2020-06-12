// import { createStore, combineReducers } from "redux";
import { createStore, combineReducers } from "../redux/index";

// reducer 接受一个 state，更具 action 返回新的 state 。
const countReducer = (state = 0, { type, payload = 1 }) => {
  console.log("2、reducer---处理state");
  switch (type) {
    case "ADD":
      return state + payload;
    case "MINUS":
      return state - payload;
    default:
      return state;
  }
};

const store = createStore(combineReducers({ count: countReducer }));

export default store;
