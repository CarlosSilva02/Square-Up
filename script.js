const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let block = { 
    x: 50,
    y: 150,
    width: 20,
    height: 20,
    gravity: 0.5,  // Gravity of the block
    lift: -3.6,     // Lift when the block flaps
    velocity: 0, 
};

let pipes = [];
let frameCount = 0;
let gameScore = 0;
let isGameOver = false; 

// Function to save the highest score to local storage
function saveHighestScore(score) {
    localStorage.setItem("highestScore", score); // Save the score
}

// Function to get the highest score from local storage
function getHighestScore() {
    return localStorage.getItem("highestScore") || 0; // Return the saved score or 0 if not set
}

// Initialize highest score at the beginning of the game
let highestScore = getHighestScore(); // Get the highest score

const pipeColor = "#365563";  
const borderColor = "#263238";   
 

function drawBlock() { 
    ctx.fillStyle = "black "; // Color of the block
    ctx.fillRect(block.x, block.y, block.width, block.height);
}
 
function drawPipes() { 
    pipes.forEach(pipe => {
        // Draw the top pipe
        ctx.fillStyle = pipe.color; // Use the pipe's fill color
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.top); // Top pipe   
        ctx.strokeStyle = borderColor; // Set border color
        ctx.lineWidth = 2; // Set the border width
        ctx.strokeRect(pipe.x, 0, pipe.width, pipe.top); // Draw border for top pipe

        // Draw the bottom pipe
        ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom); // Bottom pipe
        ctx.strokeRect(pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom); // Draw border for bottom pipe
    });
}

function updatePipes() {
    if (frameCount % 250 === 0) { // Create pipes every 250 frames
        const pipeWidth = 70;
        const pipeHeight = Math.random() * (canvas.height / 2 ) + 70  ;              
        const gapSize= 150;                

        // Create a new pipe object with the fixed color
        pipes.push({
            x: canvas.width,
            width: pipeWidth,
            top: pipeHeight,
            bottom: canvas.height - (pipeHeight + gapSize),    
            scored: false,
            color: pipeColor, // Use fixed color for pipes
        });
    }

    pipes.forEach(pipe => {
        pipe.x -= 1; // Move pipes to the left  

        if (
            block.x < pipe.x + pipe.width &&
            block.x + block.width > pipe.x &&
            (block.y < pipe.top || block.y + block.height > canvas.height - pipe.bottom)
        ) {
            isGameOver = true; // Set game over if collision occurs
        }

        // Increase score
        if (pipe.x + pipe.width < block.x && !pipe.scored) {
            gameScore++;
            pipe.scored = true; // ensure score only increments once per pipe
        }
    });
    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0); // Remove off screen pipes 
}

function drawScore() {
    ctx.fillStyle = "black"; // Color of the score text
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${gameScore}`, 10, 20); // Display the score
}

// Reset game function 
function resetGame() {
    block.y = 150; // Reset bird position
    block.velocity = 0; // Reset velocity
    pipes = []; // Clear pipes
    frameCount = 0; // Reset frame count
    gameScore = 0; // Reset score
    isGameOver = false; // Reset game over state
    document.getElementById("restartBtn").style.display = "none"; // Hide restart button
    gameLoop(); // Restart the game loop
}

function gameLoop() {
    if (isGameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // transparent background for game over
        ctx.fillRect(0, 0, canvas.width , canvas.height );
        ctx.fillStyle = "white"; // Color for game over text
        ctx.font = "30px Arial";
        ctx.fillText("Game Over", canvas.width / 2 - 70, canvas.height / 2);
        ctx.fillText(`Score: ${gameScore}`, canvas.width / 2 - 50, canvas.height / 2 + 70);
        
        // Check if the current score is a new highest score
        if (gameScore > highestScore) {
            highestScore = gameScore; // Update the highest score
            saveHighestScore(highestScore); // Save the new highest score
        }

        // Display the highest score
        ctx.fillText(`Highest Score: ${highestScore}`, canvas.width / 2 - 70, canvas.height / 2 + 35);
        
        document.getElementById("restartBtn").style.display = "block"; // Show restart button
        return;
    }


    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    block.velocity += block.gravity; // Apply gravity to the block
    block.y += block.velocity; // Update block position

    // stop the blcok from falling off the bottom
    if (block.y + block.height >= canvas.height) {
        block.y = canvas.height - block.height; // Keep the block on the bottom
        isGameOver = true;
    }

    // stop the block from flying off the top
    if (block.y < 0) {
        block.y = 0; // Keep the block at the top
    }

    drawBlock(); // Draw the block
    updatePipes(); // Update pipe positions
    drawPipes(); // Draw pipes
    drawScore(); // Draw score

    frameCount++; // Increment frame count
    requestAnimationFrame(gameLoop); // Call the next frame
}

document.addEventListener("keydown", (event) => {
    if (event.code === "Space" ) { // Check if the space bar is pressed
        if (isGameOver) {
            resetGame(); // Reset the game if it's over
        } else {
            block.velocity += block.lift; // Flap the block if the game is not over
        }
    }
});

document.getElementById("restartBtn").addEventListener("click", resetGame); // Keep the button functionality if needed

// Start the game loop
gameLoop();
