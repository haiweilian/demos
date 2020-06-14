import React, { useCallback } from "react";
// import { useSelector, useDispatch } from "react-redux";
import { useSelector, useDispatch } from "../react-redux";

export default function ReactReduxHooksPage(props) {
  const count = useSelector(({ count }) => count);

  const dispatch = useDispatch();

  const add = useCallback(() => {
    dispatch({ type: "ADD" });
  }, [dispatch]);

  const minus = useCallback(() => {
    dispatch({ type: "MINUS" });
  }, [dispatch]);

  return (
    <div>
      <h3>ReactReduxHooksPage</h3>
      <p>{count}</p>
      <button onClick={add}>add</button>
      <button onClick={minus}>minus</button>
    </div>
  );
}
