// Summary for Core Game Mechanics

// Step by step 
/*
1. Initialize the Game Board:
Create a 2D array to represent the game board, with each cell initialized to zero (indicating an empty space).

2. Define Tetromino Shapes:
Define the shapes of the Tetrominoes using 2D arrays. Each shape should have multiple rotations.

3. Create a Piece Class:
Define a class to represent a Tetris piece. This class should include properties for the piece's shape, color, position (x and y coordinates), and rotation state.
Include methods for rotating the piece and moving it left, right, and down.

4. Generate a New Piece:
Create a function to generate a new piece. This function should randomly select a shape and color, and instantiate a new piece object.

5. Render the Game Board and Pieces:
Create a function to draw the game board and the current piece on the canvas. This function should iterate through the board array and the piece's shape array, drawing filled squares for non-zero values.

6. Handle User Input:
Add event listeners for keyboard inputs to control the piece. For example, use the arrow keys to move the piece left, right, and down, and to rotate it.

7. Check for Collisions:
Create a function to check for collisions. This function should:
Iterate through the piece's shape array.
Calculate the new position of each block in the piece based on the intended move or rotation.
Check if any block in the new position is out of bounds (left, right, or bottom) or overlaps with an occupied cell on the board.
Return true if a collision is detected, otherwise return false.

8. Move and Rotate the Piece:
Before moving or rotating the piece, call the collision detection function.
If no collision is detected, update the piece's position or rotation state.
If a collision is detected, prevent the move or rotation.

9. Place the Piece on the Board:
When the piece can no longer move down (i.e., a collision is detected when trying to move down), place the piece on the board.
Update the board array to include the piece's blocks at its current position.

10. Clear Completed Lines:
After placing a piece, check for any completed lines (rows where all cells are non-zero).
Remove completed lines from the board and add new empty lines at the top.
Update the score based on the number of lines cleared.

11. Generate the Next Piece:
After placing a piece and clearing lines, generate a new piece and set it as the current piece.
If the new piece cannot be placed (i.e., it collides immediately), end the game.

12. Game Loop:
Create a game loop function that continuously updates the game state.
In each iteration of the loop, move the current piece down by one cell.
Check for collisions and place the piece if necessary.
Redraw the game board and the current piece.
Adjust the game speed based on the current level.
*/
