document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 400; // Set resolution for drawing
    canvas.height = 400; // Set resolution for drawing
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    const gameOverOverlay = document.getElementById('gameOverOverlay');
    const startScreenOverlay = document.getElementById('startScreenOverlay');
    const finalScoreElement = document.getElementById('finalScore');
    const pauseOverlay = document.getElementById('pauseOverlay');
    const restartButton = document.getElementById('restartButton');
    const pauseButton = document.getElementById('pauseButton');
    const gameOverRestartButton = document.getElementById('gameOverRestartButton');
    const startButton = document.getElementById('startButton');
    const skinButton = document.getElementById('skinButton');
    const resumeButton = document.getElementById('resumeButton');
    const gameOverBackButton = document.getElementById('gameOverBackButton');
    const pauseBackButton = document.getElementById('pauseBackButton');
    const skinSelector = document.getElementById('skinSelector');
    const colorSelector = document.getElementById('colorSelector');
    const skinCustomizationOverlay = document.getElementById('skinCustomizationOverlay');
    const skinDoneButton = document.getElementById('skinDoneButton');
    const progressBar = document.getElementById('progressBar');
    const dpadUp = document.getElementById('dpad-up');
    const dpadDown = document.getElementById('dpad-down');
    const dpadLeft = document.getElementById('dpad-left');
    const dpadRight = document.getElementById('dpad-right');

    // --- Game Constants ---
    const gridSize = 20;
    const tileCount = 20; // canvas.width / gridSize
    const initialSpeed = 150; // ms per frame, lower is faster
    const speedIncrement = 5; // ms to decrease per 10 fruits

    // --- Game State ---
    let snake, food, obstacles, score, highScore, direction, newDirection, speed, isGameOver, isPaused, gameLoopInterval, currentSkin, currentBodyColor;

    function initializeGame() {
        // Reset game state
        snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }]; // Start with a head and tail
        food = {};
        obstacles = [];
        score = 0;
        highScore = localStorage.getItem('boxByteHighScore') || 0;
        direction = { x: 1, y: 0 }; // Start moving right
        newDirection = { x: 1, y: 0 }; // Buffer for next direction
        speed = initialSpeed;
        isGameOver = false;
        isPaused = false;

        // Reset UI
        scoreElement.textContent = score;
        highScoreElement.textContent = highScore;
        gameOverOverlay.style.display = 'none';
        startScreenOverlay.style.display = 'none';
        pauseOverlay.style.display = 'none';
        pauseButton.textContent = 'Pause';
        pauseButton.disabled = false;
        updateProgressBar();

        generateFood();

        // Start game loop
        if (gameLoopInterval) clearInterval(gameLoopInterval);
        gameLoopInterval = setInterval(gameLoop, speed);
    }

    function gameLoop() {
        if (isPaused || isGameOver) return;
        update();
        draw();
    }

    // --- Game Logic ---
    function update() {
        // Update direction from the buffered input
        direction = newDirection;

        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

        // Collision Detection
        if (
            head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || // Wall collision
            snake.some(segment => segment.x === head.x && segment.y === head.y) || // Self collision
            obstacles.some(obs => obs.x === head.x && obs.y === head.y) // Obstacle collision
        ) {
            endGame();
            return;
        }

        snake.unshift(head);

        // Food Consumption
        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreElement.textContent = score;
            updateProgressBar();

            // Add obstacle and increase speed every 10 points
            if (score > 0 && score % 10 === 0) {
                // Shrink snake by up to 5 segments
                const segmentsToRemove = 5;
                for (let i = 0; i < segmentsToRemove; i++) {
                    if (snake.length > 2) { // Always keep a head and a tail
                        snake.pop();
                    }
                }

                generateObstacle();
                speed = Math.max(40, speed - speedIncrement); // Set a max speed
                clearInterval(gameLoopInterval);
                gameLoopInterval = setInterval(gameLoop, speed);
            }

            generateFood();
        } else {
            snake.pop();
        }
    }

    // --- Drawing ---
    function draw() {
        // Clear canvas with dark background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the grid with low opacity
        drawGrid();

        // Draw obstacles
        ctx.fillStyle = '#5a4fcf'; // Purple Iris
        obstacles.forEach(obs => {
            ctx.fillRect(obs.x * gridSize, obs.y * gridSize, gridSize, gridSize);
        });

        // Draw food
        ctx.fillStyle = '#ff0000'; // Bright Red
        ctx.beginPath();
        ctx.arc(
            food.x * gridSize + gridSize / 2, // center x
            food.y * gridSize + gridSize / 2, // center y
            gridSize / 2 - 2, // radius
            0,
            2 * Math.PI
        );
        ctx.fill();

        // Draw snake
        snake.forEach((segment, index) => {
            if (index === 0) {
                ctx.fillStyle = '#ffffff'; // Head is always white
                drawHead(segment, direction);
            } else if (index === snake.length - 1) {
                ctx.fillStyle = '#ffffff'; // Tail is always white
                drawTail(segment);
            } else {
                ctx.fillStyle = currentBodyColor; // Body uses selected color
                drawBodySegment(segment);
            }
        });
    }

    /**
     * Draws the arrow-shaped head based on the direction of movement.
     */
    function drawHead(segment, dir) {
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;
        ctx.beginPath();
        if (dir.x === 1) { // Right
            ctx.moveTo(x, y);
            ctx.lineTo(x + gridSize, y + gridSize / 2);
            ctx.lineTo(x, y + gridSize);
        } else if (dir.x === -1) { // Left
            ctx.moveTo(x + gridSize, y);
            ctx.lineTo(x, y + gridSize / 2);
            ctx.lineTo(x + gridSize, y + gridSize);
        } else if (dir.y === 1) { // Down
            ctx.moveTo(x, y);
            ctx.lineTo(x + gridSize / 2, y + gridSize);
            ctx.lineTo(x + gridSize, y);
        } else if (dir.y === -1) { // Up
            ctx.moveTo(x, y + gridSize);
            ctx.lineTo(x + gridSize / 2, y);
            ctx.lineTo(x + gridSize, y + gridSize);
        }
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Draws a diamond-shaped tail.
     */
    function drawTail(segment) {
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;
        const g = gridSize;
        ctx.beginPath();
        ctx.moveTo(x + g / 2, y);      // Top point
        ctx.lineTo(x + g, y + g / 2);  // Right point
        ctx.lineTo(x + g / 2, y + g);  // Bottom point
        ctx.lineTo(x, y + g / 2);      // Left point
        ctx.closePath();
        ctx.fill();
    }

    // --- Shape Drawing Functions ---

    function drawBodySegment(segment) {
        switch (currentSkin) {
            case 'square':
                drawSquare(segment);
                break;
            case 'triangle':
                drawTriangle(segment);
                break;
            case 'diamond':
                drawBodyDiamond(segment);
                break;
            case 'star':
                drawStar(segment);
                break;
            case 'circle':
            default:
                drawCircle(segment);
                break;
        }
    }

    function drawCircle(segment) {
        ctx.beginPath();
        ctx.arc(
            segment.x * gridSize + gridSize / 2,
            segment.y * gridSize + gridSize / 2,
            gridSize / 2 - 2,
            0,
            2 * Math.PI
        );
        ctx.fill();
    }

    function drawSquare(segment) {
        ctx.fillRect(segment.x * gridSize + 2, segment.y * gridSize + 2, gridSize - 4, gridSize - 4);
    }

    function drawTriangle(segment) {
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;
        const g = gridSize;
        ctx.beginPath();
        ctx.moveTo(x + g / 2, y + 2);
        ctx.lineTo(x + g - 2, y + g - 2);
        ctx.lineTo(x + 2, y + g - 2);
        ctx.closePath();
        ctx.fill();
    }

    function drawBodyDiamond(segment) {
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;
        const g = gridSize;
        ctx.beginPath();
        ctx.moveTo(x + g / 2, y + 2);
        ctx.lineTo(x + g - 2, y + g / 2);
        ctx.lineTo(x + g / 2, y + g - 2);
        ctx.lineTo(x + 2, y + g / 2);
        ctx.closePath();
        ctx.fill();
    }

    function drawStar(segment) {
        const g = gridSize;
        const cX = segment.x * g + g / 2;
        const cY = segment.y * g + g / 2;
        const outerRadius = g / 2 - 1;
        const innerRadius = g / 4;
        let rot = Math.PI / 2 * 3;
        ctx.beginPath();
        ctx.moveTo(cX, cY - outerRadius);
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(cX + Math.cos(rot) * outerRadius, cY + Math.sin(rot) * outerRadius);
            rot += Math.PI / 5;
            ctx.lineTo(cX + Math.cos(rot) * innerRadius, cY + Math.sin(rot) * innerRadius);
            rot += Math.PI / 5;
        }
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Draws a faint grid on the canvas for visual guidance.
     */
    function drawGrid() {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'; // Very low opacity white
        ctx.lineWidth = 1;

        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    // --- Utility Functions ---
    function generateFood() {
        let newFoodPosition;
        do {
            newFoodPosition = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
        } while (
            snake.some(seg => seg.x === newFoodPosition.x && seg.y === newFoodPosition.y) ||
            obstacles.some(obs => obs.x === newFoodPosition.x && obs.y === newFoodPosition.y)
        );
        food = newFoodPosition;
    }

    function generateObstacle() {
        let newObstaclePosition;
        do {
            newObstaclePosition = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
        } while (
            (Math.abs(newObstaclePosition.x - snake[0].x) < 4 && Math.abs(newObstaclePosition.y - snake[0].y) < 4) || // Not too close to head
            snake.some(seg => seg.x === newObstaclePosition.x && seg.y === newObstaclePosition.y) ||
            obstacles.some(obs => obs.x === newObstaclePosition.x && obs.y === newObstaclePosition.y) ||
            (food.x === newObstaclePosition.x && food.y === newObstaclePosition.y)
        );
        obstacles.push(newObstaclePosition);
    }

    function updateProgressBar() {
        const progress = (score % 10) / 10 * 100;
        progressBar.style.width = `${progress}%`;
    }

    function changeDirection(dx, dy) {
        const isMovingHorizontally = direction.x !== 0;
        const isMovingVertically = direction.y !== 0;

        // If trying to move horizontally, and currently moving vertically, it's a valid move.
        if (dx !== 0 && isMovingVertically) {
            newDirection = { x: dx, y: 0 };
        }
        // If trying to move vertically, and currently moving horizontally, it's a valid move.
        if (dy !== 0 && isMovingHorizontally) {
            newDirection = { x: 0, y: dy };
        }
    }

    function togglePause() {
        if (isGameOver) return;
        isPaused = !isPaused;
        pauseOverlay.style.display = isPaused ? 'flex' : 'none';
        pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
    }

    function endGame() {
        isGameOver = true;
        clearInterval(gameLoopInterval);
        pauseButton.disabled = true;

        finalScoreElement.textContent = score;
        gameOverOverlay.style.display = 'flex';

        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('boxByteHighScore', highScore);
        }
    }

    function goToHomeScreen() {
        // Stop the game loop if it's running
        if (gameLoopInterval) {
            clearInterval(gameLoopInterval);
        }

        // Set state to prevent accidental interactions
        isGameOver = true;
        isPaused = false;

        // Show the start screen and hide other overlays
        startScreenOverlay.style.display = 'flex';
        gameOverOverlay.style.display = 'none';
        pauseOverlay.style.display = 'none';

        // Disable game controls
        pauseButton.disabled = true;
    }

    // --- Event Listeners ---
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'p') {
            togglePause();
            return;
        }
        if (isPaused || isGameOver) return;

        const key = e.key.toLowerCase();
        if (key === 'arrowleft' || key === 'a') changeDirection(-1, 0);
        else if (key === 'arrowup' || key === 'w') changeDirection(0, -1);
        else if (key === 'arrowright' || key === 'd') changeDirection(1, 0);
        else if (key === 'arrowdown' || key === 's') changeDirection(0, 1);
    });
    startButton.addEventListener('click', initializeGame);
    restartButton.addEventListener('click', initializeGame);
    pauseButton.addEventListener('click', togglePause);
    resumeButton.addEventListener('click', togglePause);
    gameOverRestartButton.addEventListener('click', initializeGame);
    gameOverBackButton.addEventListener('click', goToHomeScreen);
    pauseBackButton.addEventListener('click', goToHomeScreen);
    dpadUp.addEventListener('click', () => changeDirection(0, -1));
    dpadDown.addEventListener('click', () => changeDirection(0, 1));
    dpadLeft.addEventListener('click', () => changeDirection(-1, 0));
    dpadRight.addEventListener('click', () => changeDirection(1, 0));

    skinButton.addEventListener('click', () => {
        startScreenOverlay.style.display = 'none';
        skinCustomizationOverlay.style.display = 'flex';
    });

    skinDoneButton.addEventListener('click', () => {
        skinCustomizationOverlay.style.display = 'none';
        startScreenOverlay.style.display = 'flex';
    });

    skinSelector.addEventListener('click', (e) => {
        const target = e.target.closest('.skin-button');
        if (target) {
            currentSkin = target.dataset.shape;
            skinSelector.querySelector('.selected').classList.remove('selected');
            target.classList.add('selected');
        }
    });

    colorSelector.addEventListener('click', (e) => {
        const target = e.target.closest('.color-button');
        if (target) {
            currentBodyColor = target.dataset.color;
            colorSelector.querySelector('.selected').classList.remove('selected');
            target.classList.add('selected');
        }
    });

    // --- Initial Setup ---
    function initialSetup() {
        currentSkin = 'circle';
        currentBodyColor = '#ffffff';
        // The game waits for the user to click the start button.
    }

    initialSetup();
});