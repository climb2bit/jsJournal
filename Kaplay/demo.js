import kaplay from "https://unpkg.com/kaplay@3001.0.19/dist/kaplay.mjs";

const gameContainer = document.getElementsByClassName("game-content")[0];

// Initialize Kaplay, passing the div as the canvas parent
kaplay({
    width: gameContainer.offsetWidth,  // Match div's width
    height: gameContainer.offsetHeight, // Match div's height
    canvas: gameContainer,              // This is the key!
    background: [0, 0, 0, 1],           // Black background
});

const bag = add([
    sprite("bag"),
]);