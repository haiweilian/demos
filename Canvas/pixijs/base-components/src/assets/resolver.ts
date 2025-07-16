import { Assets } from "pixi.js";

(async () => {
  const mao = await Assets.load({
    alias: "mao",
    src: "images/mao.jpg",
  });
  console.log(mao);
})();
