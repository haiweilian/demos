import { Application, Assets, Container, Sprite, Graphics } from "pixi.js";

(async () => {
  const app = new Application();

  await app.init({ resizeTo: window });
  document.querySelector("#pixi-container")!.appendChild(app.canvas);

  // 容器
  const container = new Container();
  app.stage.addChild(container);

  // 图片，精灵
  await Assets.load("images/gui.jpg");
  const guiSprite = Sprite.from("images/gui.jpg");
  container.addChild(guiSprite);

  const mao = await Assets.load("images/mao.jpg");
  const maoSprite = Sprite.from(mao);
  container.addChild(maoSprite);

  // 图形
  const graphics = new Graphics().rect(50, 50, 100, 100).fill(0xff0000).circle(200, 200, 50).stroke(0x00ff00);
  container.addChild(graphics);

  const shapes = new Graphics()
    .rect(1050, 50, 100, 100)
    .circle(1250, 100, 50)
    .star(1400, 100, 6, 60, 40)
    .roundRect(1500, 50, 100, 100, 10)
    .fill({
      texture: await Assets.load("images/gui.jpg"),
      textureSpace: "local", // default!
    });
  container.addChild(shapes);
})();
