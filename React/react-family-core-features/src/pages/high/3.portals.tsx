import ReactDOM from "react-dom";

function Portals() {
  return ReactDOM.createPortal(<div>外部</div>, document.querySelector("body") as HTMLBodyElement);
}

export default Portals;
