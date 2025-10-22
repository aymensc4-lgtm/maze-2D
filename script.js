const canvas = document.getElementById("game");
        const ctx = canvas.getContext("2d");

        // Configuration
        const ROWS = 21;
        const COLS = 21;
        let TILE_SIZE;

        // Labyrinthe (1 = mur, 0 = chemin, 2 = sortie)
        const maze = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [0,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,1],
            [1,1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1],
            [1,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,1,0,1],
            [1,0,1,1,1,1,0,1,0,1,1,1,1,1,0,1,1,0,1,0,1],
            [1,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1],
            [1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,0,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,1],
            [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,0,1],
            [1,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
            [1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1],
            [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
            [1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,0,1],
            [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,1],
            [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],
            [1,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
            [1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,2],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];

        let player = { x: 0, y: 1 };

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
                        ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
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

            if (target === 2) {
                player.x = newX;
                player.y = newY;
                drawMaze();
                setTimeout(() => {
                    alert("🎉 FÉLICITATIONS ! Tu as réussi ce labyrinthe !");
                }, 100);
                return;
            }

            player.x = newX;
            player.y = newY;
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

        // Boutons tactiles
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

        resizeCanvas();
        drawMaze();