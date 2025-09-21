document.addEventListener('DOMContentLoaded', () => {
            const canvas = document.getElementById('game-canvas');
            const ctx = canvas.getContext('2d');
            const scoreDisplay = document.getElementById('score');
            const highScoreDisplay = document.getElementById('high-score');
            const finalScoreDisplay = document.getElementById('final-score');
            const startBtn = document.getElementById('start-btn');
            const resetBtn = document.getElementById('reset-btn');
            const restartBtn = document.getElementById('restart-btn');
            const gameOverScreen = document.getElementById('game-over');
            
            // Set canvas size
            const gameBoard = document.querySelector('.game-board');
            const size = gameBoard.offsetWidth;
            canvas.width = size;
            canvas.height = size;
            
            // Game variables
            const gridSize = 20;
            const cellSize = size / gridSize;
            let snake = [];
            let food = {};
            let direction = 'right';
            let nextDirection = 'right';
            let gameRunning = false;
            let score = 0;
            let highScore = localStorage.getItem('snakeHighScore') || 0;
            let gameSpeed = 130;
            let gameLoop;
            
            // Initialize high score display
            highScoreDisplay.textContent = highScore;
            
            // Initialize game
            function initGame() {
                snake = [
                    {x: 10, y: 10},
                    {x: 9, y: 10},
                    {x: 8, y: 10}
                ];
                
                generateFood();
                score = 0;
                scoreDisplay.textContent = score;
                direction = 'right';
                nextDirection = 'right';
                gameSpeed = 130;
            }
            
            // Generate food at random position
            function generateFood() {
                food = {
                    x: Math.floor(Math.random() * gridSize),
                    y: Math.floor(Math.random() * gridSize)
                };
                
                // Make sure food doesn't appear on snake
                for (let segment of snake) {
                    if (segment.x === food.x && segment.y === food.y) {
                        return generateFood();
                    }
                }
            }
            
            // Draw game elements
            function draw() {
                // Clear canvas
                ctx.fillStyle = '#222';
                ctx.fillRect(0, 0, size, size);
                
                // Draw grid
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 0.5;
                for (let i = 0; i < gridSize; i++) {
                    for (let j = 0; j < gridSize; j++) {
                        ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
                    }
                }
                
                // Draw snake
                snake.forEach((segment, index) => {
                    if (index === 0) {
                        // Draw snake head
                        ctx.fillStyle = '#4CAF50';
                    } else {
                        // Draw snake body
                        ctx.fillStyle = '#8BC34A';
                    }
                    ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
                    
                    // Draw eyes on head
                    if (index === 0) {
                        ctx.fillStyle = 'white';
                        ctx.beginPath();
                        
                        if (direction === 'right') {
                            ctx.arc((segment.x + 0.7) * cellSize, (segment.y + 0.3) * cellSize, cellSize * 0.2, 0, Math.PI * 2);
                            ctx.arc((segment.x + 0.7) * cellSize, (segment.y + 0.7) * cellSize, cellSize * 0.2, 0, Math.PI * 2);
                        } else if (direction === 'left') {
                            ctx.arc((segment.x + 0.3) * cellSize, (segment.y + 0.3) * cellSize, cellSize * 0.2, 0, Math.PI * 2);
                            ctx.arc((segment.x + 0.3) * cellSize, (segment.y + 0.7) * cellSize, cellSize * 0.2, 0, Math.PI * 2);
                        } else if (direction === 'up') {
                            ctx.arc((segment.x + 0.3) * cellSize, (segment.y + 0.3) * cellSize, cellSize * 0.2, 0, Math.PI * 2);
                            ctx.arc((segment.x + 0.7) * cellSize, (segment.y + 0.3) * cellSize, cellSize * 0.2, 0, Math.PI * 2);
                        } else if (direction === 'down') {
                            ctx.arc((segment.x + 0.3) * cellSize, (segment.y + 0.7) * cellSize, cellSize * 0.2, 0, Math.PI * 2);
                            ctx.arc((segment.x + 0.7) * cellSize, (segment.y + 0.7) * cellSize, cellSize * 0.2, 0, Math.PI * 2);
                        }
                        
                        ctx.fill();
                    }
                });
                
                // Draw food
                ctx.fillStyle = '#FF5722';
                ctx.beginPath();
                ctx.arc(
                    (food.x + 0.5) * cellSize,
                    (food.y + 0.5) * cellSize,
                    cellSize * 0.4,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
            
            // Update game state
            function update() {
                // Update direction
                direction = nextDirection;
                
                // Calculate new head position
                const head = {...snake[0]};
                
                switch(direction) {
                    case 'right':
                        head.x++;
                        break;
                    case 'left':
                        head.x--;
                        break;
                    case 'up':
                        head.y--;
                        break;
                    case 'down':
                        head.y++;
                        break;
                }
                
                // Check for wall collisions
                if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
                    gameOver();
                    return;
                }
                
                // Check for self collision
                for (let i = 0; i < snake.length; i++) {
                    if (snake[i].x === head.x && snake[i].y === head.y) {
                        gameOver();
                        return;
                    }
                }
                
                // Add new head
                snake.unshift(head);
                
                // Check for food collision
                if (head.x === food.x && head.y === food.y) {
                    // Increase score
                    score += 10;
                    scoreDisplay.textContent = score;
                    
                    // Generate new food
                    generateFood();
                    
                    // Increase speed slightly
                    if (gameSpeed > 70) {
                        gameSpeed -= 2;
                    }
                } else {
                    // Remove tail if no food was eaten
                    snake.pop();
                }
            }
            
            // Main game loop
            function runGame() {
                update();
                draw();
                
                if (gameRunning) {
                    gameLoop = setTimeout(runGame, gameSpeed);
                }
            }
            
            // Game over function
            function gameOver() {
                gameRunning = false;
                clearTimeout(gameLoop);
                
                // Update high score if needed
                if (score > highScore) {
                    highScore = score;
                    highScoreDisplay.textContent = highScore;
                    localStorage.setItem('snakeHighScore', highScore);
                }
                
                // Show game over screen
                finalScoreDisplay.textContent = score;
                gameOverScreen.style.display = 'flex';
            }
            
            // Start game
            function startGame() {
                if (!gameRunning) {
                    initGame();
                    gameRunning = true;
                    gameOverScreen.style.display = 'none';
                    runGame();
                }
            }
            
            // Reset game
            function resetGame() {
                if (gameRunning) {
                    clearTimeout(gameLoop);
                    gameRunning = false;
                }
                initGame();
                draw();
                gameOverScreen.style.display = 'none';
            }
            
            // Keyboard controls
            document.addEventListener('keydown', (e) => {
                switch(e.key) {
                    case 'ArrowUp':
                        if (direction !== 'down') nextDirection = 'up';
                        break;
                    case 'ArrowDown':
                        if (direction !== 'up') nextDirection = 'down';
                        break;
                    case 'ArrowLeft':
                        if (direction !== 'right') nextDirection = 'left';
                        break;
                    case 'ArrowRight':
                        if (direction !== 'left') nextDirection = 'right';
                        break;
                    case ' ':
                        if (!gameRunning) startGame();
                        break;
                }
            });
            
            // Touch controls for mobile devices
            let touchStartX = 0;
            let touchStartY = 0;
            
            document.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            });
            
            document.addEventListener('touchmove', (e) => {
                e.preventDefault();
            });
            
            document.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                
                const diffX = touchEndX - touchStartX;
                const diffY = touchEndY - touchStartY;
                
                // Determine swipe direction
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    // Horizontal swipe
                    if (diffX > 0 && direction !== 'left') {
                        nextDirection = 'right';
                    } else if (diffX < 0 && direction !== 'right') {
                        nextDirection = 'left';
                    }
                } else {
                    // Vertical swipe
                    if (diffY > 0 && direction !== 'up') {
                        nextDirection = 'down';
                    } else if (diffY < 0 && direction !== 'down') {
                        nextDirection = 'up';
                    }
                }
            });
            
            // Button event listeners
            startBtn.addEventListener('click', startGame);
            resetBtn.addEventListener('click', resetGame);
            restartBtn.addEventListener('click', startGame);
            
            // Initial draw
            initGame();
            draw();
        });