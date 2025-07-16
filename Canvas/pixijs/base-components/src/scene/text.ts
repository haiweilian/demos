import { Application, Container, Text, HTMLText } from "pixi.js";

(async () => {
  const app = new Application();

  await app.init({ resizeTo: window });
  document.querySelector("#pixi-container")!.appendChild(app.canvas);

  // 容器
  const container = new Container();
  app.stage.addChild(container);

  // 文本
  const myText = new Text({
    text: "Hello PixiJS!",
    style: {
      fill: "#ffffff",
      fontSize: 36,
      fontFamily: "MyFont",
    },
  });
  setTimeout(() => {
    myText.text = "Hello PixiJS2!";
  }, 2000);
  app.stage.addChild(myText);

  // html
  const html = new HTMLText({
    text: "<strong>Hello</strong> <em>PixiJS</em>!",
    style: {
      fontFamily: "Arial",
      fontSize: 24,
      fill: "#ff1010",
      align: "center",
    },
  });

  app.stage.addChild(html);
})();
