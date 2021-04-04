export default function logger1({ getState }) {
  return function next1(next) {
    debugger;
    return function action1(action) {
      debugger;
      console.log(action.type + "执行了！--1");

      const prevState = getState();
      console.log("prev state", prevState);

      // 执行真正的 dispatch
      const returnValue = next(action);

      return returnValue;
    };
  };
}
