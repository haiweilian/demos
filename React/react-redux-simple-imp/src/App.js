import React from "react";
import ReduxPage from "./pages/ReduxPage";
import ReactReduxClassPage from "./pages/ReactReduxClassPage";
import ReactReduxHooksPage from "./pages/ReactReduxHooksPage";

function App() {
  return (
    <div className="App">
      {/* Redux */}
      <ReduxPage></ReduxPage>
      {/* React Redux Class  */}
      <ReactReduxClassPage></ReactReduxClassPage>
      {/* React Redux Hooks  */}
      <ReactReduxHooksPage></ReactReduxHooksPage>
    </div>
  );
}

export default App;
