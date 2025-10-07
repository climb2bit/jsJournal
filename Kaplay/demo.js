import kaplay from "https://unpkg.com/kaplay@3001.0.19/dist/kaplay.mjs";

const gameContainer = document.getElementsByClassName("game-content")[0];

// Initialize Kaplay, passing the div as the canvas parent
const k = kaplay({
    width: gameContainer.offsetWidth,  // Match div's width
    height: gameContainer.offsetHeight, // Match div's height
    canvas: gameContainer,              // This is the key!
    background: [0, 0, 0, 1],           // Black background
});

k.loadBean();

k.add([k.sprite("bean"), k.anchor("center"), k.pos(k.center()), k.scale(2)]);