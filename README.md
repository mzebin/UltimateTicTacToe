# Ultimate Tic Tac Toe

A modern implementation of the classic Tic Tac Toe game, featuring both Normal and Ultimate modes. Play locally against a friend or challenge the computer with three difficulty levels.

## Features

- Two game modes:
  - **Normal Mode**: Traditional 3x3 Tic Tac Toe.
  - **Ultimate Mode**: A larger 9x9 board composed of nine 3x3 sub‑boards, where each move determines the next sub‑board to play in.
- Play options:
  - **Local Game**: Two players take turns on the same device.
  - **Vs Computer**: Play against an AI with three difficulty settings: Easy, Moderate, and Impossible.
- Score tracking for both players.
- Responsive design that works on desktop and mobile devices.
- Help modal with instructions for both game modes.

## How to Play

### Normal Mode

- The game is played on a 3x3 grid.
- Players alternate placing their mark (X or O) in an empty cell.
- The first player to get three of their marks in a row (horizontally, vertically, or diagonally) wins.
- If all nine cells are filled without a winner, the game is a draw.
- In Vs Computer mode, you play as O and the computer as X.

### Ultimate Mode

- The board consists of a 3x3 grid of sub‑boards, each a 3x3 Tic Tac Toe board.
- Your move in a cell of a sub‑board sends your opponent to the corresponding sub‑board. For example, playing in the top‑right cell of a sub‑board forces your opponent to play in the top‑right sub‑board.
- If the target sub‑board is already won or full, your opponent may play in any empty cell on the entire board.
- To win the game, you must win three sub‑boards in a row (horizontally, vertically, or diagonally) on the main grid.
- A sub‑board is won when a player gets three in a row inside that sub‑board. If a sub‑board fills without a winner, it is considered drawn and cannot be played further.