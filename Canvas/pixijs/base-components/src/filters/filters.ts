import { Application, Assets, Container, Sprite, BlurFilter, NoiseFilter } from "pixi.js";

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
  guiSprite.filters = [new BlurFilter({ strength: 4 }), new NoiseFilter({ noise: 0.2 })];
  container.addChild(guiSprite);
})();
