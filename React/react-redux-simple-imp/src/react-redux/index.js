import React, { useContext, useReducer, useLayoutEffect } from "react";

const ReduxContext = React.createContext();

export const connect = (
  mapStateToProps = (state) => state,
  mapDispatchToProps
) => (WrappedCompoent) => (props) => {
  const store = useContext(ReduxContext);

  const { getState, dispatch, subscribe } = store;

  const stateProps = mapStateToProps(getState());

  let dispatchProps = { dispatch };
  if (typeof mapDispatchToProps === "function") {
    dispatchProps = mapDispatchToProps(dispatch);
  } else if (typeof mapDispatchToProps === "object") {
    dispatchProps = bindActionCreators(mapDispatchToProps, dispatch);
  }

  // 创建不同的值，更新组件。
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);

  useLayoutEffect(() => {
    const unsubscribe = subscribe(() => {
      forceUpdate();
    });

    // 组件卸载时候执行
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [store, subscribe]);

  return <WrappedCompoent {...props} {...stateProps} {...dispatchProps} />;
};

export function Provider({ store, children }) {
  return (
    <ReduxContext.Provider value={store}>{children}</ReduxContext.Provider>
  );
}

function bindActionCreator(creator, dispatch) {
  return (...args) => dispatch(creator(...args));
}

export function bindActionCreators(creators, dispatch) {
  let obj = {};

  for (let key in creators) {
    obj[key] = bindActionCreator(creators[key], dispatch);
  }

  return obj;
}

export function useStore() {
  const store = useContext(ReduxContext);
  return store;
}

export function useSelector(selector) {
  const store = useStore();

  const { getState, subscribe } = store;

  const selectState = selector(getState());

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);

  useLayoutEffect(() => {
    const unsubscribe = subscribe(() => {
      forceUpdate();
    });

    // 组件卸载时候执行
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [store, subscribe]);

  return selectState;
}

export function useDispatch() {
  const store = useStore();
  return store.dispatch;
}
