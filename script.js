document.addEventListener('DOMContentLoaded', () => {
    // ==================================================================================
    // Game State Variables
    // ==================================================================================

    let currentMode = 'normal'; // 'normal' or 'ultimate'
    let gameType = 'local'; // 'local' or 'computer'
    let difficulty = 'easy'; // 'easy', 'moderate', or 'impossible'
    let currentPlayer = 'X'; // 'X' or 'O'
    let gameActive = false;
    let scores = { X: 0, O: 0 };
    let boardState = Array(9).fill(null); // For Normal Mode
    
    // For Ultimate Mode
    let ultimateBoardState;
    let subBoardWinners;
    let activeSubBoard;


    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]  // diagonals
    ];

    // ==================================================================================
    // DOM Elements
    // ==================================================================================

    const normalModeBtn = document.getElementById('normal-mode-btn');
    const ultimateModeBtn = document.getElementById('ultimate-mode-btn');
    const gameInfo = document.getElementById('game-info');
    const gameConfigSection = document.getElementById('game-config');
    const gameArea = document.getElementById('game-area');
    const boardContainer = document.getElementById('main-board');
    const playerTurnInfo = document.getElementById('player-turn');
    const gameStatusInfo = document.getElementById('game-status');
    const scoreX = document.getElementById('score-x');
    const scoreO = document.getElementById('score-o');
    const resetBtn = document.getElementById('reset-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const gameTypeSelect = document.getElementById('game-type');
    const difficultySelect = document.getElementById('difficulty');
    const difficultySelection = document.getElementById('difficulty-selection');
    const startGameBtn = document.getElementById('start-game-btn');

    // ==================================================================================
    // Event Listeners
    // ==================================================================================

    normalModeBtn.addEventListener('click', () => switchMode('normal'));
    ultimateModeBtn.addEventListener('click', () => switchMode('ultimate'));
    gameTypeSelect.addEventListener('change', handleGameTypeChange);
    difficultySelect.addEventListener('change', () => difficulty = difficultySelect.value);
    startGameBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    backToMenuBtn.addEventListener('click', backToMenu);

    // ==================================================================================
    // Game Flow
    // ==================================================================================

    function switchMode(mode) {
        currentMode = mode;
        normalModeBtn.classList.toggle('active', mode === 'normal');
        ultimateModeBtn.classList.toggle('active', mode === 'ultimate');
        document.getElementById('normal-config').style.display = mode === 'normal' ? 'block' : 'none';
        document.getElementById('ultimate-config').style.display = mode === 'ultimate' ? 'block' : 'none';
        if (mode === 'normal') {
            handleGameTypeChange();
        }
    }

    function handleGameTypeChange() {
        gameType = gameTypeSelect.value;
        difficultySelection.style.display = gameType === 'computer' ? 'block' : 'none';
    }

    function startGame() {
        gameConfigSection.style.display = 'none';
        gameArea.style.display = 'block';
        gameInfo.style.display = 'block';
        document.querySelector('.mode-selection').style.display = 'none';

        // Start point of the game
        gameActive = true;
        currentPlayer = 'X';
        gameStatusInfo.textContent = '';

        if (currentMode === 'normal') {
            gameType = gameTypeSelect.value;
            difficulty = difficultySelect.value;
            createNormalBoard();
            if (gameType === 'computer' && currentPlayer === 'X') {
                playerTurnInfo.textContent = 'Computer is thinking...';
                setTimeout(computerMove, 500);
            } else {
                playerTurnInfo.textContent = `Player ${currentPlayer}'s Turn`;
            }
        } else {
            createUltimateBoard();
            playerTurnInfo.textContent = `Player ${currentPlayer}'s Turn`;
        }
    }

    function resetGame() {
        gameActive = true;
        currentPlayer = 'X';
        gameStatusInfo.textContent = '';
        const winningLine = boardContainer.querySelector('.winning-line');
        if (winningLine) winningLine.remove();

        if (currentMode === 'normal') {
            createNormalBoard();
            if (gameType === 'computer' && currentPlayer === 'X') {
                playerTurnInfo.textContent = 'Computer is thinking...';
                setTimeout(computerMove, 500);
            } else {
                playerTurnInfo.textContent = `Player ${currentPlayer}'s Turn`;
            }
        } else {
            createUltimateBoard();
            playerTurnInfo.textContent = `Player ${currentPlayer}'s Turn`;
        }
    }

    function backToMenu() {
        gameArea.style.display = 'none';
        gameInfo.style.display = 'none';
        gameConfigSection.style.display = 'block';
        document.querySelector('.mode-selection').style.display = 'flex';
        scores = { X: 0, O: 0 };
        updateScore();
        const winningLine = boardContainer.querySelector('.winning-line');
        if (winningLine) winningLine.remove();
    }

    // ==================================================================================
    // Board Creation
    // ==================================================================================

    function createNormalBoard() {
        boardContainer.innerHTML = '';
        boardContainer.className = 'normal-board';
        boardState = Array(9).fill(null);
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            cell.addEventListener('click', handleNormalCellClick);
            boardContainer.appendChild(cell);
        }
    }

    function createUltimateBoard() {
        boardContainer.innerHTML = '';
        boardContainer.className = 'ultimate-board';
        ultimateBoardState = Array(9).fill(null).map(() => Array(9).fill(null));
        subBoardWinners = Array(9).fill(null);
        activeSubBoard = null; // Any board is playable at the start

        for (let i = 0; i < 9; i++) {
            const subBoard = document.createElement('div');
            subBoard.classList.add('sub-board');
            subBoard.dataset.subBoardIndex = i;
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.subBoardIndex = i;
                cell.dataset.cellIndex = j;
                cell.addEventListener('click', handleUltimateCellClick);
                subBoard.appendChild(cell);
            }
            boardContainer.appendChild(subBoard);
        }
        updateActiveSubBoardHighlight();
    }

    // ==================================================================================
    // Normal Mode Logic
    // ==================================================================================

    function handleNormalCellClick(e) {
        if (!gameActive) return;
        const cell = e.target;
        const index = parseInt(cell.dataset.index);

        if (gameType === 'computer' && currentPlayer === 'X') {
            return; // Not player's turn
        }

        if (boardState[index] !== null) {
            return; // Cell already taken
        }

        const playerToMove = gameType === 'computer' ? 'O' : currentPlayer;
        makeMove(index, playerToMove);

        const winningCombination = checkWin(playerToMove, boardState);
        if (winningCombination) {
            handleGameEnd(false, winningCombination);
        } else if (boardState.every(cell => cell !== null)) {
            handleGameEnd(true, null);
        } else {
            if (gameType === 'local') {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                playerTurnInfo.textContent = `Player ${currentPlayer}'s Turn`;
            } else {
                currentPlayer = 'X';
                playerTurnInfo.textContent = 'Computer is thinking...';
                setTimeout(computerMove, 700);
            }
        }
    }

    function makeMove(index, player) {
        boardState[index] = player;
        const cell = boardContainer.querySelector(`[data-index='${index}']`);
        cell.classList.add(player);
        cell.textContent = player;
    }

    // ==================================================================================
    // Ultimate Mode Logic
    // ==================================================================================

    function handleUltimateCellClick(e) {
        const cell = e.target;
        const subBoardIndex = parseInt(cell.dataset.subBoardIndex);
        const cellIndex = parseInt(cell.dataset.cellIndex);

        if (!gameActive || ultimateBoardState[subBoardIndex][cellIndex] !== null || subBoardWinners[subBoardIndex] !== null) return;
        if (activeSubBoard !== null && activeSubBoard !== subBoardIndex) return;

        ultimateBoardState[subBoardIndex][cellIndex] = currentPlayer;
        cell.classList.add(currentPlayer);
        cell.textContent = currentPlayer;

        const subBoardResult = checkWin(currentPlayer, ultimateBoardState[subBoardIndex]);
        if (subBoardResult) {
            subBoardWinners[subBoardIndex] = currentPlayer;
            markSubBoardAsWon(subBoardIndex, currentPlayer);
            const mainBoardResult = checkWin(currentPlayer, subBoardWinners);
            if (mainBoardResult) {
                endUltimateGame(currentPlayer, mainBoardResult);
                return;
            }
        } else if (ultimateBoardState[subBoardIndex].every(c => c !== null)) {
            subBoardWinners[subBoardIndex] = 'D'; // Mark as Draw
        }

        if (subBoardWinners.every(w => w !== null)) {
            endUltimateGame(null, null); // It's a draw
            return;
        }

        activeSubBoard = cellIndex;
        if (subBoardWinners[activeSubBoard] !== null) {
            activeSubBoard = null; // If next board is won/drawn, any board is playable
        }

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        playerTurnInfo.textContent = `Player ${currentPlayer}'s Turn`;
        updateActiveSubBoardHighlight();
    }

    // ==================================================================================
    // AI Logic
    // ==================================================================================

    function computerMove() {
        if (!gameActive) return;
        let moveIndex;
        switch (difficulty) {
            case 'easy': moveIndex = easyMove(); break;
            case 'moderate': moveIndex = moderateMove(); break;
            case 'impossible': moveIndex = impossibleMove(); break;
        }
        makeMove(moveIndex, 'X');
        const winningCombination = checkWin('X', boardState);
        if (winningCombination) {
            currentPlayer = 'X';
            handleGameEnd(false, winningCombination);
        } else if (boardState.every(cell => cell !== null)) {
            handleGameEnd(true, null);
        } else {
            currentPlayer = 'O';
            playerTurnInfo.textContent = `Your Turn (O)`;
        }
    }

    function easyMove() {
        // Random choice from available cells
        const available = boardState.map((c, i) => c === null ? i : null).filter(i => i !== null);
        return available[Math.floor(Math.random() * available.length)];
    }

    function moderateMove() {
        // A strategic choice from available cells
        /* Logic
        if computer can win in one move, go for it, else
        if computer can stop player from winning in one move, go for it, else
        go for random corners, center, or edges */
        for (let p of ['X', 'O']) {
            for (let i = 0; i < 9; i++) {
                if (boardState[i] === null) {
                    boardState[i] = p;
                    if (checkWin(p, boardState)) { boardState[i] = null; return i; }
                    boardState[i] = null;
                }
            }
        }

        const corners = [0, 2, 6, 8].filter(i => boardState[i] === null);
        if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

        if (boardState[4] === null) return 4;

        const edges = [1, 3, 5, 7].filter(i => boardState[i] === null);
        if (edges.length > 0) return edges[Math.floor(Math.random() * edges.length)];

        return easyMove();
    }

    function impossibleMove() {
        // Minimax algrithm to get the best possible move

        // First move using this is always 0, so to make it more random
        // first move is a random corner
        const isFirstMove = boardState.every(cell => cell === null);
        if (isFirstMove) {
            const corners = [0, 2, 6, 8];
            return corners[Math.floor(Math.random() * corners.length)];
        }

        return minimax(boardState, 'X').index;
    }

    function minimax(newBoard, player) {
        const available = newBoard.map((c, i) => c === null ? i : null).filter(i => i !== null);

        if (checkWin('O', newBoard)) return { score: -10 };
        if (checkWin('X', newBoard)) return { score: 10 };
        if (available.length === 0) return { score: 0 };

        const moves = [];
        for (let i = 0; i < available.length; i++) {
            const move = { index: available[i] };
            newBoard[available[i]] = player;
            const result = minimax(newBoard, player === 'X' ? 'O' : 'X');
            move.score = result.score;
            newBoard[available[i]] = null;
            moves.push(move);
        }

        let bestMove;
        if (player === 'X') {
            let bestScore = -10000;
            moves.forEach((move, i) => { if (move.score > bestScore) { bestScore = move.score; bestMove = i; } });
        } else {
            let bestScore = 10000;
            moves.forEach((move, i) => { if (move.score < bestScore) { bestScore = move.score; bestMove = i; } });
        }
        return moves[bestMove];
    }

    // ==================================================================================
    // Win/Draw Logic
    // ==================================================================================

    function handleGameEnd(isDraw, winningCombination) {
        gameActive = false;
        const winner = isDraw ? null : currentPlayer;
        playerTurnInfo.textContent = '';
        if (isDraw) {
            gameStatusInfo.textContent = "It's a Draw!";
        } else {
            gameStatusInfo.textContent = `Player ${winner} Wins!`;
            scores[winner]++;
            updateScore();
            if (currentMode === 'normal' && winningCombination) {
                drawWinningLine(winningCombination);
            }
        }
    }

    function endUltimateGame(winner, combination) {
        gameActive = false;
        playerTurnInfo.textContent = '';
        activeSubBoard = null;
        updateActiveSubBoardHighlight();

        if (winner) {
            gameStatusInfo.textContent = `Player ${winner} Wins!`;
            scores[winner]++;
            updateScore();
            if (combination) {
                boardContainer.classList.add('game-over');
                combination.forEach(i => {
                    document.querySelector(`[data-sub-board-index='${i}']`).classList.add('winning-sub-board');
                });
            }
        } else {
            gameStatusInfo.textContent = "It's a Draw!";
        }
    }

    function checkWin(player, board) {
        const combination = winningCombinations.find(c => c.every(index => board[index] === player));
        return combination || null;
    }

    // ==================================================================================
    // UI Update Functions
    // ==================================================================================

    function updateScore() {
        scoreX.textContent = `X: ${scores.X}`;
        scoreO.textContent = `O: ${scores.O}`;
    }

    function drawWinningLine(combination) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('winning-line');
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const boardRect = boardContainer.getBoundingClientRect();
        const cells = document.querySelectorAll('.normal-board .cell');
        const startRect = cells[combination[0]].getBoundingClientRect();
        const endRect = cells[combination[2]].getBoundingClientRect();

        const x1 = startRect.left - boardRect.left + startRect.width / 2;
        const y1 = startRect.top - boardRect.top + startRect.height / 2;
        const x2 = endRect.left - boardRect.left + endRect.width / 2;
        const y2 = endRect.top - boardRect.top + endRect.height / 2;

        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);

        svg.appendChild(line);
        boardContainer.appendChild(svg);
    }

    function markSubBoardAsWon(subBoardIndex, winner) {
        const subBoard = document.querySelector(`[data-sub-board-index='${subBoardIndex}']`);
        subBoard.classList.add('won-board');
        const winnerMark = document.createElement('div');
        winnerMark.classList.add('winner-mark', winner);
        winnerMark.textContent = winner;
        subBoard.appendChild(winnerMark);
    }

    function updateActiveSubBoardHighlight() {
        document.querySelectorAll('.sub-board').forEach((subBoard, index) => {
            const isPlayable = !subBoardWinners[index] && (activeSubBoard === null || activeSubBoard === index);
            subBoard.classList.toggle('active-board', isPlayable);
        });
    }

    // ==================================================================================
    // Help Modal Logic
    // ==================================================================================

    const helpModal = document.getElementById('help-modal');
    const helpBtn = document.getElementById('help-btn');
    const closeBtn = document.querySelector('.close-btn');

    function showHelpModal() {
        helpModal.style.display = 'block';
    }

    function hideHelpModal() {
        helpModal.style.display = 'none';
    }

    helpBtn.addEventListener('click', showHelpModal);
    closeBtn.addEventListener('click', hideHelpModal);
    window.addEventListener('click', (event) => {
        if (event.target == helpModal) {
            hideHelpModal();
        }
    });

    // ==================================================================================
    // Initial Setup
    // ==================================================================================

    switchMode('normal');
    showHelpModal(); // Show help modal on page load
});