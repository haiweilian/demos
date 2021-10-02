import ComponentsAndProps from "./1.components-and-props";
import StateAndLifecycle from "./2.state-and-lifecycle";
import HandlingEvents from "./3.handling-events";
import ConditionalRendering from "./4.conditional-rendering";
import ListsAndKeys from "./5.lists-and-keys";
import Forms from "./6.forms";
import IftingStateUp from "./7.lifting-state-up";
import Layout from "./8.composition-vs-inheritance";

function Core() {
  return (
    <div>
      <h1>1、</h1>
      <ComponentsAndProps name="lian" />
      <h1>2、</h1>
      <StateAndLifecycle />
      <h1>3、</h1>
      <HandlingEvents />
      <h1>4、</h1>
      <ConditionalRendering />
      <h1>5、</h1>
      <ListsAndKeys />
      <h1>6、</h1>
      <Forms />
      <h1>7、</h1>
      <IftingStateUp />
      <h1>8、</h1>
      <Layout header="header" main={<span>main</span>} footer="footer" />
    </div>
  );
}
export default Core;
