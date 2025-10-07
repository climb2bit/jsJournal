import kaplay from "https://unpkg.com/kaplay@3001.0.19/dist/kaplay.mjs";

const ui = document.querySelector(".game-nav");

new ResizeObserver(() => {
  document.documentElement.style.setProperty(
    "--scale",
    Math.min(
      ui.parentElement.offsetWidth / ui.offsetWidth,
      ui.parentElement.offsetHeight / ui.offsetHeight
    )
  );
}).observe(ui.parentElement);

const k = kaplay({
  width: 640,
  height: 480,
  letterbox: true,
});

k.loadBean();

k.add([k.sprite("bean"), k.anchor("center"), k.pos(k.center()), k.scale(2)]);