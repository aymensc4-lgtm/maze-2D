const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Configuration (let pour pouvoir les modifier entre les niveaux)
let ROWS = 21;
let COLS = 21;
let TILE_SIZE;

// 🧩 Génération aléatoire du labyrinthe
function genererLabyrintheAleatoire(lignes, colonnes) {
    const labyrinthe = Array.from({ length: lignes }, () =>
        Array.from({ length: colonnes }, () => 1)
    );

    function creuser(x, y) {
        const directions = [
            [0, -2], [0, 2], [-2, 0], [2, 0]
        ].sort(() => Math.random() - 0.5);

        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (ny > 0 && ny < lignes - 1 && nx > 0 && nx < colonnes - 1 && labyrinthe[ny][nx] === 1) {
                labyrinthe[ny - dy / 2][nx - dx / 2] = 0;
                labyrinthe[ny][nx] = 0;
                creuser(nx, ny);
            }
        }
    }

    labyrinthe[1][1] = 0;
    creuser(1, 1);

    labyrinthe[lignes - 2][colonnes - 2] = 2;

    return labyrinthe;
}

// ⚙️ Crée le labyrinthe initial
let maze = genererLabyrintheAleatoire(ROWS, COLS);

// Position du joueur
let player = { x: 1, y: 1 };

// Niveau actuel
let level = 1;
document.getElementById("level-display").innerText = "Niveau " + level;

function resizeCanvas() {
    const wrapper = document.getElementById('game-wrapper');
    const availableWidth = wrapper.clientWidth - 20;
    const availableHeight = wrapper.clientHeight - 20;

    const tileByWidth = Math.floor(availableWidth / COLS);
    const tileByHeight = Math.floor(availableHeight / ROWS);

    TILE_SIZE = Math.min(tileByWidth, tileByHeight, 30);

    canvas.width = COLS * TILE_SIZE;
    canvas.height = ROWS * TILE_SIZE;
}

function drawMaze() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            let cell = maze[y][x];
            let px = x * TILE_SIZE;
            let py = y * TILE_SIZE;

            if (cell === 1) {
                // mur
                ctx.fillStyle = "#2c3e50";
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = "#1a252f";
                ctx.lineWidth = 1;
                ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
            } else if (cell === 2) {
                // sortie
                ctx.fillStyle = "#ffd700";
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = "#ffed4e";
                ctx.fillRect(px + 2, py + 2, Math.max(TILE_SIZE - 4, 0), Math.max(TILE_SIZE - 4, 0));
            } else {
                // chemin
                ctx.fillStyle = "#ecf0f1";
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    // Dessiner le joueur
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

    // Contour du joueur
    ctx.strokeStyle = "#c0392b";
    ctx.lineWidth = 2;
    ctx.stroke();
}

function move(dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;

    if (newY < 0 || newY >= ROWS || newX < 0 || newX >= COLS) return;

    const target = maze[newY][newX];
    if (target === 1) return;

    // Si atteint la sortie
    if (target === 2) {
        player.x = newX;
        player.y = newY;
        drawMaze();
        // Petit délai pour voir le joueur sur la sortie puis changer de niveau
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

// Contrôles clavier
window.addEventListener("keydown", (e) => {
    e.preventDefault();
    if (e.key === "ArrowUp") move(0, -1);
    if (e.key === "ArrowDown") move(0, 1);
    if (e.key === "ArrowLeft") move(-1, 0);
    if (e.key === "ArrowRight") move(1, 0);
});

// Boutons tactiles (assure-toi que les éléments existent)
document.getElementById("up").addEventListener("click", () => move(0, -1));
document.getElementById("left").addEventListener("click", () => move(-1, 0));
document.getElementById("down").addEventListener("click", () => move(0, 1));
document.getElementById("right").addEventListener("click", () => move(1, 0));

// Empêcher le zoom sur double-tap
let lastTap = 0;
document.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 500 && tapLength > 0) {
        e.preventDefault();
    }
    lastTap = currentTime;
});

// Redimensionner et dessiner
window.addEventListener('resize', () => {
    resizeCanvas();
    drawMaze();
});
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        resizeCanvas();
        drawMaze();
    }, 100);
});

// Initialise l'affichage
resizeCanvas();
drawMaze();

function setLevel() {
    level++;
    console.log("Niveau :", level);

    // Pour augmenter la difficulté on agrandit le labyrinthe de 2 lignes/colonnes par niveau
    // On peut limiter la taille maximale pour éviter d'avoir un labyrinthe trop grand
    const MAX_SIZE = 51;
    if (ROWS + 2 <= MAX_SIZE && COLS + 2 <= MAX_SIZE) {
        ROWS += 2;
        COLS += 2;
    }

    // Recrée un nouveau labyrinthe avec les nouvelles dimensions
    maze = genererLabyrintheAleatoire(ROWS, COLS);

    // Replace le joueur au départ
    player = { x: 1, y: 1 };

    // Redimensionne le canvas en fonction des nouvelles dimensions
    resizeCanvas();

    // Redessine le labyrinthe et le joueur
    drawMaze();

    // Mets à jour le texte du niveau à l’écran
    const lvlEl = document.getElementById("level-display");
    if (lvlEl) lvlEl.innerText = "Niveau " + level;
}
//  MINUTEUR COMPTE À REBOURS ---
let tempsRestant = 120; 
let interval = null;
let jeuActif = true; // pour bloquer les mouvements quand fini

const timerElement = document.getElementById("timer");

// Démarre le minuteur une seule fois
function demarrerMinuteur() {
    if (interval) return; // déjà lancé

    interval = setInterval(() => {
        tempsRestant--;
        timerElement.textContent = `⏱️ ${tempsRestant}s`;

        if (tempsRestant <= 0) {
            clearInterval(interval);
            interval = null;
            jeuActif = false; // bloque le joueur
            timerElement.textContent = "⏰ Temps écoulé !";
            alert("⏰ Temps écoulé ! Partie terminée.");
        }
    }, 1000);
}

// Réinitialise le minuteur à chaque niveau
function resetMinuteur() {
    clearInterval(interval);
    interval = null;
    tempsRestant = 120;
    jeuActif = true;
    timerElement.textContent = `⏱️ ${tempsRestant}s`;
}
