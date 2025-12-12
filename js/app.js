/**
 * SKY HUNTER - Vanilla JS Implementation
 * 
 * Konzept:
 * 1. State Management: Variablen speichern Punkte, Leben, Spielstatus.
 * 2. Game Loop: requestAnimationFrame aktualisiert Canvas 60x pro Sekunde.
 * 3. Event Listener: Klicks auf Canvas prüfen Kollisionen mit Vögeln.
 */

// --- KONFIGURATION & STATE ---
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// ==========================================
// === EINSTELLUNGEN (HIER GRÖSSE ÄNDERN) ===
// ==========================================
const BIRD_MIN_SIZE = 120;  // NOCH GRÖSSER (Vorher 100)
const BIRD_MAX_EXTRA = 80;  // ZUSATZGRÖSSE (Vorher 60) -> Vögel sind jetzt riesig
const START_SPEED = 1.5;    // Startgeschwindigkeit (1.5 = Langsam).
// ==========================================

// BILDER LADEN
const bgImg = new Image();
bgImg.src = 'img/berg.jpg';

const birdImg = new Image();
birdImg.src = 'img/bird.gif';

// Game State
let gameState = 'MENU'; // MENU, PLAYING, GAMEOVER
let score = 0;
let highScore = 0;
let lives = 5;
let animationId = 0;
let gameStartTime = 0; // Speichert den Startzeitpunkt

// Entities
let birds = [];
let particles = [];

// Konstanten
const MAX_BIRDS = 8;
const GRAVITY = 0.15;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// DOM Elemente cachen (Performance)
const elScore = document.getElementById('score-display');
const elHighScore = document.getElementById('highscore-display');
const elLives = document.getElementById('lives-container');
const elFinalScore = document.getElementById('final-score');
const screenMenu = document.getElementById('screen-menu');
const screenGameOver = document.getElementById('screen-gameover');

// --- HILFSFUNKTIONEN ---

// Aktualisiert die HTML Anzeige (DOM Manipulation)
function updateUI() {
    elScore.innerText = score;
    elHighScore.innerText = highScore;
    
    // Leben als Herzen rendern mit CSS Klassen
    let hearts = '';
    for(let i=0; i<5; i++) {
        if (i < lives) {
            // Lebendiges Herz
            if (lives === 1) {
                // Nur noch 1 Leben übrig: ROT (.heart-red)
                hearts += '<span class="heart-base heart-red">❤</span>';
            } else {
                // Mehr als 1 Leben: WEISS (.heart-white)
                hearts += '<span class="heart-base heart-white">❤</span>';
            }
        } else {
            // Verlorenes Leben: DUNKELGRAU (.heart-dead)
            hearts += '<span class="heart-base heart-dead">❤</span>'; 
        }
    }
    elLives.innerHTML = hearts;
}

// Erzeugt einen neuen Vogel
function spawnBird() {
    // ZEIT-BASIERTE SCHWIERIGKEIT
    // Berechne, wie viele Sekunden seit Spielstart vergangen sind
    const elapsedSeconds = (Date.now() - gameStartTime) / 1000;
    
    // Alle 30 Sekunden erhöht sich das Level (0, 1, 2, ...)
    const difficultyLevel = Math.floor(elapsedSeconds / 30);

    // --- GRÖSSE ---
    // Wir nutzen die Variablen von ganz oben, damit du sie leicht ändern kannst
    const size = BIRD_MIN_SIZE + Math.random() * BIRD_MAX_EXTRA; 
    
    // --- GESCHWINDIGKEIT ---
    // Startet langsam (START_SPEED) und wird alle 30 Sekunden um 0.5 schneller.
    const baseSpeed = START_SPEED + (difficultyLevel * 0.5); 

    const bird = {
        x: -size, // Startet links außerhalb des Bildschirms
        y: Math.random() * (CANVAS_HEIGHT - size), // Zufällige Höhe (minus Größe, damit er im Bild bleibt)
        width: size,
        height: size * 0.75, // Proportionales Verhältnis (4:3)
        speedX: baseSpeed + Math.random() * 1.5, // Basis-Speed + kleiner Zufallsfaktor
        speedY: (Math.random() - 0.5) * 1.5, // Leichtes Schwanken hoch/runter
        color: `hsl(${Math.random() * 360}, 70%, 50%)` // Farbe für Explosion
    };
    birds.push(bird);
}

// Erzeugt Partikel (Explosion)
function createExplosion(x, y, color) {
    for (let i = 0; i < 12; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1.0,
            color: color,
            size: Math.random() * 4 + 2
        });
    }
}

// --- GAME LOOP (UPDATE & DRAW) ---

function update() {
    if (gameState !== 'PLAYING') return;

    // 1. Vögel Spawnen (Zufällig)
    if (birds.length < MAX_BIRDS && Math.random() < 0.02) {
        spawnBird();
    }

    // 2. Vögel Bewegen & Prüfen
    // Wir iterieren rückwärts, damit wir Elemente sicher entfernen können ohne den Index zu kaputtzumachen
    for (let i = birds.length - 1; i >= 0; i--) {
        let bird = birds[i];
        
        bird.x += bird.speedX;
        bird.y += bird.speedY;
        
        // Abprallen an oben/unten
        if (bird.y < 0 || bird.y > CANVAS_HEIGHT - bird.height) {
            bird.speedY *= -1;
        }

        // PRÜFUNG: Ist der Vogel entkommen? (Rechter Rand)
        if (bird.x > CANVAS_WIDTH) {
            birds.splice(i, 1); // Vogel aus dem Array entfernen
            
            lives--; // Ein Leben abziehen
            updateUI(); // UI sofort aktualisieren (Herz wird leer)

            if (lives <= 0) {
                gameOver();
            }
        }
    }

    // 3. Partikel Update
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += GRAVITY;
        p.life -= 0.02;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function draw() {
    // Screen clearen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Hintergrund Bild zeichnen
    if (bgImg.complete) {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 2. Vögel zeichnen
    birds.forEach(bird => {
        if (birdImg.complete) {
            ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
        } else {
            // Fallback (Rotes Rechteck), falls Bild noch lädt
            ctx.fillStyle = 'red';
            ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
        }
    });

    // 3. Partikel zeichnen
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

// --- EINGABE & STEUERUNG ---

canvas.addEventListener('mousedown', (e) => {
    if (gameState !== 'PLAYING') return;

    // Mausposition berechnen (relativ zum Canvas und Skalierung)
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Treffererkennung (Rückwärts, um obere Vögel zuerst zu treffen)
    let hit = false;
    for (let i = birds.length - 1; i >= 0; i--) {
        const b = birds[i];
        
        // Einfache Rechteck-Kollision (Hitbox)
        if (clickX >= b.x && clickX <= b.x + b.width &&
            clickY >= b.y && clickY <= b.y + b.height) {
            
            // TREFFER!
            createExplosion(clickX, clickY, b.color);
            birds.splice(i, 1); // Vogel entfernen
            score += 10; // Punkte geben
            updateUI();
            hit = true;
            break; // Nur einen Vogel pro Klick
        }
    }
});

// --- SPIEL STEUERUNG (START / ENDE) ---

function startGame() {
    score = 0;
    lives = 5;
    birds = [];
    particles = [];
    gameState = 'PLAYING';
    
    // Startzeit setzen für die Schwierigkeitsberechnung
    gameStartTime = Date.now();
    
    updateUI();
    
    // UI Screens umschalten
    screenMenu.classList.add('hidden');
    screenGameOver.classList.add('hidden');
    
    // Loop starten
    cancelAnimationFrame(animationId);
    loop();
}

function gameOver() {
    gameState = 'GAMEOVER';
    
    if (score > highScore) {
        highScore = score;
    }
    
    elFinalScore.innerText = score;
    updateUI();
    
    screenGameOver.classList.remove('hidden');
}

function showMenu() {
    gameState = 'MENU';
    screenGameOver.classList.add('hidden');
    screenMenu.classList.remove('hidden');
    
    // Einmal zeichnen, damit der Hintergrund im Menü sichtbar ist
    draw();
}

// Buttons Event Listeners
document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-restart').addEventListener('click', startGame);
document.getElementById('btn-menu').addEventListener('click', showMenu);

// Initial Start
bgImg.onload = () => {
    if (gameState === 'MENU') draw();
};
showMenu();
loop();