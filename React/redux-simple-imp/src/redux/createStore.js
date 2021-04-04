// 创建一个函数，存储值、收集订阅、更新订阅。-- 观察者模式
export default function createStore(reducer, enhancer) {
  // ！！！如果有中间件，使用加强版的函数。
  if (enhancer) {
    return enhancer(createStore)(reducer);
  }

  let currentState;
  let currentListeners = [];

  // 获取当前的 state
  function getState() {
    return currentState;
  }

  // 提交 action 执行 reducer
  function dispatch(action) {
    // 执行自定义的 reducer，根据  action 获取新的值，通知所有的监听。
    currentState = reducer(currentState, action);
    currentListeners.forEach((listener) => listener());
    // 记住 dispatch 执行后返回的 action。
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
