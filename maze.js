document.addEventListener('DOMContentLoaded', function () {
    const mazeElement = document.getElementById('maze');
    const playerElement = document.getElementById('player');
    const generateButton = document.getElementById('generate');
    const solveBFSButton = document.getElementById('solve-bfs');
    const solveDFSButton = document.getElementById('solve-dfs');
    const playButton = document.getElementById('play');
    const resetButton = document.getElementById('reset');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const algorithmSelect = document.getElementById('algorithm');
    const statsElement = document.getElementById('stats');

    let maze = [];
    let width = 0;
    let height = 0;
    let cellSize = 20;
    let start = { x: 0, y: 0 };
    let end = { x: 0, y: 0 };
    let isPlaying = false;
    let playerPosition = { x: 0, y: 0 };
    let solving = false;

   function initMaze(w, h) {
    width = w;
    height = h;
    maze = [];
    for (let y = 0; y < height; y++) {
        maze[y] = [];
        for (let x = 0; x < width; x++) {
            maze[y][x] = {
                wall: true,
                visited: false,
                solution: false
            };
        }
    }
}
function renderMaze() {
    mazeElement.innerHTML = '';
    mazeElement.style.width = `${width * cellSize}px`;
    mazeElement.style.height = `${height * cellSize}px`;
    mazeElement.style.gridTemplateColumns = `repeat(${width}, ${cellSize}px)`;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;

            if (maze[y][x].wall) {
                cell.classList.add('wall');
            } else {
                cell.classList.add('path');
                if (x === start.x && y === start.y) {
                    cell.classList.add('start');
                } else if (x === end.x && y === end.y) {
                    cell.classList.add('end');
                } else if (maze[y][x].solution) {
                    cell.classList.add('solution');
                } else if (maze[y][x].visited) {
                    cell.classList.add('visited');
                }
            }

            mazeElement.appendChild(cell);
        }
    }

    if (isPlaying) {
        playerElement.style.display = 'block';
        updatePlayerPosition();
    } else {
        playerElement.style.display = 'none';
    }
}


    async function generateMazeRecursiveBacktracking(w, h) {
    initMaze(w, h);
        start = { x: 1, y: 1 };
        end = { x: width - 2, y: height - 2 };

        async function carve(x, y) {
            maze[y][x].wall = false;
            const directions = [
                { dx: 1, dy: 0 },
                { dx: -1, dy: 0 },
                { dx: 0, dy: 1 },
                { dx: 0, dy: -1 }
            ].sort(() => Math.random() - 0.5);

            for (const dir of directions) {
                const nx = x + dir.dx * 2;
                const ny = y + dir.dy * 2;

                if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && maze[ny][nx].wall) {
                    maze[y + dir.dy][x + dir.dx].wall = false;
                    await new Promise(resolve => setTimeout(resolve, 10));
                    renderMaze();
                    await carve(nx, ny);
                }
            }
        }

        await carve(start.x, start.y);
        maze[end.y][end.x].wall = false;
        renderMaze();
    }

    async function generateMazePrim(w, h) {
    initMaze(w, h);
        start = { x: 1, y: 1 };
        end = { x: width - 2, y: height - 2 };

        let walls = [];

        maze[start.y][start.x].wall = false;

        function addWalls(x, y) {
            const directions = [
                { dx: 1, dy: 0 },
                { dx: -1, dy: 0 },
                { dx: 0, dy: 1 },
                { dx: 0, dy: -1 }
            ];

            for (const dir of directions) {
                const nx = x + dir.dx;
                const ny = y + dir.dy;

                if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && maze[ny][nx].wall) {
                    walls.push({ x: nx, y: ny });
                }
            }
        }

        addWalls(start.x, start.y);

        while (walls.length > 0) {
            const randomIndex = Math.floor(Math.random() * walls.length);
            const wall = walls[randomIndex];
            walls.splice(randomIndex, 1);

            const directions = [
                { dx: 1, dy: 0 },
                { dx: -1, dy: 0 },
                { dx: 0, dy: 1 },
                { dx: 0, dy: -1 }
            ];

            let connectedCells = 0;
            for (const dir of directions) {
                const nx = wall.x + dir.dx;
                const ny = wall.y + dir.dy;

                if (nx >= 0 && nx < width && ny >= 0 && ny < height && !maze[ny][nx].wall) {
                    connectedCells++;
                }
            }

            if (connectedCells === 1) {
                maze[wall.y][wall.x].wall = false;
                addWalls(wall.x, wall.y);
                await new Promise(resolve => setTimeout(resolve, 10));
                renderMaze();
            }
        }

        maze[end.y][end.x].wall = false;
        renderMaze();
    }

    async function solveBFS() {
        if (solving) return;
        solving = true;
        resetSolution();

        const queue = [{ x: start.x, y: start.y, path: [] }];
        const visited = new Set();
        visited.add(`${start.x},${start.y}`);

        const directions = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }
        ];

        let found = false;
        let steps = 0;
        let visitedCells = 0;

        while (queue.length > 0 && !found) {
            const current = queue.shift();
            steps++;

            if (!(current.x === start.x && current.y === start.y)) {
                maze[current.y][current.x].visited = true;
                visitedCells++;

                if (steps % 5 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 10));
                    renderMaze();
                }
            }

            if (current.x === end.x && current.y === end.y) {
                for (const cell of current.path) {
                    maze[cell.y][cell.x].solution = true;
                }
                found = true;
                break;
            }

            for (const dir of directions) {
                const nx = current.x + dir.dx;
                const ny = current.y + dir.dy;

                if (nx >= 0 && nx < width && ny >= 0 && ny < height && !maze[ny][nx].wall && !visited.has(`${nx},${ny}`)) {
                    visited.add(`${nx},${ny}`);
                    queue.push({
                        x: nx,
                        y: ny,
                        path: [...current.path, { x: current.x, y: current.y }]
                    });
                }
            }
        }

        renderMaze();
        statsElement.textContent = `BFS 完成！訪問了 ${visitedCells} 個單元格，共 ${steps} 步。`;
        solving = false;
    }

    async function solveDFS() {
        if (solving) return;
        solving = true;
        resetSolution();

        const stack = [{ x: start.x, y: start.y, path: [] }];
        const visited = new Set();
        visited.add(`${start.x},${start.y}`);

        const directions = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }
        ];

        let found = false;
        let steps = 0;
        let visitedCells = 0;

        while (stack.length > 0 && !found) {
            const current = stack.pop();
            steps++;

            if (!(current.x === start.x && current.y === start.y)) {
                maze[current.y][current.x].visited = true;
                visitedCells++;

                if (steps % 5 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 10));
                    renderMaze();
                }
            }

            if (current.x === end.x && current.y === end.y) {
                for (const cell of current.path) {
                    maze[cell.y][cell.x].solution = true;
                }
                found = true;
                break;
            }

            const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);

            for (const dir of shuffledDirections) {
                const nx = current.x + dir.dx;
                const ny = current.y + dir.dy;

                if (nx >= 0 && nx < width && ny >= 0 && ny < height && !maze[ny][nx].wall && !visited.has(`${nx},${ny}`)) {
                    visited.add(`${nx},${ny}`);
                    stack.push({
                        x: nx,
                        y: ny,
                        path: [...current.path, { x: current.x, y: current.y }]
                    });
                }
            }
        }

        renderMaze();
        statsElement.textContent = `DFS 完成！訪問了 ${visitedCells} 個單元格，共 ${steps} 步。`;
        solving = false;
    }

    function resetSolution() {
        if (!maze || maze.length === 0 || !maze[0]) return;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                maze[y][x].visited = false;
                maze[y][x].solution = false;
            }
        }
        renderMaze();
        statsElement.textContent = '';
    }

    function startPlaying() {
        isPlaying = true;
        playerPosition = { x: start.x, y: start.y };
        updatePlayerPosition();
        renderMaze();
    }

    function updatePlayerPosition() {
        playerElement.style.width = `${cellSize * 0.8}px`;
        playerElement.style.height = `${cellSize * 0.8}px`;
        playerElement.style.left = `${playerPosition.x * cellSize + cellSize * 0.1}px`;
        playerElement.style.top = `${playerPosition.y * cellSize + cellSize * 0.1}px`;

        if (playerPosition.x === end.x && playerPosition.y === end.y) {
            statsElement.textContent = '恭喜你成功到達終點！';
        }
    }

    function handleKeyDown(e) {
        if (!isPlaying) return;

        let newX = playerPosition.x;
        let newY = playerPosition.y;

        switch (e.key) {
            case 'ArrowUp': newY--; break;
            case 'ArrowDown': newY++; break;
            case 'ArrowLeft': newX--; break;
            case 'ArrowRight': newX++; break;
            default: return;
        }

        if (newX >= 0 && newX < width && newY >= 0 && newY < height && !maze[newY][newX].wall) {
            playerPosition = { x: newX, y: newY };
            updatePlayerPosition();
        }
    }

    function resetGame() {
        isPlaying = false;
        solving = false;
        playerElement.style.display = 'none';
        if (maze && maze.length > 0) resetSolution();
    }

    generateButton.addEventListener('click', async function () {
    let w = parseInt(widthInput.value);
    let h = parseInt(heightInput.value);

    if (w < 5 || h < 5 || w > 50 || h > 50) {
        alert('請輸入 5 到 50 之間的整數');
        return;
    }

    if (w % 2 === 0) w--;
    if (h % 2 === 0) h--;

    resetGame();

    if (algorithmSelect.value === 'recursive') {
        await generateMazeRecursiveBacktracking(w, h);
    } else {
        await generateMazePrim(w, h);
    }
});

    solveBFSButton.addEventListener('click', solveBFS);
    solveDFSButton.addEventListener('click', solveDFS);
    playButton.addEventListener('click', startPlaying);
    resetButton.addEventListener('click', resetGame);
    document.addEventListener('keydown', handleKeyDown);

    generateButton.click();
});
