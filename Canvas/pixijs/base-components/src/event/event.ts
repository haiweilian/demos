import { Application, Assets, Container, Sprite } from "pixi.js";

(async () => {
  const app = new Application();

  await app.init({ resizeTo: window });
  document.querySelector("#pixi-container")!.appendChild(app.canvas);

  // 容器
  const container = new Container();
  app.stage.addChild(container);

  // 图片
  const gui = await Assets.load("images/gui.jpg");
  const guiSprite = new Sprite(gui);
  guiSprite.eventMode = "static";
  guiSprite.on("pointerdown", () => {
    console.log("Sprite pointerdown!");
  });
  guiSprite.addEventListener("click", () => {
    console.log("Sprite click!");
  });
  container.addChild(guiSprite);
})();
