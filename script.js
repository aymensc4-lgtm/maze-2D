const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Configuration du labyrinthe
let ROWS = 21;
let COLS = 21;
let TILE_SIZE;

// Position du joueur
let player = { x: 1, y: 1 };

// Niveau actuel
let level = 1;
const levelElement = document.getElementById("level-display");
const timerElement = document.getElementById("timer");
levelElement.textContent = "Niveau " + level;

// ---------- GÉNÉRATION LABYRINTHE ----------

function genererLabyrintheAleatoire(lignes, colonnes) {
    const labyrinthe = Array.from({ length: lignes }, () =>
        Array.from({ length: colonnes }, () => 1)
    );

    function creuser(x, y) {
        const directions = [
            [0, -2],
            [0, 2],
            [-2, 0],
            [2, 0],
        ].sort(() => Math.random() - 0.5);

        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (
                ny > 0 &&
                ny < lignes - 1 &&
                nx > 0 &&
                nx < colonnes - 1 &&
                labyrinthe[ny][nx] === 1
            ) {
                labyrinthe[ny - dy / 2][nx - dx / 2] = 0;
                labyrinthe[ny][nx] = 0;
                creuser(nx, ny);
            }
        }
    }

    labyrinthe[1][1] = 0;
    creuser(1, 1);

    // Sortie
    labyrinthe[lignes - 2][colonnes - 2] = 2;

    return labyrinthe;
}

// Labyrinthe initial
let maze = genererLabyrintheAleatoire(ROWS, COLS);

// ---------- CANVAS + AFFICHAGE ----------

function resizeCanvas() {
    const wrapper = document.getElementById("game-wrapper");
    const availableWidth = wrapper.clientWidth - 20;
    const availableHeight = wrapper.clientHeight - 20;

    const tileByWidth = Math.floor(availableWidth / COLS);
    const tileByHeight = Math.floor(availableHeight / ROWS);

    TILE_SIZE = Math.min(tileByWidth, tileByHeight, 30);

    canvas.width = COLS * TILE_SIZE;
    canvas.height = ROWS * TILE_SIZE;
}

function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const cell = maze[y][x];
            const px = x * TILE_SIZE;
            const py = y * TILE_SIZE;

            if (cell === 1) {
                // Mur
                ctx.fillStyle = "#2c3e50";
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = "#1a252f";
                ctx.lineWidth = 1;
                ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
            } else if (cell === 2) {
                // Sortie
                ctx.fillStyle = "#ffd700";
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = "#ffed4e";
                ctx.fillRect(
                    px + 2,
                    py + 2,
                    Math.max(TILE_SIZE - 4, 0),
                    Math.max(TILE_SIZE - 4, 0)
                );
            } else {
                // Chemin
                ctx.fillStyle = "#ecf0f1";
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    // Joueur
    ctx.fillStyle = "#e74c3c";
    ctx.beginPath();
    ctx.arc(
        player.x * TILE_SIZE + TILE_SIZE / 2,
        player.y * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE / 2.5,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Contour joueur
    ctx.strokeStyle = "#c0392b";
    ctx.lineWidth = 2;
    ctx.stroke();
}

// ---------- TIMER / MINUTEUR ----------

let tempsRestant = 120;
let interval = null;
let jeuActif = true;

function demarrerMinuteur() {
    if (interval) return; // déjà lancé

    interval = setInterval(() => {
        tempsRestant--;
        timerElement.textContent = `⏱️ ${tempsRestant}s`;

        if (tempsRestant <= 0) {
            clearInterval(interval);
            interval = null;
            jeuActif = false;
            timerElement.textContent = "⏰ Temps écoulé !";
            alert("⏰ Temps écoulé ! Partie terminée.");
        }
    }, 1000);
}

function resetMinuteur() {
    clearInterval(interval);
    interval = null;
    tempsRestant = 120;
    jeuActif = true;
    timerElement.textContent = `⏱️ ${tempsRestant}s`;
}

// ---------- DÉPLACEMENT ----------

function move(dx, dy) {
    if (!jeuActif) return;

    const newX = player.x + dx;
    const newY = player.y + dy;

    if (newY < 0 || newY >= ROWS || newX < 0 || newX >= COLS) return;

    const target = maze[newY][newX];
    if (target === 1) return; // mur

    // Sortie
    if (target === 2) {
        player.x = newX;
        player.y = newY;
        drawMaze();
        setTimeout(() => {
            setLevel();
        }, 120);
        return;
    }

    player.x = newX;
    player.y = newY;
    demarrerMinuteur();
    drawMaze();
}

// ---------- NIVEAUX ----------

function setLevel() {
    level++;
    levelElement.textContent = "Niveau " + level;

    // Reset minuteur à chaque niveau
    resetMinuteur();

    // Augmenter la taille du labyrinthe
    const MAX_SIZE = 51;
    if (ROWS + 2 <= MAX_SIZE && COLS + 2 <= MAX_SIZE) {
        ROWS += 2;
        COLS += 2;
    }

    maze = genererLabyrintheAleatoire(ROWS, COLS);
    player = { x: 1, y: 1 };

    resizeCanvas();
    drawMaze();
}

// ---------- CONTRÔLES ----------

// Clavier (PC)
window.addEventListener("keydown", (e) => {
    if (!jeuActif) return;

    let handled = false;

    switch (e.key) {
        case "ArrowUp":
            move(0, -1);
            handled = true;
            break;
        case "ArrowDown":
            move(0, 1);
            handled = true;
            break;
        case "ArrowLeft":
            move(-1, 0);
            handled = true;
            break;
        case "ArrowRight":
            move(1, 0);
            handled = true;
            break;
    }

    if (handled) {
        e.preventDefault();
    }
});

// Boutons (PC + mobile)
function bindControl(id, dx, dy) {
    const btn = document.getElementById(id);
    if (!btn) return;

    // Souris (PC)
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        move(dx, dy);
    });

    // Tactile (mobile) – plus réactif
    btn.addEventListener(
        "touchstart",
        (e) => {
            e.preventDefault();
            move(dx, dy);
        },
        { passive: false }
    );
}

bindControl("up", 0, -1);
bindControl("down", 0, 1);
bindControl("left", -1, 0);
bindControl("right", 1, 0);

// ---------- REDIMENSIONNEMENT ----------

window.addEventListener("resize", () => {
    resizeCanvas();
    drawMaze();
});

window.addEventListener("orientationchange", () => {
    setTimeout(() => {
        resizeCanvas();
        drawMaze();
    }, 100);
});

// ---------- INITIALISATION ----------

resetMinuteur();
resizeCanvas();
drawMaze();
