export default function logger2({ getState }) {
  return function next2(next) {
    debugger;
    return function action2(action) {
      debugger;
      console.log(action.type + "执行了！--2");

      // 调用下一个中间件 logger1
      const returnValue = next(action);

      const nextState = getState();
      console.log("next state", nextState, returnValue);

      return returnValue;
    };
  };
}
