import { Assets } from "pixi.js";

const manifest = {
  bundles: [
    {
      name: "home-screen",
      assets: [{ alias: "flowerTop", src: "https://pixijs.com/assets/flowerTop.png" }],
    },
    {
      name: "game-screen",
      assets: [{ alias: "eggHead", src: "https://pixijs.com/assets/eggHead.png" }],
    },
  ],
};

(async () => {
  await Assets.init({ manifest });

  Assets.backgroundLoadBundle(["game-screen"]);

  const resources = await Assets.loadBundle("home-screen");
})();
