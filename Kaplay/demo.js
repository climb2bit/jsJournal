import kaplay from "https://unpkg.com/kaplay@3001.0.19/dist/kaplay.mjs";

const gameContainer = document.getElementsByClassName("game-content")[0];

// Initialize Kaplay, passing the div as the canvas parent
const k = kaplay({
    width: gameContainer.offsetWidth-5,  // Match div's width
    height: gameContainer.offsetHeight-5, // Match div's height
    root: gameContainer,
});


scene("game", () => {
    // environment
    loadSprite("background-image", "../Resources/gameBackGround.jpg");
    add([
        sprite("background-image"),
        scale(1.4),
        z(-100), // Pushes the image to the back
    ]);

    const base = add([
        rect(width(), 80),
        pos(0, height() - 80),
        outline(1),
        area(),
        body({ isStatic: true }),        
    ]);
    base.opacity = 0

    setGravity(1400);

    function spawnTree() {
        add([
            rect(48, rand(24, 80)),
            area(),
            outline(4),
            pos(width(), height() - 80),
            anchor("botleft"),
            color(rand(130, 255), 180, rand(100, 200)),
            move(LEFT, 240),
            "tree", // add a tag here
        ]);
        wait(rand(0.8, 1.5), () => {
            spawnTree();
        });
    }

    spawnTree();

    // player
    loadSprite("monster", "../Resources/monster3.png");

    const player = add([
            sprite("monster"),
            pos(80,40),
            scale(0.2),
            area(),
            body()
        ]
    )

    function jump() {
        if (player.isGrounded()) {
            player.jump();
        }
    }

    // jump when user press space
    onKeyPress("space", jump);
    onClick(jump);

    // add score
    let score = 0;
    const scoreLabel = add([text(score), pos(24, 24)]);

    // increment score every frame
    onUpdate(() => {
        score++;
        scoreLabel.text = score;
    });

    // collision
    player.onCollide("tree", () => {
        addKaboom(player.pos);
        shake();
        go("lose", score);
    });
})

scene("lose", (score) => {
    add([
        sprite("monster"),
        pos(width() / 2, height() / 2 - 80),
        scale(0.8),
        anchor("center"),
    ]);

    // display score
    add([
        text(score),
        pos(width() / 2, height() / 2 + 80),
        scale(2),
        anchor("center"),
    ]);

    // go back to game with space is pressed
    onKeyPress("space", () => go("game"));
    onClick(() => go("game"));
});

go("game");


