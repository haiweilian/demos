// import logger from "redux-logger";
// import { createStore, combineReducers, applyMiddleware } from "redux";

import logger1 from "../middleware/redux-logger-1";
import logger2 from "../middleware/redux-logger-2";
import { createStore, combineReducers, applyMiddleware } from "../redux/index";

// reducer 接受一个 state，更具 action 返回新的 state 。
const countReducer = (state = 0, { type, payload = 1 }) => {
  // console.log("2、reducer---处理state");
  switch (type) {
    case "ADD":
      return state + payload;
    case "MINUS":
      return state - payload;
    default:
      return state;
  }
};

const store = createStore(combineReducers({ count: countReducer }), applyMiddleware(logger2, logger1));

export default store;
