// 合成 reducer 把 多个 reducer 的执行结果，合并成一个对象整体返回
export default function combineReducers(reducers) {
  return function combination(state = {}, action) {
    let nextState = {};

    for (let key in reducers) {
      const reducer = reducers[key];
      nextState[key] = reducer(state[key], action);
    }

    return nextState;
  };
}
