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
    if (board[r].every((cell) => cell !== 0)) {
      board.splice(r, 1);
      board.unshift(new Array(COLS).fill(0));
      linesClearedThisTurn++;
    }
  }

  if (linesClearedThisTurn > 0) {
    linesCleared += linesClearedThisTurn;
    score += linesClearedThisTurn * 100;

    const newLevel = Math.floor(linesCleared / LINES_PER_LEVEL) + 1;
    if (newLevel > level) {
      level = newLevel;
      dropInterval = Math.max(200, 1000 - level * 100);
      displayLevelUpMessage();
    }

    updateStats();
  }
}

function clearRows() {
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

function dropPiece() {
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

function movePiece(direction) {
  currentPiece.x += direction;
  if (collide(board, currentPiece)) {
    currentPiece.x -= direction;
  }
}

function rotatePiece() {
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

function updateStats() {
  scoreDisplay.textContent = score;
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

  updateStats();
  draw();
  update();
}

function update(time = 0) {
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

function displayMessage(messageText, messageType) {
  const gameContainer = document.querySelector(".game-container");
  let messageContainer = document.getElementById("game-message");

  if (messageContainer) {
    gameContainer.removeChild(messageContainer);
  }

  messageContainer = document.createElement("div");
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

  if (messageType === "level-up") {
    setTimeout(() => {
      if (messageContainer.parentNode) {
        gameContainer.removeChild(messageContainer);
      }
    }, 2000);
  }
}

function displayLevelUpMessage() {
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
  isPaused = true;
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  displayMessage("Game Over!", "game-over");
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
