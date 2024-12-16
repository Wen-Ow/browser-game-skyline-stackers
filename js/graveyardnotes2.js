/*-------------------------------- Initialization ---------------------------*/

// Ensures that the game starts when the DOM is fully loaded
// Calls the update function to start the game's render and logic loop
document.addEventListener("DOMContentLoaded", () => {
  update();
});

/*-------------------------------- Constants --------------------------------*/

// Defines the game parameters 
const COLS = 10; 
const ROWS = 20; 
const BLOCK_SIZE = 30; // Size of each block in pixels
const LINES_PER_LEVEL = 3; // Number of lines required to level up
const COLORS = [ // Array of colors for each Tetris piece
  null, // Empty cell
  "cyan", // I piece
  "blue", // J piece
  "orange", // L piece
  "yellow", // O piece
  "green", // S piece
  "purple", // T piece
  "red", // Z piece
];

/*---------------------------- Variables (state) ----------------------------*/

let board = createMatrix(COLS, ROWS); // 2D array representing the game board
let currentPiece = createPiece();
let nextPiece = createPiece();
let score = 0; 
let level = 1; 
let linesCleared = 0; 
let dropCounter = 0; // Counter to track the time since the last piece drop
let dropInterval = 1000; // Time interval between piece drops
let lastTime = 0; 
let isPaused = false; // Flag to indicate if the game is paused
let levelUpMessageDisplayed = false; // Flag to prevent multiple level up messages

/*------------------------ Cached Element References ------------------------*/

const canvas = document.getElementById("tetris-board"); // Canvas element for rendering the game
const ctx = canvas.getContext("2d"); // 2D rendering context of the canvas
const scoreDisplay = document.getElementById("score-value");
const levelDisplay = document.getElementById("level-value"); 
const linesDisplay = document.getElementById("lines-value"); 
const pauseButton = document.getElementById("pause-btn"); 
const resetButton = document.getElementById("reset-btn");

/*-------------------------------- Functions --------------------------------*/

function createMatrix(width, height) { // Function to create a 2D array with the specified width and height
  return Array.from({ length: height }, () => Array(width).fill(0)); // Creates an array of height length, each element initialized with an array of width length filled with zeros
}

function createPiece() { // Function to generate a new Tetris piece with a random shape and color
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

function draw() { // Clears the canvas and redraws the game board and current pieces
  ctx.fillStyle = "#000000"; // Sets the fill color to black
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Fills the entire canvas with black color
  drawMatrix(board, { x: 0, y: 0 }); // Draws the game board
  drawMatrix(currentPiece.shape, { x: currentPiece.x, y: currentPiece.y }); // Draws the current Tetris piece
}

function drawMatrix(matrix, offset) { // Renders the Tetris pieces on the canvas
  matrix.forEach((row, y) => { 
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = COLORS[value];
        ctx.fillRect(
          (x + offset.x) * BLOCK_SIZE, // Calculates the x coordinate of the block
          (y + offset.y) * BLOCK_SIZE, // Calculates the y coordinate of the block
          BLOCK_SIZE,
          BLOCK_SIZE
        );
      }
    });
  });
}

function merge(matrix, piece) { // Incorporates a fallen piece into the game board. Called after a collision to make the piece permanent.
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => { 
      if (value !== 0) { // Checks if the cell is occupied by a Tetris piece
        matrix[y + piece.y][x + piece.x] = piece.color; // Updates the game board with the piece's color
      }
    });
  });
}

function collide(matrix, piece) { // Checks for collisions between the current piece and the game board
  for (let y = 0; y < piece.shape.length; y++) { // Loops through each row of the piece
    for (let x = 0; x < piece.shape[y].length; x++) { // Loops through each cell of the piece
      if (
        piece.shape[y][x] !== 0 &&
        (matrix[y + piece.y] === undefined ||
          matrix[y + piece.y][x + piece.x] === undefined ||
          matrix[y + piece.y][x + piece.x] !== 0)
      ) {
        return true;
      }
    }
  }
  return false;
}

function clearLines() { // Clears full rows from the game board and updates the score and level
  let linesClearedThisTurn = 0;

  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every((cell) => cell !== 0)) {
      board.splice(r, 1);
      board.unshift(new Array(COLS).fill(0));
      linesClearedThisTurn++;
    }
  }

  if (linesClearedThisTurn > 0) { // If one or more lines are cleared
    linesCleared += linesClearedThisTurn;
    score += linesClearedThisTurn * 100;

    const newLevel = Math.floor(linesCleared / LINES_PER_LEVEL) + 1; // Calculate the new level based on the number of lines cleared
    if (newLevel > level) {
      level = newLevel;
      dropInterval = Math.max(200, 1000 - level * 100); // Update the drop interval based on the new level
      displayLevelUpMessage();
    }

    updateStats();
  }
}

function clearRows() { // Function to clear full rows from the game board
  for (let y = board.length - 1; y >= 0; y--) {
    if (board[y].every((value) => value !== 0)) {
      board.splice(y, 1);
      board.unshift(new Array(COLS).fill(0));
      score += 10;
      linesCleared++;
    }
  }
  level = Math.floor(linesCleared / LINES_PER_LEVEL) + 1;
  dropInterval = Math.max(200, 1000 - level * 50);
}

function dropPiece() { // Moves the piece down by one cell and checks for collisions
  currentPiece.y++;
  if (collide(board, currentPiece)) {
    currentPiece.y--;
    merge(board, currentPiece);
    clearLines();
    currentPiece = nextPiece;
    nextPiece = createPiece();

    if (collide(board, currentPiece)) {
      gameOver();
      return;
    }
  }
  dropCounter = 0;
}

function movePiece(direction) { // Function to move the current piece left or right, ensuring no collisions
  currentPiece.x += direction;
  if (collide(board, currentPiece)) {
    currentPiece.x -= direction;
  }
}

function rotatePiece() { // Rotates the current piece, handling collisions and wall kicks
  const rotatedShape = currentPiece.shape.map((_, index) =>
    currentPiece.shape.map((row) => row[index]).reverse()
  );

  const originalX = currentPiece.x;
  let offset = 1;

  while (collide(board, { ...currentPiece, shape: rotatedShape })) {
    currentPiece.x += offset % 2 === 0 ? -offset : offset;
    offset++;
    if (offset > currentPiece.shape[0].length) {
      currentPiece.x = originalX;
      return;
    }
  }
  currentPiece.shape = rotatedShape;
}

function updateStats() { // Updates the score, level, and lines cleared display on the UI
  scoreDisplay.textContent = score;
  levelDisplay.textContent = level;
  linesDisplay.textContent = linesCleared;
}

function resetGame() { // Resets all game state variables and restarts the game
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

  updateStats(); // Updates the score, level, and lines cleared display on the UI
  draw(); // Clears the canvas and redraws the game board and current pieces
  update(); // Starts the game loop
}
 
function update(time = 0) { // Function to update the game state and render the game
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    dropPiece();
  }
  draw();
  updateStats();

  if (!isPaused) {
    requestAnimationFrame(update);
  }
}

function displayMessage(messageText, messageType) { // Displays temporary messages on the game screen
  const gameContainer = document.querySelector(".game-container");
  let messageContainer = document.getElementById("game-message");

  if (messageContainer) {
    gameContainer.removeChild(messageContainer);
  }

  messageContainer = document.createElement("div"); // Uses style div overlays for clarity
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
    messageContainer.style.backgroundColor = "rgba(0, 255, 0, 0.8)";
  } else if (messageType === "game-over") {
    messageContainer.style.backgroundColor = "rgba(255, 0, 0, 0.8)";
  }

  gameContainer.appendChild(messageContainer); 

  if (messageType === "level-up") { // Removes the message after 2 seconds
    setTimeout(() => {
      if (messageContainer.parentNode) {
        gameContainer.removeChild(messageContainer);
      }
    }, 2000);
  }
}

function displayLevelUpMessage() { // Displays the level up message when the player levels up
  if (levelUpMessageDisplayed) return;

  displayMessage(
    `Congratulations, you leveled up! You are now on Level ${level}!`,
    "level-up"
  );
  levelUpMessageDisplayed = true;

  setTimeout(() => { // Removes the message after 2 seconds
    levelUpMessageDisplayed = false;
  }, 2000);
}

function gameOver() { // Displays the game over message and pauses the game
  isPaused = true;
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  displayMessage("Game Over!", "game-over");
}

/*----------------------------- Event Listeners -----------------------------*/

document.addEventListener("keydown", (e) => { // Event listener for keyboard inputs to control the game
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

pauseButton.addEventListener("click", () => { // Event listener for the pause button to pause or resume the game
  isPaused = !isPaused;
  pauseButton.textContent = isPaused ? "Resume Game" : "Pause Game";
  if (!isPaused) {
    update();
  }
});

resetButton.addEventListener("click", resetGame);
