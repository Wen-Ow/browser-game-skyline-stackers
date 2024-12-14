/*-------------------------------- Initialization ---------------------------*/

document.addEventListener("DOMContentLoaded", () => {
  update();
});

/*-------------------------------- Constants --------------------------------*/

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const LINES_PER_LEVEL = 3;
const COLORS = [
  null,
  "cyan",
  "blue",
  "orange",
  "yellow",
  "green",
  "purple",
  "red",
];

/*---------------------------- Variables (state) ----------------------------*/

let board = createMatrix(COLS, ROWS);
let currentPiece = createPiece();
let nextPiece = createPiece();
let score = 0;
let level = 1;
let linesCleared = 0;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let isPaused = false;
let levelUpMessageDisplayed = false;

/*------------------------ Cached Element References ------------------------*/

const canvas = document.getElementById("tetris-board");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score-value");
const levelDisplay = document.getElementById("level-value");
const linesDisplay = document.getElementById("lines-value");
const pauseButton = document.getElementById("pause-btn");
const resetButton = document.getElementById("reset-btn");

/*-------------------------------- Functions --------------------------------*/

function createMatrix(width, height) {
  return Array.from({ length: height }, () => Array(width).fill(0));
}

function createPiece() {
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
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(board, { x: 0, y: 0 });
  drawMatrix(currentPiece.shape, { x: currentPiece.x, y: currentPiece.y });
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = COLORS[value];
        ctx.fillRect(
          (x + offset.x) * BLOCK_SIZE,
          (y + offset.y) * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        );
      }
    });
  });
}

function merge(matrix, piece) {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        matrix[y + piece.y][x + piece.x] = piece.color;
      }
    });
  });
}

function collide(matrix, piece) {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (
        piece.shape[y][x] !== 0 &&
        // Check boundaries and collisions
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

function clearLines() {
  let linesClearedThisTurn = 0;

  for (let r = ROWS - 1; r >= 0; r--) {
    // Start from the bottom
    if (board[r].every((cell) => cell !== 0)) {
      // Check if the row is full
      board.splice(r, 1); // Remove the row
      board.unshift(new Array(COLS).fill(0)); // Add a new empty row at the top
      linesClearedThisTurn++; // Increment cleared lines
      r++; // Recheck the same row since the board shifted
    }
  }

  if (linesClearedThisTurn > 0) {
    linesCleared += linesClearedThisTurn; // Update the total lines cleared

    let pointsEarned = 0;
    switch (linesClearedThisTurn) {
      case 1:
        pointsEarned = 100; // 100 points for 1 line
        break;
      case 2:
        pointsEarned = 300; // 300 points for 2 lines
        break;
      case 3:
        pointsEarned = 500; // 500 points for 3 lines
        break;
      case 4:
        pointsEarned = 800; // 800 points for 4 lines
        break;
    }
    score += pointsEarned; // Update the score

    const newLevel = Math.floor(linesCleared / LINES_PER_LEVEL) + 1; // Update the level after clearing enough lines
    if (newLevel > level) {
      level = newLevel;
      dropInterval = Math.max(200, 1000 - level * 100); // The higher the level, the faster the drop (minimum 200ms)
      displayLevelUpMessage(); // Display the level up message
    }

    updateStats(); // Update the stats on the screen
  }
}

function displayLevelUpMessage() {
  if (levelUpMessageDisplayed) return; // Prevent multiple messages from being displayed

  levelUpMessageDisplayed = true;
  const gameContainer = document.getElementById("game-container");

  const message = document.createElement("div"); // Create a message element
  message.className = "level-up-message";
  message.textContent = `Congratulations, you leveled up! You are now on ${level}!`;

  // Style the message
  message.style.position = "absolute";
  message.style.top = "50%";
  message.style.left = "50%";
  message.style.transform = "translate(-50%, -50%)";
  message.style.color = "white";
  message.style.fontSize = "2rem";
  message.style.textAlign = "center";
  message.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  message.style.padding = "1rem";
  message.style.borderRadius = "10px";
  gameContainer.appendChild(message);

  setTimeout(() => {
    // Set a timeout to remove the win message
    gameContainer.removeChild(message);
    levelUpMessageDisplayed = false; // Reset the flag after the message disappears
  }, 2000); // Message duration: 2 seconds
}

function clearRows() {
  for (let y = board.length - 1; y >= 0; y--) {
    if (board[y].every((value) => value !== 0)) {
      board.splice(y, 1); // remove filled row
      board.unshift(new Array(COLS).fill(0)); // add new empty row at the top
      score += 10;
      linesCleared++;
    }
  }
  level = Math.floor(linesCleared / LINES_PER_LEVEL) + 1;
  dropInterval = Math.max(200, 1000 - level * 50);
}

function dropPiece() {
  currentPiece.y++; // Move the piece down
  if (collide(board, currentPiece)) {
    currentPiece.y--; // Undo the move if the piece collides
    merge(board, currentPiece); // Merge the piece into the board
    clearLines(); // Ensure this call works without errors
    currentPiece = nextPiece; // Load the next piece
    nextPiece = createPiece(); // Create a new next piece

    if (collide(board, currentPiece)) {
      gameOver(); // Trigger game over if new piece collides
      return; // Prevent further game loop execution
    }
  }
  dropCounter = 0; // Reset the drop counter
}

function movePiece(direction) {
  currentPiece.x += direction;
  if (collide(board, currentPiece)) {
    currentPiece.x -= direction;
  }
}

function rotatePiece() {
  const rotatedShape = currentPiece.shape.map(
    (
      _,
      index // Clone the current piece shape
    ) => currentPiece.shape.map((row) => row[index]).reverse()
  );

  const originalX = currentPiece.x; // Store the original x position
  let offset = 1; // Initialize the offset

  while (collide(board, { ...currentPiece, shape: rotatedShape })) {
    currentPiece.x += offset % 2 === 0 ? -offset : offset; // Move the piece left or right
    offset++;
    if (offset > currentPiece.shape[0].length) {
      // If the piece is stuck
      currentPiece.x = originalX; // Reset the x position
      return; // Cancel the rotation
    }
  }
  currentPiece.shape = rotatedShape; // Update the piece shape
}

function updateStats() {
  scoreDisplay.textContent = score; // Update score in the DOM
  levelDisplay.textContent = level;
  linesDisplay.textContent = linesCleared;
}

function resetGame() {
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

  updateStats(); // reset stats on the screen
  draw(); // redraw the board
  update(); // start the game loop
}

function update(time = 0) {
  // game loop
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

function displayGameOverMessage() {
  const gameContainer = document.getElementById("game-container");

  let messageContainer = document.getElementById("game-message");
  if (!messageContainer) {
    messageContainer = document.createElement("div");
    messageContainer.id = "game-message";
    messageContainer.textContent = "Game Over!";
    messageContainer.style.position = "absolute";
    messageContainer.style.top = "50%";
    messageContainer.style.left = "50%";
    messageContainer.style.transform = "translate(-50%, -50%)";
    messageContainer.style.color = "white";
    messageContainer.style.fontSize = "2rem";
    messageContainer.style.textAlign = "center";
    messageContainer.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    messageContainer.style.padding = "1rem";
    messageContainer.style.borderRadius = "10px";
    gameContainer.appendChild(messageContainer);
  }
}

function gameOver() {
  displayGameOverMessage();
  isPaused = true;

  ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // darken the board
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/*----------------------------- Event Listeners -----------------------------*/

document.addEventListener("keydown", (e) => {
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
  isPaused = !isPaused;
  pauseButton.textContent = isPaused ? "Resume Game" : "Pause Game";
  if (!isPaused) {
    update();
  }
});

resetButton.addEventListener("click", resetGame);
