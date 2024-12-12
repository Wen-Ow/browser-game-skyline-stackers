/*-------------------------------- Graveyard for JS Pseudocode --------------------------------*/

/*
1. Initialize the Game Board:

function initGameBoard() {
    for each row in the game board array
        for each cell in the row
            cell = 0

2. Define Tetromino Shapes:

const tetrominoShapes = {
    'I': [
        [1, 1, 1, 1]
    ],
    'J': [
        [1, 0, 0],
        [1, 1, 1]
    ],
    'L': [
        [0, 0, 1],
        [1, 1, 1]
    ],
    'O': [
        [1, 1],
        [1, 1]
    ],
    'S': [
        [0, 1, 1],
        [1, 1, 0]
    ],
    'T': [
        [0, 1, 0],
        [1, 1, 1]
    ],
    'Z': [
        [1, 1, 0],
        [0, 1, 1]
    ]
}

3. Create a Peice Class:

 class Piece {

      constructor(shape, color) {

          this.shape = shape

          this.color = color

          this.x = 3 // Starting x position

          this.y = 0 // Starting y position

          this.rotationIndex = 0

          this.currentShape = this.shape[this.rotationIndex]

      }
      rotate() {

          this.rotationIndex = (this.rotationIndex + 1) % this.shape.length

          this.currentShape = this.shape[this.rotationIndex]

      }
      moveLeft() {

          this.x -= 1

      }
      moveRight() {

          this.x += 1

      }
      moveDown() {

          this.y += 1

      }

  }

4. Generate a New Piece:

function generateNewPiece() {
    
        const shape = tetrominoShapes[getRandomShape()]
    
        const color = getRandomColor()
    
        return new Piece(shape, color)
    
    }

5. Render the Game Board and Pieces:

function render() {
        
            drawBoard()
        
        
            drawPiece()
        
        }

6. Handle User Input:

function handleKeyPress(event) {

      if event.key == "ArrowLeft" then

          movePieceLeft()

      else if event.key == "ArrowRight" then

          movePieceRight()

      else if event.key == "ArrowDown" then

          movePieceDown()

      else if event.key == "ArrowUp" then

          rotatePiece()

  }

7. Check for Collisions:

function isCollision(piece, offsetX = 0, offsetY = 0) {

      for each row in piece.currentShape do

          for each cell in row do

              if cell is not 0 then

                  newX = piece.x + cell.x + offsetX

                  newY = piece.y + cell.y + offsetY

                  if newX is out of bounds or newY is out of bounds or board[newY][newX] is not 0 then

                      return true

      return false

  }

8. Move and Rotate the Piece:

function movePieceLeft() {

      if not isCollision(currentPiece, -1, 0) then

          currentPiece.moveLeft()

  }

 

  function movePieceRight() {

      if not isCollision(currentPiece, 1, 0) then

          currentPiece.moveRight()

  }

 

  function movePieceDown() {

      if not isCollision(currentPiece, 0, 1) then

          currentPiece.moveDown()

      else

          placePiece()

          currentPiece = generateNewPiece()

  }

 

  function rotatePiece() {

      originalRotation = currentPiece.rotationIndex

      currentPiece.rotate()

      if isCollision(currentPiece) then

          currentPiece.rotationIndex = originalRotation

          currentPiece.currentShape = currentPiece.shape[originalRotation]

  }

9. Place the Piece on the Board:

function placePiece() {

      for each row in currentPiece.currentShape do

          for each cell in row do

              if cell is not 0 then

                  board[currentPiece.y + cell.y][currentPiece.x + cell.x] = currentPiece.color

      checkForCompleteLines()

  }

10. Clear Completed Lines:

function checkForCompleteLines() {

      for each row in board do

          if row is complete then

              remove row

              add new empty row at top

              update score

  }

11. Generate the Next Piece:

 function generateNewPiece() {

      shape = random shape from TETROMINOES

      color = corresponding color

      newPiece = new Piece(shape, color)

      if isCollision(newPiece) then

          endGame()

      return newPiece

  }

12. Game Loop:

function gameLoop() {

      clear canvas

      drawBoard()

      drawPiece(currentPiece)

      movePieceDown()

      updateScore()

      setTimeout(gameLoop, gameSpeed)

  }


*/
