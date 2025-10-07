import kaplay from "https://unpkg.com/kaplay@3001.0.19/dist/kaplay.mjs";

const gameContainer = document.getElementsByClassName("game-content")[0];

// Initialize Kaplay, passing the div as the canvas parent
const k = kaplay({
    width: gameContainer.offsetWidth-5,  // Match div's width
    height: gameContainer.offsetHeight-5, // Match div's height
    root: gameContainer,
});

k.loadBean();

k.add([k.sprite("bean"), k.anchor("center"), k.pos(k.center()), k.scale(2)]);