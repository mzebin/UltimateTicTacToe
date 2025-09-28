document.addEventListener('DOMContentLoaded', () => {
    const mainBoard = document.getElementById('main-board');
    const statusMessage = document.getElementById('status-message');
    const resetButton = document.getElementById('reset-button');

    const PLAYER_X = 'X';
    const PLAYER_O = 'O';

    let currentPlayer;
    let gameActive;
    let activeBoard;
    
    let mainBoardState;

    let smallBoardsState;

    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    function initializeGame() {
        currentPlayer = PLAYER_X;
        gameActive = true;
        activeBoard = null;

        mainBoardState = Array(3).fill(null).map(() => Array(3).fill(null));

        smallBoardsState = Array(3).fill(null).map(() => 
            Array(3).fill(null).map(() => 
                Array(3).fill(null).map(() => Array(3).fill(null))
            )
        );

        mainBoard.innerHTML = '';
        document.querySelector('.game-app').classList.remove('game-over');
        updateStatusMessage("Player X's Turn");

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const smallBoard = document.createElement('div');
                smallBoard.classList.add('small-board');
                smallBoard.dataset.mainRow = i;
                smallBoard.dataset.mainCol = j;

                for (let k = 0; k < 3; k++) {
                    for (let l = 0; l < 3; l++) {
                        const cell = document.createElement('div');
                        cell.classList.add('cell');
                        cell.dataset.mainRow = i;
                        cell.dataset.mainCol = j;
                        cell.dataset.smallRow = k;
                        cell.dataset.smallCol = l;
                        
                        cell.addEventListener('click', handleCellClick);
                        smallBoard.appendChild(cell);
                    }
                }
                mainBoard.appendChild(smallBoard);
            }
        }
        updateActiveBoardHighlight();
    }

    function handleCellClick(event) {
        const cell = event.target;
        const { mainRow, mainCol, smallRow, smallCol } = cell.dataset;

        const isValidMove = gameActive && 
                            smallBoardsState[mainRow][mainCol][smallRow][smallCol] === null &&
                            (activeBoard === null || (activeBoard[0] == mainRow && activeBoard[1] == mainCol));

        if (!isValidMove) {
            return;
        }

        smallBoardsState[mainRow][mainCol][smallRow][smallCol] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer);

        const smallBoardResult = checkWinner(smallBoardsState[mainRow][mainCol].flat());

        if (smallBoardResult) {
            const smallWinner = smallBoardResult.winner;
            mainBoardState[mainRow][mainCol] = smallWinner;
            markBoardAsWon(mainRow, mainCol, smallWinner);

            const mainBoardResult = checkWinner(mainBoardState.flat());
            if (mainBoardResult && mainBoardResult.winner !== 'draw') {
                endGame(`Player ${mainBoardResult.winner} Wins the Game!`);
                return;
            }
        }

        if (!mainBoardState.flat().includes(null)) {
            endGame("It's a Draw!");
            return;
        }

        if (mainBoardState[smallRow][smallCol] !== null) {
            activeBoard = null;
        } else {
            activeBoard = [smallRow, smallCol];
        }

        switchPlayer();
        updateActiveBoardHighlight();
    }

    function checkWinner(board) {
        for (let i = 0; i < winningCombinations.length; i++) {
            const [a, b, c] = winningCombinations[i];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return { winner: board[a], combination: i }; // Return winner and combo index
            }
        }
        if (board.includes(null)) {
            return null;
        }
        return { winner: 'draw' };
    }


    function switchPlayer() {
        currentPlayer = (currentPlayer === PLAYER_X) ? PLAYER_O : PLAYER_X;
        updateStatusMessage(`Player ${currentPlayer}'s Turn`);
    }

    function endGame(message) {
        gameActive = false;
        activeBoard = null;
        updateStatusMessage(message);
        updateActiveBoardHighlight();
        document.querySelector('.game-app').classList.add('game-over');
    }

    function updateStatusMessage(message) {
        statusMessage.textContent = message;
    }

    function updateActiveBoardHighlight() {
        document.querySelectorAll('.small-board').forEach(board => {
            board.classList.remove('active-board');
            const { mainRow, mainCol } = board.dataset;
            if (activeBoard && activeBoard[0] == mainRow && activeBoard[1] == mainCol) {
                board.classList.add('active-board');
            }
        });
    }

    function markBoardAsWon(mainRow, mainCol, winner) {
        const smallBoard = document.querySelector(`.small-board[data-main-row='${mainRow}'][data-main-col='${mainCol}']`);
        smallBoard.classList.add('won-board');

        if (winner !== 'draw') {
            const winnerMark = document.createElement('div');
            winnerMark.classList.add('winner-mark', winner);
            winnerMark.textContent = winner;
            smallBoard.appendChild(winnerMark);
        }
    }

    resetButton.addEventListener('click', initializeGame);

    initializeGame();
});
