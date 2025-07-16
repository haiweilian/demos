import { Assets } from "pixi.js";

const manifest = {
  bundles: [
    {
      name: "mao-screen",
      assets: [{ alias: "mao", src: "images/mao.jpg" }],
    },
    {
      name: "gui-screen",
      assets: [
        { alias: "gui", src: "images/mao.jpg" },
        { alias: "bunny", src: "https://pixijs.com/assets/bunny.png" },
      ],
    },
  ],
};

(async () => {
  await Assets.init({ manifest });

  console.time("load");
  const mao = await Assets.load("mao");
  const maoScreen = await Assets.loadBundle("mao-screen");
  const guiScreen = await Assets.loadBundle("gui-screen");
  console.timeEnd("load");
  console.log(mao, maoScreen, guiScreen);
})();
