import kaplay from "https://unpkg.com/kaplay@3001.0.19/dist/kaplay.mjs";

const gameContainer = document.getElementById("canvas");

// Initialize Kaplay, passing the div as the canvas parent
kaplay({
    width: gameContainer.offsetWidth,  // Match div's width
    height: gameContainer.offsetHeight, // Match div's height
    background: "#d46eb3",
    scale: 2,
    canvas: document.getElementById("canvas"),
});

const bag = add([
    sprite("bag"),
]);