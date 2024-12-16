/*-------------------------------- Initialization ---------------------------*/

// Wait for the DOM to finish loading before running the game logic
document.addEventListener("DOMContentLoaded", () => {
  update();
});

/*-------------------------------- Constants --------------------------------*/

// Define the game board dimensions and block size in pixels for rendering
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const LINES_PER_LEVEL = 3;
const COLORS = [
  null, // No color for empty cells
  "cyan", // I
  "blue", // J
  "orange", // L
  "yellow", // O
  "green", // S
  "purple", // T
  "red", // Z
];

/*---------------------------- Variables (state) ----------------------------*/

// Initialize game state variables
let board = createMatrix(COLS, ROWS);
let currentPiece = createPiece();
let nextPiece = createPiece();
let score = 0;
let level = 1;
let linesCleared = 0;
let dropCounter = 0; // Counter to keep track of when to drop the piece
let dropInterval = 1000; // Time interval (ms) between drops
let lastTime = 0; // Last frame's timestamp
let isPaused = false;
let levelUpMessageDisplayed = false;

/*------------------------ Cached Element References ------------------------*/

// Fetch HTML elements for updating the game stats and rendering the game
const canvas = document.getElementById("tetris-board");
const ctx = canvas.getContext("2d"); // 2D rendering context for the canvas
const scoreDisplay = document.getElementById("score-value");
const levelDisplay = document.getElementById("level-value");
const linesDisplay = document.getElementById("lines-value");
const pauseButton = document.getElementById("pause-btn");
const resetButton = document.getElementById("reset-btn");

/*-------------------------------- Functions --------------------------------*/

function createMatrix(width, height) {
  // Create a 2D array to represent the game board
  return Array.from({ length: height }, () => Array(width).fill(0)); // Initialize each cell to zero
}

function createPiece() {
  // Randomly generate a new Tetris piece with a unique shape, color, and coordinates
  const types = "ILJOTSZ";
  const type = types[Math.floor(Math.random() * types.length)];
  switch (type) {
    case "I":
      return { shape: [[1, 1, 1, 1]], color: 1, x: 3, y: 0 };
    case "L":
      return {
        shape: [
          [0, 0, 3],
          [3, 3, 3],
        ],
        color: 3,
        x: 3,
        y: 0,
      };
    case "J":
      return {
        shape: [
          [2, 0, 0],
          [2, 2, 2],
        ],
        color: 2,
        x: 3,
        y: 0,
      };
    case "O":
      return {
        shape: [
          [4, 4],
          [4, 4],
        ],
        color: 4,
        x: 4,
        y: 0,
      };
    case "T":
      return {
        shape: [
          [0, 6, 0],
          [6, 6, 6],
        ],
        color: 6,
        x: 3,
        y: 0,
      };
    case "S":
      return {
        shape: [
          [0, 5, 5],
          [5, 5, 0],
        ],
        color: 5,
        x: 3,
        y: 0,
      };
    case "Z":
      return {
        shape: [
          [7, 7, 0],
          [0, 7, 7],
        ],
        color: 7,
        x: 3,
        y: 0,
      };
  }
}

function draw() {
  //Draw the game board and the current piece on the canvas
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(board, { x: 0, y: 0 });
  drawMatrix(currentPiece.shape, { x: currentPiece.x, y: currentPiece.y });
}

function drawMatrix(matrix, offset) {
  // Renders a matrix (game board or piece) on the canvas
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        // Only render non-empty cells
        ctx.fillStyle = COLORS[value];
        ctx.fillRect(
          (x + offset.x) * BLOCK_SIZE, // Calculate the x-coordinate based on the block size
          (y + offset.y) * BLOCK_SIZE, // Calculate the y-coordinate based on the block size
          BLOCK_SIZE, // width of the block
          BLOCK_SIZE // height
        );
      }
    });
  });
}

function merge(matrix, piece) {
  // Merge the current piece into the game board. This happens when the piece can no longer move down
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        // Only merge non-empty cells
        matrix[y + piece.y][x + piece.x] = piece.color; // Update the board with the piece's color
      }
    });
  });
}

function collide(matrix, piece) {
  // Checks for collisions between the current piece and the game board
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (
        piece.shape[y][x] !== 0 && // Checks for non-empty cells in the piece
        (matrix[y + piece.y] === undefined || // Checks for out of vertical bounds
          matrix[y + piece.y][x + piece.x] === undefined || // Checks for out of horizontal bounds
          matrix[y + piece.y][x + piece.x] !== 0) // Collides with filled board cell
      ) {
        return true;
      }
    }
  }
  return false;
}

function clearLines() {
  // Clears filled rows from the game board and updates the score
  let linesClearedThisTurn = 0;

  for (let r = ROWS - 1; r >= 0; r--) {
    // Iterate from the bottom to the top of the board
    if (board[r].every((cell) => cell !== 0)) {
      board.splice(r, 1);
      board.unshift(new Array(COLS).fill(0));
      linesClearedThisTurn++;
    }
  }

  if (linesClearedThisTurn > 0) {
    // Update the score and level based on the number of lines cleared
    linesCleared += linesClearedThisTurn;
    score += linesClearedThisTurn * 100;

    const newLevel = Math.floor(linesCleared / LINES_PER_LEVEL) + 1; // Calculate the new level based on the number of lines cleared
    if (newLevel > level) {
      level = newLevel;
      dropInterval = Math.max(200, 1000 - level * 100); // Decrease drop interval to increase game speed
      displayLevelUpMessage();
    }

    updateStats();
  }
}

function dropPiece() {
  // Handles the automatic drop of the Tetris piece
  currentPiece.y++; // Move the piece down by one row
  if (collide(board, currentPiece)) {
    currentPiece.y--; // Reset the position if the piece collides
    merge(board, currentPiece);
    clearLines();
    currentPiece = nextPiece;
    nextPiece = createPiece();

    if (collide(board, currentPiece)) {
      // Check if the new piece collides immediately
      gameOver(); // End the game if no space is available
      return;
    }
  }
  dropCounter = 0;
}

function movePiece(direction) {
  // Move the current piece left or right based on the direction
  currentPiece.x += direction;
  if (collide(board, currentPiece)) {
    currentPiece.x -= direction;
  }
}

function rotatePiece() {
  // Rotate the current piece clockwise and handles wall kicks to prevent rotation from going out of bounds
  const rotatedShape = currentPiece.shape.map(
    (_, index) => currentPiece.shape.map((row) => row[index]).reverse() // Transpose and reverse the rows to rotate the piece
  );

  const originalX = currentPiece.x; // Save the original position
  let offset = 1; // Initialize the offset for wall kicks

  while (collide(board, { ...currentPiece, shape: rotatedShape })) {
    currentPiece.x += offset % 2 === 0 ? -offset : offset; // Apply wall kicks to prevent out-of-bounds rotation
    offset++;
    if (offset > currentPiece.shape[0].length) {
      // Check if the piece is stuck and cannot rotate
      currentPiece.x = originalX;
      return;
    }
  }
  currentPiece.shape = rotatedShape;
}

function updateStats() {
  // Update the game stats displayed on the screen
  scoreDisplay.textContent = score;
  levelDisplay.textContent = level;
  linesDisplay.textContent = linesCleared;
}

function resetGame() {
  // Reset the game state to start a new game
  board = createMatrix(COLS, ROWS);
  score = 0;
  level = 1;
  linesCleared = 0;
  currentPiece = createPiece();
  nextPiece = createPiece();
  dropCounter = 0;
  isPaused = false;

  const gameMessage = document.getElementById("game-message");
  if (gameMessage) {
    gameMessage.remove();
  }

  updateStats();
  draw();
  update();
}

function update(time = 0) {
  // Main game loop to update the game state and render the game
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    dropPiece();
  }
  draw();
  updateStats();

  if (!isPaused) {
    requestAnimationFrame(update); // Continue the game loop
  }
}

function displayMessage(messageText, messageType) {
  // Display a message overlay on the game screen
  const gameContainer = document.querySelector(".game-container");
  let messageContainer = document.getElementById("game-message");

  if (messageContainer) {
    gameContainer.removeChild(messageContainer); // Remove existing message if present
  }

  messageContainer = document.createElement("div"); // Create a new message container
  messageContainer.id = "game-message";
  messageContainer.textContent = messageText;

  messageContainer.style.position = "absolute";
  messageContainer.style.top = "50%";
  messageContainer.style.left = "50%";
  messageContainer.style.transform = "translate(-50%, -50%)";
  messageContainer.style.padding = "1rem";
  messageContainer.style.borderRadius = "10px";
  messageContainer.style.textAlign = "center";
  messageContainer.style.color = "white";
  messageContainer.style.fontSize = "2rem";
  messageContainer.style.zIndex = "10";

  if (messageType === "level-up") {
    // Style based on message type
    messageContainer.style.backgroundColor = "rgba(0, 255, 0, 0.8)";
  } else if (messageType === "game-over") {
    messageContainer.style.backgroundColor = "rgba(255, 0, 0, 0.8)";
  }

  gameContainer.appendChild(messageContainer);

  if (messageType === "level-up") {
    setTimeout(() => {
      if (messageContainer.parentNode) {
        // Remove the message after 2 seconds
        gameContainer.removeChild(messageContainer);
      }
    }, 2000); //
  }
}

function displayLevelUpMessage() {
  // Display a level up message when the player levels up
  if (levelUpMessageDisplayed) return;

  displayMessage(
    `Congratulations, you leveled up! You are now on Level ${level}!`,
    "level-up"
  );
  levelUpMessageDisplayed = true;

  setTimeout(() => {
    levelUpMessageDisplayed = false;
  }, 2000);
}

function gameOver() {
  // End the game and display a game over message
  isPaused = true;
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  displayMessage("Game Over!", "game-over");
}

/*----------------------------- Event Listeners -----------------------------*/

document.addEventListener("keydown", (e) => {
  // Event listener for keyboard inputs to control the game
  if (!isPaused) {
    switch (e.key) {
      case "ArrowDown":
        dropPiece();
        break;
      case "ArrowLeft":
        movePiece(-1);
        break;
      case "ArrowRight":
        movePiece(1);
        break;
      case "ArrowUp":
        rotatePiece();
        break;
    }
  }
});

pauseButton.addEventListener("click", () => {
  // Event listener for the pause button
  isPaused = !isPaused;
  pauseButton.textContent = isPaused ? "Resume Game" : "Pause Game";
  if (!isPaused) {
    update();
  }
});

resetButton.addEventListener("click", resetGame); // Event listener for the reset button
