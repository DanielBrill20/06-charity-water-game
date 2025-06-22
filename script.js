// Log a message to the console to ensure the script is linked correctly
console.log('JavaScript file is linked correctly.');

// ====== Water Quest Game ======

// Game state variables
let score = 0;
let lives = 3;
let timer = 60; // seconds
let gameInterval = null;
let timerInterval = null;
let multiplier = 1;
let multiplierTimeout = null;
let gameActive = false;

// DOM elements
const logo = document.getElementById('logo');
const livesDiv = document.getElementById('lives');
const pointsDiv = document.getElementById('points');
const timerDiv = document.getElementById('timer');
const messageArea = document.getElementById('message-area');
const gameArea = document.getElementById('game-area');

// Show intro modal on load
showIntro();

// Start game on button click
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);

// Function to start or restart the game
function startGame() {
    // Reset state
    score = 0;
    lives = 3;
    timer = 60;
    multiplier = 1;
    gameActive = true;
    showMessage('');
    updateStatusBar();
    gameArea.innerHTML = '';

    // Start timer
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!gameActive) return;
        timer--;
        updateStatusBar();
        if (timer <= 0) {
            endGame("Time's up!");
        }
    }, 1000);

    // Start spawning items
    spawnItems();

    // Place status bars correctly
    placeStatusBars();
}

// Function to update lives, timer, and score
function updateStatusBar() {
    // Show water drops for lives using image
    livesDiv.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        const drop = document.createElement('span');
        drop.className = 'life-drop';
        livesDiv.appendChild(drop);
    }
    pointsDiv.textContent = `Points: ${score}`;
    timerDiv.textContent = `Time: ${timer}s`;
}

// Function to show/hide message area
function showMessage(msg) {
    messageArea.textContent = msg || '';
    messageArea.style.display = 'block';
}

// Function to spawn items in the game area
function spawnItems() {
    if (gameInterval) clearInterval(gameInterval);
    const gameArea = document.getElementById('game-area');
    gameInterval = setInterval(() => {
        if (!gameActive) return;
        const rand = Math.random();
        if (rand < 0.7) spawnWaterDrop();
        else if (rand < 0.95) spawnPollutant();
        else spawnJerryCan();
    }, 800);
}

// Function to spawn a water drop
function spawnWaterDrop() {
    const gameArea = document.getElementById('game-area');
    // Define drop types: [size multiplier, min ms, max ms, points]
    const types = [
        {mult: 1, min: 750, max: 1250, points: 5},    // Small
        {mult: 1.5, min: 1000, max: 2000, points: 3}, // Medium
        {mult: 2, min: 1500, max: 3000, points: 1}    // Large
    ];
    const baseSize = 32;
    const idx = Math.floor(Math.random() * 3);
    const t = types[idx];
    const size = baseSize * t.mult;
    const drop = document.createElement('div');
    drop.className = 'item water-drop';
    drop.style.width = `${size}px`;
    drop.style.height = `${size}px`;
    drop.style.left = `${Math.random() * (gameArea.offsetWidth - size)}px`;
    drop.style.top = `${Math.random() * (gameArea.offsetHeight - size)}px`;
    drop.title = `Water Drop (+${t.points} pts)`;
    drop.addEventListener('click', () => {
        if (!gameActive) return;
        score += t.points * multiplier;
        drop.remove();
        updateStatusBar();
    });
    gameArea.appendChild(drop);
    setTimeout(() => { if (gameArea.contains(drop)) drop.remove(); }, t.min + Math.random() * (t.max - t.min));
}

// Function to spawn a pollutant
function spawnPollutant() {
    const gameArea = document.getElementById('game-area');
    const sizes = [32, 32 * 1.5, 32 * 2];
    const idx = Math.floor(Math.random() * 3);
    const size = sizes[idx];
    const pollutant = document.createElement('div');
    pollutant.className = 'item pollutant';
    pollutant.style.width = `${size}px`;
    pollutant.style.height = `${size}px`;
    pollutant.style.left = `${Math.random() * (gameArea.offsetWidth - size)}px`;
    pollutant.style.top = `${Math.random() * (gameArea.offsetHeight - size)}px`;
    pollutant.title = 'Pollutant (Lose 1 life)';
    pollutant.addEventListener('click', () => {
        if (!gameActive) return;
        lives--;
        showMessage('Ouch! -1 life.');
        pollutant.remove();
        updateStatusBar();
        // Remove multiplier if active
        multiplier = 1;
        if (multiplierTimeout) clearTimeout(multiplierTimeout);
        // Remove multiplier message after 2s
        setTimeout(() => { showMessage(''); }, 2000);
        if (lives <= 0) endGame('You lost all your lives!');
    });
    gameArea.appendChild(pollutant);
    setTimeout(() => { if (gameArea.contains(pollutant)) pollutant.remove(); }, 2000);
}

// Function to spawn a Jerry Can
function spawnJerryCan() {
    const gameArea = document.getElementById('game-area');
    const size = 32 * 2; // Twice as big as before
    const can = document.createElement('div');
    can.className = 'item jerry-can';
    can.style.width = `${size}px`;
    can.style.height = `${size}px`;
    can.style.left = `${Math.random() * (gameArea.offsetWidth - size)}px`;
    can.style.top = `${Math.random() * (gameArea.offsetHeight - size)}px`;
    can.title = 'Jerry Can (Score Multiplier!)';
    can.addEventListener('click', () => {
        if (!gameActive) return;
        multiplier = 3;
        showMessage('x3 Multiplier!');
        can.remove();
        // Reset multiplier timer to 7s
        if (multiplierTimeout) clearTimeout(multiplierTimeout);
        multiplierTimeout = setTimeout(() => {
            multiplier = 1;
            showMessage('');
        }, 7000);
    });
    gameArea.appendChild(can);
    setTimeout(() => { if (gameArea.contains(can)) can.remove(); }, 1000);
}

// Function to end the game
function endGame(reason) {
    gameActive = false;
    clearInterval(timerInterval);
    clearInterval(gameInterval);
    if (multiplierTimeout) clearTimeout(multiplierTimeout);
    showGameOver();
    showMessage(reason);
    // If the user scored 50 or more, rain down water drops!
    if (score >= 50) {
        rainWaterDrops();
    }
    // Place status bars correctly
    placeStatusBars();
}

// Function to rain down water drop images from the top of the screen
function rainWaterDrops() {
    // Number of drops to create
    const dropCount = 60;
    // Loop to create each drop
    for (let i = 0; i < dropCount; i++) {
        // Create an img element for the water drop
        const drop = document.createElement('img');
        drop.src = 'img/Gamer Water Drop.png';
        drop.alt = 'Water Drop';
        drop.className = 'rain-drop';
        // Random horizontal position (0% to 95% of the screen width)
        drop.style.left = `${Math.random() * 95}%`;
        // Random delay so drops don't all fall at once
        drop.style.animationDelay = `${Math.random() * 1.5}s`;
        // Add the drop to the body so it appears above everything
        document.body.appendChild(drop);
        // Remove the drop after the animation ends (2.5s)
        setTimeout(() => {
            drop.remove();
        }, 2500);
    }
}

// Overlays for intro and game over
function showIntro() {
    gameArea.innerHTML = `<div class="overlay">
        <h2>Welcome to Water Quest!</h2>
        <p>Click water drops to earn points. Avoid pollutants! Click Jerry Cans for bonus multipliers. Can you get the highest score before time runs out or you lose all your lives?</p>
        <button id="start-btn">Start Game</button>
    </div>`;
    document.getElementById('start-btn').onclick = startGame;
}

function showGameOver() {
    gameArea.innerHTML = `<div class="overlay">
        <h2>Game Over!</h2>
        <p>Your score: ${score}</p>
        <button id="restart-btn">Play Again</button>
    </div>`;
    document.getElementById('restart-btn').onclick = startGame;
}

// Utility to get or create a container
function getOrCreate(id, tag = 'div') {
    let el = document.getElementById(id);
    if (!el) {
        el = document.createElement(tag);
        el.id = id;
    }
    return el;
}

// Helper: Move status elements to correct bar based on screen size
function placeStatusBars() {
    const isDesktop = window.innerWidth >= 800;
    // Always use the original elements
    const logo = getOrCreate('logo');
    const logoArea = getOrCreate('logo-area');
    const livesDiv = getOrCreate('lives');
    const pointsDiv = getOrCreate('points');
    const timerDiv = getOrCreate('timer');
    const messageArea = getOrCreate('message-area');
    const topBar = getOrCreate('top-bar');
    const bottomBar = getOrCreate('bottom-bar');

    // Clean up containers
    topBar.innerHTML = '';
    bottomBar.innerHTML = '';
    logoArea.innerHTML = '';
    logoArea.appendChild(logo);

    if (isDesktop) {
        // Desktop: logo left, lives center, points/timer row with message below (all in top-bar)
        const center = getOrCreate('lives-area');
        center.innerHTML = '';
        center.appendChild(livesDiv);
        const right = getOrCreate('status-area');
        right.innerHTML = '';
        // Row for points and timer
        const row = document.createElement('div');
        row.className = 'points-timer-row';
        row.appendChild(pointsDiv);
        row.appendChild(timerDiv);
        right.appendChild(row);
        right.appendChild(messageArea);
        topBar.appendChild(logoArea);
        topBar.appendChild(center);
        topBar.appendChild(right);
        bottomBar.style.display = 'none';
    } else {
        // Mobile: only logo and message in top bar, points/lives/timer in bottom bar
        topBar.appendChild(logoArea);
        topBar.appendChild(messageArea);
        bottomBar.appendChild(pointsDiv);
        bottomBar.appendChild(livesDiv);
        bottomBar.appendChild(timerDiv);
        bottomBar.style.display = 'flex';
    }
}

window.addEventListener('resize', placeStatusBars);
document.addEventListener('DOMContentLoaded', placeStatusBars);
// Also call after game starts/ends to ensure correct placement
