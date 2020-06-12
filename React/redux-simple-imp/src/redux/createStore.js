export default function createStore(reducer) {
  let currentState;
  let currentListeners = [];

  // 获取当前的 state
  function getState() {
    return currentState;
  }

  // 提交 action 执行 reducer
  function dispatch(action) {
    currentState = reducer(currentState, action);
    currentListeners.forEach((listener) => listener());
    return action;
  }

  // 添加订阅
  function subscribe(listener) {
    currentListeners.push(listener);
    // 返回用于取消订阅的方法
    return () => {
      const index = currentListeners.indexOf(listener);
      currentListeners.splice(index, 1);
    };
  }

  // 默认执行一次，触发下默认值
  dispatch({ type: "REUDX/DEFAULT" });

  return {
    getState,
    dispatch,
    subscribe,
  };
}
