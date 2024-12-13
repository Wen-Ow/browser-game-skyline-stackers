/* ----------------------------- Initialization ---------------------------- */

document.addEventListener("DOMContentLoaded", () => {
initBoard();
currentPiece = generateNewPiece();
nextPiece = generateNewPiece();
updateUI();
gameLoop();
});

/*-------------------------------- Constants --------------------------------*/
const Tetrominoes = {
  I: { shape: [[1, 1, 1, 1]] },
  J: { shape: [[1, 0, 0], [1, 1, 1]] },
  L: { shape: [[0, 0, 1], [1, 1, 1]] },
  O: { shape: [[1, 1], [1, 1]] },
  S: { shape: [[0, 1, 1], [1, 1, 0]] },
  T: { shape: [[0, 1, 0], [1, 1, 1]] },
  Z: { shape: [[1, 1, 0], [0, 1, 1]] },
};

const boardWidth = 10;
const boardHeight = 20;
const cellSize = 30;
const colors = [
  "#FF5733", // Red
  "#33FF57", // Green
  "3357FF", // Blue
  "FF33A8", // Pink
  "F1C40F", // Yellow
  "1ABC9C", // Turquoise
  "8E44AD", // Purple
];

/*-------------------------------- Variables --------------------------------*/

let board = [];
let currentPiece;
let nextPiece;
let score = 0;
let level = 1;
let linesCleared = 0;
let isGameOver = false;

/*------------------------ Cached Element References ------------------------*/

const canvas = document.getElementById("tetris-board");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score-value");
const levelDisplay = document.getElementById("level-value");
const linesDisplay = document.getElementById("lines-value");
const nextCanvas = document.getElementById("next-piece");
const nextCtx = nextCanvas.getContext("2d");

/*-------------------------------- Classes --------------------------------*/

class Piece {
  constructor(shape, color) {
    this.shape = shape;
    this.color = color;
    this.x = Math.floor(boardWidth / 2) - Math.floor(this.shape[0].length / 2);
    this.y = 0;
    this.rotationIndex = 0;
  }

  rotate() {
    const newRotationIndex = (this.rotationIndex + 1) % this.shape.length;
    const rotatedShape = this.shape[newRotationIndex];
    if (!this.checkCollision(0, 0, rotatedShape)) {
      this.rotationIndex = newRotationIndex;
    }
  }

  move(dx, dy) {
    if (!this.checkCollision(dx, dy)) {
      this.x += dx;
      this.y += dy;
    } else if (dy > 0) {
      this.placePiece();
      currentPiece = nextPiece;
      nextPiece = generateNewPiece();
      if (this.checkCollision(0, 0)) {
        isGameOver = true;
        alert("Game Over!");
      }
    }
  }
}

checkCollision(dx, dy, shape = this.shape[this.rotationIndex]); {
    return shape.some((row, y) => {
        return row.some((cell, x) => {
            if (cell) {
                const newX = this.x + x + dx;
                const newY = this.y + y + dy;
                return (
                    newX < 0 || 
                    newX >= boardWidth || 
                    newY >= boardHeight || 
                    (newY >= 0 && board[newY][newX])
                );
            }
            return false;
        });
    });
}

placePiece() {
    this.shape[this.rotationIndex].forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell && this.y + y >= 0) {
                board[this.y + y][this.x + x] = this.color;
            }
        });
    });
    clearLines();
}

/*-------------------------------- Functions --------------------------------*/

function initBoard() {
        board = Array.from({ length: boardHeight }, () => Array(boardWidth).fill(0));
}

function generateNewPiece() {
    const shapes = Object.values(Tetrominoes);
    const randomIndex= Math.floor(Math.random() * shapes.length);
    return new Piece(shapes[randomIndex], colors[randomIndex]);
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    board.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                ctx.fillStyle = cell;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        });
    });
}

function drawPiece(piece, context = ctx) {
    piece.shape[piece.rotationIndex].forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                context.fillStyle = piece.color;
                context.fillRect(
                    (piece.x + x) * cellSize,
                    (piece.y + y) * cellSize,
                    cellSize,
                    cellSize
                );
            }
        });
    });
}

function clearLines() {
    board = board.filter(row => !row.every(cell => cell));
    const clearedLines = boardHeight - board.length;
    for (let i = 0; i < clearedLines; i++) {
        board.unshift(Array(boardWidth).fill(0));
    }
    score += clearedLines * 100;
    linesCleared += clearedLines;
    if (linesCleared >= level * 10) {
        level++;
    }
    updateUI();
}

function updateUI() {
    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;
    linesDisplay.textContent = linesCleared;
}

function gameLoop() {
        if (!isGameOver) {
            drawBoard();
            drawPiece(currentPiece);
            setTimeout(gameLoop, 1000 - level * 50);
        }
    }

/*----------------------------- Event Listeners -----------------------------*/

window.addEventListener("keydown", (event) => {
    if (!isGameOver) {
        switch (event.key) {
            case "ArrowLeft":
                currentPiece.move(-1, 0);
                break;
            case "ArrowRight":
                currentPiece.move(1, 0);
                break;
            case "ArrowDown":
                currentPiece.move(0, 1);
                break;
            case "ArrowUp":
                currentPiece.rotate();
                break;
            case " ": // Space bar for hard drop
                while (!currentPiece.checkCollision(0, 1)) {
                    currentPiece.move(0, 1);
                }
                break;
        }
    }
});


