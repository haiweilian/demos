// 把 dispatch 这个方法不断用高阶函数包装，最后返回一个强不断化过后的 dispatch，就是一层套一层。
export default function applyMiddleware(...middlewares) {
  // 在创建 createStore 的时候，发现有 middleware，走加强的逻辑。
  return (createStore) => (reducer) => {
    const store = createStore(reducer);

    // 待加强的 dispatch。
    let dispatch = store.dispatch;

    // 把获取值和原始 dispatch 存储起来。
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args),
    };

    // 生成一个中间件的链，给每个节点添加 middlewareAPI。
    // 第一阶函数将会获得 middlewareAPI。next => action => {}
    const middlewaresChain = middlewares.map((middleware) => middleware(middlewareAPI));

    // 包装层一个函数 从右到左执行 加强版的 dispatch，并将最初的 dispatch 传递给 compose。
    dispatch = compose(...middlewaresChain)(dispatch);

    // 最后返回加强过 dispatch 的对象。
    return {
      ...store,
      dispatch,
    };
  };
}

function compose(...funcs) {
  // 没有传入函数参数，就返回一个默认函数（直接返回参数）
  if (funcs.length === 0) {
    return (arg) => arg;
  }
  // 单元素数组时调用 reduce，会直接返回该元素，不会执行callback; 所以这里手动执行
  if (funcs.length === 1) {
    return funcs[0];
  }
  // 依次拼凑执行函数
  // compose(f4, f3, f2, f1)("omg")
  // reduce回调函数第一次执行时，返回值为 函数 (...args) => f4(f3(...args))，作为下一次执行的a参数
  // 回调函数第二次执行时，返回值为 函数(...args) => f4(f3(f2(...args))),作为下一次执行的a参数
  // 回调函数第三次执行时，返回值为 函数(...args) => f4(f3(f2(f1(...args))))
  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}
