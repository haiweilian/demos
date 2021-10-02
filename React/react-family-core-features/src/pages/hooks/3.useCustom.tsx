import { useState, useEffect } from "react";

function useMouse() {
  const [state, setState] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function position(event: MouseEvent) {
      setState({
        x: event.pageX,
        y: event.pageY,
      });
    }
    window.addEventListener("mousemove", position);
    return () => {
      window.removeEventListener("mousemove", position);
    };
  }, []);

  return state;
}

function Custom() {
  const mouse = useMouse();
  return (
    <div>
      x: {mouse.x}, y: {mouse.y}
    </div>
  );
}

export default Custom;
