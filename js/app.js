/**
 * SKY HUNTER - Vanilla JS Implementation
 * 
 * Konzept:
 * - State Management: Punkte, Leben, Spielstatus
 * - Game Loop: requestAnimationFrame aktualisiert Canvas 60x pro Sekunde
 * - Event Listener: Klicks auf Canvas prüfen Kollisionen mit Vögeln
 */

// --- KONFIGURATION & STATE ---
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Einstellungen
const BIRD_MIN_SIZE = 120;
const BIRD_MAX_EXTRA = 80;
const START_SPEED = 1.5;
const MAX_BIRDS = 8;
const GRAVITY = 0.15;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Game State
let gameState = 'MENU'; // MENU, PLAYING, GAMEOVER
let score = 0;
let highScore = 0;
let lives = 5;
let animationId = 0;
let gameStartTime = 0;

// Entities
let birds = [];
let particles = [];

// DOM Elemente
const elScore = document.getElementById('score-display');
const elHighScore = document.getElementById('highscore-display');
const elLives = document.getElementById('lives-container');
const elFinalScore = document.getElementById('final-score');
const screenMenu = document.getElementById('screen-menu');
const screenGameOver = document.getElementById('screen-gameover');

// Bilder
const bgImg = new Image();
bgImg.src = 'img/berg.jpg';

const birdImg = new Image();
birdImg.src = 'img/bird.gif';

// --- HILFSFUNKTIONEN ---
// UI aktualisieren
function updateUI() {
    elScore.innerText = score;
    elHighScore.innerText = highScore;

    elLives.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const span = document.createElement('span');
        span.classList.add('heart-base');
        if (i < lives) {
            span.classList.add(lives === 1 ? 'heart-red' : 'heart-white');
        } else {
            span.classList.add('heart-dead');
        }
        span.innerText = '❤';
        elLives.appendChild(span);
    }
}

// neuen Vogel erzeugen
function spawnBird() {
    const elapsedSeconds = (Date.now() - gameStartTime) / 1000;
    const difficultyLevel = Math.floor(elapsedSeconds / 30);

    const size = BIRD_MIN_SIZE + Math.random() * BIRD_MAX_EXTRA;
    const baseSpeed = START_SPEED + difficultyLevel * 0.5;

    birds.push({
        x: -size,
        y: Math.random() * (CANVAS_HEIGHT - size),
        width: size,
        height: size * 0.75,
        speedX: baseSpeed + Math.random() * 1.5,
        speedY: (Math.random() - 0.5) * 1.5,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
    });
}

// Explosion Partikel erzeugen
function createExplosion(x, y, color) {
    for (let i = 0; i < 12; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1.0,
            color,
            size: Math.random() * 4 + 2
        });
    }
}

// --- GAME LOOP ---
function update() {
    if (gameState !== 'PLAYING') return;

    // Vögel spawnen
    if (birds.length < MAX_BIRDS && Math.random() < 0.02) spawnBird();

    // Vögel bewegen
    for (let i = birds.length - 1; i >= 0; i--) {
        const bird = birds[i];
        bird.x += bird.speedX;
        bird.y += bird.speedY;

        if (bird.y < 0 || bird.y > CANVAS_HEIGHT - bird.height) bird.speedY *= -1;

        if (bird.x > CANVAS_WIDTH) {
            birds.splice(i, 1);
            lives--;
            updateUI();
            if (lives <= 0) gameOver();
        }
    }

    // Partikel bewegen
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += GRAVITY;
        p.life -= 0.02;

        if (p.life <= 0) particles.splice(i, 1);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Hintergrund
    if (bgImg.complete) {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Vögel zeichnen
    birds.forEach(bird => {
        if (birdImg.complete) ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
        else {
            ctx.fillStyle = 'red';
            ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
        }
    });

    // Partikel zeichnen
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalAlpha = 1.0;
    });
}

function loop() {
    update();
    draw();
    animationId = requestAnimationFrame(loop);
}

// --- INPUT / KLICK EVENTS ---
canvas.addEventListener('mousedown', e => {
    if (gameState !== 'PLAYING') return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    for (let i = birds.length - 1; i >= 0; i--) {
        const b = birds[i];
        if (clickX >= b.x && clickX <= b.x + b.width &&
            clickY >= b.y && clickY <= b.y + b.height) {
            createExplosion(clickX, clickY, b.color);
            birds.splice(i, 1);
            score += 10;
            updateUI();
            break;
        }
    }
});

// --- SPIEL LOGIK ---
function startGame() {
    score = 0;
    lives = 5;
    birds = [];
    particles = [];
    gameState = 'PLAYING';
    gameStartTime = Date.now();
    updateUI();
    screenMenu.classList.add('hidden');
    screenGameOver.classList.add('hidden');
    cancelAnimationFrame(animationId);
    loop();
}

function gameOver() {
    gameState = 'GAMEOVER';
    if (score > highScore) highScore = score;
    elFinalScore.innerText = score;
    updateUI();
    screenGameOver.classList.remove('hidden');
}

function showMenu() {
    gameState = 'MENU';
    screenGameOver.classList.add('hidden');
    screenMenu.classList.remove('hidden');
    draw(); // einmalig zeichnen
}

// --- BUTTON EVENTS ---
document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-restart').addEventListener('click', startGame);
document.getElementById('btn-menu').addEventListener('click', showMenu);

// --- INIT ---
bgImg.onload = () => { if (gameState === 'MENU') draw(); };
showMenu();
loop();
