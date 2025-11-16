import kaplay from "https://unpkg.com/kaplay@3001.0.19/dist/kaplay.mjs";

const gameContainer = document.getElementsByClassName("game-content")[0];

const k = kaplay({
    width: gameContainer.offsetWidth-5,  // Match div's width
    height: gameContainer.offsetHeight-5, // Match div's height
    root: gameContainer,
});

// --- Add: playful background for kids ---
add([
	// big sky background
	rect(width(), height()),
	pos(width()/2, height()/2),
	anchor("center"),
	color(135, 206, 250), // sky blue
	z(-10),
]);

// ground / floor stripe
add([
	rect(width(), 120),
	pos(width()/2, height() - 60),
	anchor("center"),
	color(144, 238, 144), // soft green ground
	z(-9),
]);

// simple clouds made from rounded pills
(function addCloud(cx, cy, scale = 1) {
	const w = 120 * scale;
	const h = 48 * scale;
	add([ rect(w, h, { radius: h/2 }), pos(cx-40*scale, cy), anchor("center"), color(255,255,255), z(-9) ]);
	add([ rect(w*0.8, h, { radius: h/2 }), pos(cx+10*scale, cy-6*scale), anchor("center"), color(255,255,255), z(-9) ]);
	add([ rect(w*0.7, h, { radius: h/2 }), pos(cx+50*scale, cy+6*scale), anchor("center"), color(255,255,255), z(-9) ]);
})(width()*0.2, 80, 1.0);

(function addCloud(cx, cy, scale = 0.8) {
	const w = 100 * scale;
	const h = 40 * scale;
	add([ rect(w, h, { radius: h/2 }), pos(cx-30*scale, cy), anchor("center"), color(255,255,255), z(-9) ]);
	add([ rect(w*0.8, h, { radius: h/2 }), pos(cx+10*scale, cy-6*scale), anchor("center"), color(255,255,255), z(-9) ]);
})(width()*0.75, 60, 0.9);

// --- end additions ---

// Add keypad vertical anchor so we can position HUD elements relative to it
const PANEL_Y = 550; // moved down to ensure no overlap with doors/ground

let selectedFloor = "";
let isMoving = false;
let currentFloor = 1;

// --- Added: door/frame geometry and helpers ---
const doorFrameWidth = 320;
const doorWidth = 150;

function frameCenterX() {
	// Re-evaluate center each time (responsive)
	return width() / 2;
}

function doorPositions() {
	const fc = frameCenterX();
	const frameHalf = doorFrameWidth / 2;
	const doorHalf = doorWidth / 2;
	// open positions: doors moved fully outside the frame
	const openLeftX = fc - frameHalf - doorHalf;
	const openRightX = fc + frameHalf + doorHalf;
	// closed positions: doors meet near center
	const closedLeftX = fc - doorHalf;
	const closedRightX = fc + doorHalf;
	// "rest" (slightly open) positions inside frame edges (nice animation)
	const restLeftX = fc - frameHalf + doorHalf;
	const restRightX = fc + frameHalf - doorHalf;
	return { fc, openLeftX, openRightX, closedLeftX, closedRightX, restLeftX, restRightX };
}

// Small beep utility (uses WebAudio)
function beep(duration = 0.06, freq = 880, type = "sine") {
	try {
		const C = window.AudioContext || window.webkitAudioContext;
		const ctx = new C();
		const o = ctx.createOscillator();
		const g = ctx.createGain();
		o.type = type;
		o.frequency.value = freq;
		o.connect(g);
		g.connect(ctx.destination);
		g.gain.setValueAtTime(0.0001, ctx.currentTime);
		g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
		o.start();
		g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
		o.stop(ctx.currentTime + duration + 0.02);
		// close context after a short delay to free resources
		setTimeout(() => ctx.close(), (duration + 0.05) * 1000);
	} catch (e) {
		// Audio might be blocked; fail silently
	}
}
// --- end additions ---

// Current floor display (moved slightly above the keyboard/panel)
// declare variable here so it's available throughout the file; actual add() created later
let floorDisplay;

// Selected floor display
const selectedDisplay = add([
    text("", { size: 32, font: "monospace" }),
    pos(width() / 2, 50),    
    anchor("center"),
    color(255, 0, 0),
    z(20),
]);

// Door frame (uses computed center so responsive) AND friendly cabin interior
{
	const { fc } = doorPositions();
	add([
	    rect(doorFrameWidth, 310),
	    pos(fc, 250),
	    anchor("center"),
	    outline(4, rgb(60, 60, 80)),
	    color(0, 0, 0, 0),
	    z(-1),
	]);

	// Cabin interior — friendly light color (not black)
	add([
		rect(doorFrameWidth - 18, 270),
		pos(fc, 250),
		anchor("center"),
		color(200, 235, 255), // light, inviting cabin color
		outline(2, rgb(18, 12, 126)),
		z(-1), // behind doors but above background
	]);

	// // small decorative rug inside
	// add([
	// 	rect(doorFrameWidth - 120, 30, { radius: 12 }),
	// 	pos(fc, 320),
	// 	anchor("center"),
	// 	color(255, 235, 180),
	// 	z(0),
	// ]);

	// // Fun floor number display inside cabin
	// add([
	// 	text("🏢", { size: 48, font: "monospace" }),
	// 	pos(fc, 200),
	// 	anchor("center"),
	// 	z(1),
	// ]);

	// Cabin lights (two circles in top corners)
	// add([
	// 	circle(12),
	// 	pos(fc - 80, 150),
	// 	anchor("center"),
	// 	color(255, 255, 200),
	// 	z(1),
	// ]);

	// add([
	// 	circle(12),
	// 	pos(fc + 80, 150),
	// 	anchor("center"),
	// 	color(255, 255, 200),
	// 	z(1),
	// ]);

	// Friendly mirror decoration
	// add([
	// 	rect(250, 300, { radius: 8 }),
	// 	pos(fc, 130),
	// 	anchor("center"),
	// 	color(200, 240, 255),
	// 	outline(3, rgb(100, 150, 200)),
	// 	z(1),
	// ]);

	// Decorative handrail bumps on sides
	// for (let i = 0; i < 3; i++) {
	// 	add([
	// 		circle(6),
	// 		pos(fc - doorFrameWidth/2 + 15, 180 + i*50),
	// 		anchor("center"),
	// 		color(150, 150, 150),
	// 		z(1),
	// 	]);

	// 	add([
	// 		circle(6),
	// 		pos(fc + doorFrameWidth/2 - 15, 180 + i*50),
	// 		anchor("center"),
	// 		color(150, 150, 150),
	// 		z(1),
	// 	]);
	// }
}

// Doors (use dynamic positions)
let leftDoor, rightDoor;
{
	const posns = doorPositions();
	leftDoor = add([
	    rect(doorWidth, 300),
	    pos(posns.openLeftX, 250), // start opened to the sides so kids see inside
	    color(192, 192, 192), // silver color
	    anchor("center"),
	    { doorSide: "left" },
	    z(1),
	]);

	rightDoor = add([
	    rect(doorWidth, 300),
	    pos(posns.openRightX, 250),
	    color(192, 192, 192), // silver color
	    anchor("center"),
	    { doorSide: "right" },
	    z(1 ),
	]);
}

// Message area (initially visible above cabin but behind some controls)
const messageText = add([
    text("", { size: 24, font: "monospace", align: "center" }),
    pos(width() / 2, 250),
    anchor("center"),
    color(255, 20, 20),
    z(5), // above doors so readable by default
]);

// Button panel background
add([
    rect(280, 270), // reduced from 350, 330
    pos(width() / 2, PANEL_Y),
    anchor("center"),
    color(50, 50, 60),
    outline(3, rgb(100, 100, 120)),
    z(10), // above cabin/background
]);

add([
    text("SELECT FLOOR", { size: 20, font: "monospace" }),
    pos(width() / 2, 440), // adjusted to keep spacing from panel
    anchor("center"),
    color(150, 150, 170),
    z(11),
]);

// Create the current floor display now and place it between "SELECT FLOOR" (y=430)
// and the keypad top (which uses PANEL_Y - 10).
floorDisplay = add([
    text(`Current Floor: ${currentFloor}`, { size: 24, font: "monospace" }),
    pos(width() / 2, (430 + (PANEL_Y - 10)) / 2),
    anchor("center"),
    color(100, 255, 100),
    z(20),
]);

// Create number buttons (0-9) — responsive, centered inside the panel
const buttons = [];
{
	const panelX = width() / 2;
	const panelY = PANEL_Y;
	const panelW = 280; // match reduced panel width
	const btnSize = 48; // slightly smaller buttons
	const cols = 5; // keep 5 columns
	// spacing computed to center grid inside panel
	const spacing = Math.min(56, (panelW - btnSize) / (cols - 1));
	const startX = panelX - ((cols - 1) * spacing) / 2;
	const startY = panelY - 5; // slight upward offset inside panel

	for (let i = 0; i <= 9; i++) {
	    const row = Math.floor(i / cols);
	    const col = i % cols;
	    const x = startX + col * spacing;
	    const y = startY + row * 70; // reduced row spacing

	    const btn = add([
	        rect(btnSize, btnSize, { radius: 8 }),
	        pos(x, y),
	        anchor("center"),
	        color(70, 70, 90),
	        outline(2, rgb(100, 100, 120)),
	        area(),
	        z(11),
	        { number: i, isHovered: false }
	    ]);

	    const btnText = add([
	        text(i.toString(), { size: 28, font: "monospace" }),
	        pos(x, y),
	        anchor("center"),
	        color(200, 200, 220),
	        z(12),
	    ]);

	    // Hover visuals
	    btn.onHoverUpdate(() => {
	        if (!isMoving) {
	            btn.color = rgb(100, 100, 130);
	            btn.isHovered = true;
	            setCursor("pointer");
	        }
	    });

	    btn.onHoverEnd(() => {
	        btn.color = rgb(70, 70, 90);
	        btn.isHovered = false;
	        setCursor("default");
	    });

	    // Click: visual press + selection logic
	    btn.onClick(() => {
	        console.log(`Button ${i} clicked`);
	        if (isMoving) return;

	        // quick press animation
	        btn.scale = vec2(0.92);
	        // Provide a setter and easing — tween needs a setter function
	        tween(btn.scale, vec2(1,1), 0.12, (v) => btn.scale = v, easings.easeOutCubic);

	        if (selectedFloor.length < 2) {
	            selectedFloor += i.toString();
	            selectedDisplay.text = `Selected: ${selectedFloor}`;
	            
	            if (selectedFloor.length === 2) {
	                goToFloor(parseInt(selectedFloor));
	            }
	        }
	    });

	    buttons.push({ btn, btnText });
	}
}

// Clear button
const clearBtn = add([
    rect(120, 55, { radius: 8 }),
    pos(width() / 2, PANEL_Y + 90), // positioned below panel
    anchor("center"),
    color(120, 50, 50),
    outline(2, rgb(150, 70, 70)),
    area(),
]);

add([
    text("CLEAR", { size: 20, font: "monospace" }),
    pos(width() / 2, PANEL_Y + 90),
    anchor("center"),
    color(255, 255, 255),
]);

clearBtn.onHoverUpdate(() => {
    if (!isMoving) {
        clearBtn.color = rgb(150, 70, 70);
        setCursor("pointer");
    }
});

clearBtn.onHoverEnd(() => {
    clearBtn.color = rgb(120, 50, 50);
    setCursor("default");
});

clearBtn.onClick(() => {
    console.log("Clear button clicked");
    if (!isMoving) {
        selectedFloor = "";
        selectedDisplay.text = "";
        beep(0.04, 220, "sine");
    }
});

// --- Modified goToFloor to use computed positions, animate z-order and feedback ---
async function goToFloor(floor) {
    if (floor === currentFloor) {
        selectedDisplay.text = "Already at this floor!";
        selectedFloor = "";
        wait(2, () => {
            selectedDisplay.text = "";
        });
        return;
    }

    isMoving = true;
    // hide message while doors close so it doesn't peek through
    messageText.z = -1;
    messageText.text = "";

    // recompute positions in case container resized
    const posns = doorPositions();

    // Close doors (move toward center closed positions)
    tween(
        leftDoor.pos.x,
        posns.closedLeftX,
        0.8,
        (val) => leftDoor.pos.x = val,
        easings.easeInOutQuad
    );

    tween(
        rightDoor.pos.x,
        posns.closedRightX,
        0.8,
        (val) => rightDoor.pos.x = val,
        easings.easeInOutQuad
    );

    // small closing beep (optional)
    beep(0.08, 660, "square");

    await wait(0.9);

    // Travel: show friendly animation
    const travelTime = rand(2, 5);
    let dots = 0;
    selectedDisplay.text = "Travelling";
    const pulse = setInterval(() => {
        if (!isMoving) { clearInterval(pulse); return; }
        dots = (dots + 1) % 4;
        selectedDisplay.text = "Travelling" + ".".repeat(dots);
        // subtle pulse of floor display
        floorDisplay.color = rgb(100, 255 - (dots*30), 100 + (dots*20));
    }, 450);

    await wait(travelTime);

    // Arrived
    currentFloor = floor;
    messageText.text = `Now you are at level ${floor.toString().padStart(2, '0')} 🎉`;
    beep(0.12, 880, "sine");

    // Open doors (move to open positions)
    tween(
        leftDoor.pos.x,
        posns.openLeftX,
        0.8,
        (val) => leftDoor.pos.x = val,
        easings.easeInOutQuad
    );

    tween(
        rightDoor.pos.x,
        posns.openRightX,
        0.8,
        (val) => rightDoor.pos.x = val,
        easings.easeInOutQuad
    );

    // bring message forward as doors open
    wait(0.15, () => { messageText.z = 5; });

    // small celebratory emoji "confetti" burst (simple star texts)
    const burst = [];
    for (let i = 0; i < 8; i++) {
        const sx = frameCenterX() + rand(-40, 40);
        const sy = 240 + rand(-15, 15);
        const star = add([
            text(["✨","🎉","🌟","👏"][Math.floor(Math.random()*4)], { size: rand(18, 28), font: "monospace" }),
            pos(sx, sy),
            anchor("center"),
            color(255, 220, 120),
        ]);
        // animate stars outward then remove
        tween(star.pos, vec2(star.pos.x + rand(-60, 60), star.pos.y - rand(40, 120)), 0.9, (v)=> star.pos = v, easings.easeOutCubic);
        wait(0.9, () => { destroy(star); });
        burst.push(star);
    }

    await wait(1);

    floorDisplay.text = `Current Floor: ${currentFloor}`;
    selectedDisplay.text = "";
    selectedFloor = "";
    isMoving = false;
    clearInterval(pulse);

    // gently set message to lower emphasis after a short moment
    wait(2, () => {
        messageText.text = "";
        messageText.z = -1;
        // restore floor display color
        floorDisplay.color = color(100,255,100);
    });
}