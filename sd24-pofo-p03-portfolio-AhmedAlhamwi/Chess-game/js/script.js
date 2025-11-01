// Piece Icons configuration
const pieceIcons = {
    1: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
    2: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
    3: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
    4: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
    5: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
    6: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
    '-1': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
    '-2': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
    '-3': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
    '-4': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
    '-5': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
    '-6': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg'
};

// Initial board setup
const initialBoard = [
    [-2, -3, -4, -5, -6, -4, -3, -2],
    [-1, -1, -1, -1, -1, -1, -1, -1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [2, 3, 4, 5, 6, 4, 3, 2]
];

let currentBoard = JSON.parse(JSON.stringify(initialBoard));
let selectedPiece = null;
let currentPlayer = 1;
// Add at the top with other game state variables
let moveHistory = [];
let undoMovesLeft = 5;
let moveStack = [];
let playerName = '';
let playerSide = 1; // 1 for white, -1 for black

function showPlayerSetup() {
    const setupDialog = document.createElement('div');
    setupDialog.className = 'setup-dialog';
    setupDialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border: 2px solid #333;
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    setupDialog.innerHTML = `
        <h2 style="margin-bottom: 20px;">Welcome to Chess!</h2>
        <input type="text" id="player-name" placeholder="Enter your name" style="margin-bottom: 15px; padding: 5px;">
        <div style="margin-bottom: 15px;">
            <button id="white-side" style="margin-right: 10px;">Play as White</button>
            <button id="black-side">Play as Black</button>
        </div>
    `;

    document.body.appendChild(setupDialog);

    document.getElementById('white-side').addEventListener('click', () => startGame(1));
    document.getElementById('black-side').addEventListener('click', () => startGame(-1));

    function startGame(side) {
        const nameInput = document.getElementById('player-name');
        playerName = nameInput.value.trim() || 'Player';
        playerSide = side;
        currentPlayer = 1;
        
        document.body.removeChild(setupDialog);
        createBoard();
        updateTurnIndicator();
        
        showCheckWarning(`Welcome ${playerName}! You're playing as ${side === 1 ? 'White' : 'Black'}`);
        
        if (playerSide === -1) {
            setTimeout(makeComputerMove, 500);
        }
    }
}

function storeMoveForUndo() {
    moveStack.push({
        board: JSON.parse(JSON.stringify(currentBoard)),
        player: currentPlayer * -1,
        moveHistory: [...moveHistory],
        timestamp: new Date().toLocaleTimeString(),
        capturedPiece: null // Will be set when a piece is captured
    });
}

function undoMove() {
    if (undoMovesLeft > 0 && moveStack.length >= 2) {
        // Undo computer's move first
        const computerMove = moveStack.pop();
        // Then undo player's move
        const playerMove = moveStack.pop();
        
        // Add fade out animation
        const board = document.getElementById('chess-board');
        board.style.opacity = '0.5';
        
        setTimeout(() => {
            // Restore to player's previous position
            currentBoard = playerMove.board;
            currentPlayer = 1; // Always return to player's turn (white)
            moveHistory = playerMove.moveHistory;
            undoMovesLeft--;
            
            createBoard();
            updateMoveHistoryDisplay();
            updateTurnIndicator();
            updateUndoButton();
            
            // Fade back in
            board.style.opacity = '1';
            board.style.transition = 'opacity 0.3s ease-in';
            
            // Show feedback message
            showCheckWarning("Moved back to your turn!");
        }, 300);
    } else {
        showCheckWarning("Cannot undo at this point!");
    }
}


function updateUndoButton() {
    const undoButton = document.querySelector('.undo-move');
    undoButton.textContent = `Undo Move (${undoMovesLeft} left)`;
    undoButton.disabled = undoMovesLeft === 0;
}

function recordMove(startRow, startCol, endRow, endCol, piece) {
    const files = 'abcdefgh';
    const ranks = '87654321';
    const moveText = `${Math.abs(piece) > 1 ? pieceToSymbol(piece) : ''}${files[startCol]}${ranks[startRow]} → ${files[endCol]}${ranks[endRow]}`;
    moveHistory.push(moveText);
    updateMoveHistoryDisplay();
}

function updateMoveHistoryDisplay() {
    const historyDiv = document.getElementById('move-history');
    historyDiv.innerHTML = moveHistory.map((move, i) => 
        `<div class="move">${Math.floor(i/2 + 1)}. ${move}</div>`
    ).join('');
    historyDiv.scrollTop = historyDiv.scrollHeight;
}

function pieceToSymbol(piece) {
    const symbols = {2: 'R', 3: 'N', 4: 'B', 5: 'Q', 6: 'K'};
    return symbols[Math.abs(piece)] || '';
}

function createBoard() {
    const chessBoard = document.getElementById('chess-board');
    chessBoard.innerHTML = '';

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
            square.dataset.row = row;
            square.dataset.col = col;

            const piece = currentBoard[row][col];
            if (piece !== 0) {
                const pieceElement = document.createElement('div');
                pieceElement.className = 'piece';
                pieceElement.style.backgroundImage = `url(${pieceIcons[piece]})`;
                square.appendChild(pieceElement);
            }

            square.addEventListener('click', handleSquareClick);
            chessBoard.appendChild(square);
        }
    }
}

function isInCheck(player) {
    let kingRow, kingCol;
    
    // Find king position with early exit
    kingSearch: for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (currentBoard[row][col] === player * 6) {
                kingRow = row;
                kingCol = col;
                break kingSearch;
            }
        }
    }

    // Check for attacking pieces
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];
    
    // Knight attack positions
    const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    // Check knight attacks
    for (const [rowOffset, colOffset] of knightMoves) {
        const row = kingRow + rowOffset;
        const col = kingCol + colOffset;
        if (row >= 0 && row < 8 && col >= 0 && col < 8) {
            const piece = currentBoard[row][col];
            if (piece * player < 0 && Math.abs(piece) === 3) {
                return true;
            }
        }
    }

    // Check other pieces
    for (const [rowDir, colDir] of directions) {
        let row = kingRow + rowDir;
        let col = kingCol + colDir;
        let distance = 1;

        while (row >= 0 && row < 8 && col >= 0 && col < 8) {
            const piece = currentBoard[row][col];
            if (piece !== 0) {
                if (piece * player < 0) {
                    const pieceType = Math.abs(piece);
                    if (
                        (distance === 1 && pieceType === 6) || // King
                        (distance === 1 && pieceType === 1 && rowDir * player > 0) || // Pawn
                        (pieceType === 5) || // Queen
                        (pieceType === 2 && (rowDir === 0 || colDir === 0)) || // Rook
                        (pieceType === 4 && rowDir !== 0 && colDir !== 0) // Bishop
                    ) {
                        return true;
                    }
                }
                break;
            }
            row += rowDir;
            col += colDir;
            distance++;
        }
    }

    return false;
}



function isCheckmate(player) {
    if (!isInCheck(player)) return false;

    for (let startRow = 0; startRow < 8; startRow++) {
        for (let startCol = 0; startCol < 8; startCol++) {
            if (currentBoard[startRow][startCol] * player > 0) {
                for (let endRow = 0; endRow < 8; endRow++) {
                    for (let endCol = 0; endCol < 8; endCol++) {
                        if (canMoveWithoutCheck(startRow, startCol, endRow, endCol, player)) {
                            return false;
                        }
                    }
                }
            }
        }
    }
    return true;
}

function isStalemate(player) {
    if (isInCheck(player)) return false;

    for (let startRow = 0; startRow < 8; startRow++) {
        for (let startCol = 0; startCol < 8; startCol++) {
            if (currentBoard[startRow][startCol] * player > 0) {
                for (let endRow = 0; endRow < 8; endRow++) {
                    for (let endCol = 0; endCol < 8; endCol++) {
                        if (canMoveWithoutCheck(startRow, startCol, endRow, endCol, player)) {
                            return false;
                        }
                    }
                }
            }
        }
    }
    return true;
}

function canMoveWithoutCheck(startRow, startCol, endRow, endCol, player) {
    const cacheKey = getCacheKey(startRow, startCol, endRow, endCol, player);
    
    if (moveCache.has(cacheKey)) {
        return moveCache.get(cacheKey);
    }

    // Use isValidMove instead of validateMove
    if (!isValidMove(startRow, startCol, endRow, endCol)) {
        moveCache.set(cacheKey, false);
        return false;
    }

    // Test the move by temporarily making it
    const tempPiece = currentBoard[endRow][endCol];
    currentBoard[endRow][endCol] = currentBoard[startRow][startCol];
    currentBoard[startRow][startCol] = 0;

    const inCheck = isInCheck(player);

    // Undo the test move
    currentBoard[startRow][startCol] = currentBoard[endRow][endCol];
    currentBoard[endRow][endCol] = tempPiece;

    const result = !inCheck;
    moveCache.set(cacheKey, result);
    
    if (moveCache.size > 1000) {
        moveCache.clear();
    }
    
    return result;
}

// Add to top of file with other state variables
let isInCheckState = false;

function handleSquareClick(event) {
    const square = event.currentTarget;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    const piece = currentBoard[row][col];

    clearHighlights();

    // First click - piece selection
    if (!selectedPiece) {
        if (piece !== 0 && Math.sign(piece) === currentPlayer) {
            // If in check, only allow moves that can resolve check
            if (isInCheckState && !canResolveCheck(row, col)) {
                showCheckWarning("This piece cannot resolve the check!");
                return;
            }
            selectedPiece = { row, col };
            square.classList.add('selected');
            highlightValidMoves(row, col);
        }
        return;
    }

    // Second click - move execution
    if (canMoveWithoutCheck(selectedPiece.row, selectedPiece.col, row, col, currentPlayer)) {
        const moveResult = executeMove(selectedPiece.row, selectedPiece.col, row, col);
        if (!moveResult) {
            selectedPiece = null;
            return;
        }

        const opponent = currentPlayer * -1;
        isInCheckState = isInCheck(opponent);
        
        if (isInCheckState) {
            if (isCheckmate(opponent)) {
                alert(`Checkmate! ${currentPlayer === 1 ? 'White' : 'Black'} wins!`);
                resetGame();
                return;
            }
            showCheckWarning(`${currentPlayer === 1 ? 'Black' : 'White'} is in check!`);
        } else if (isStalemate(opponent)) {
            alert("Stalemate! The game is a draw!");
            resetGame();
            return;
        }
        if (isInCheck(opponent)) {
            alert("Check!");
        }

        currentPlayer *= -1;
        updateTurnIndicator();
    }

    if (currentPlayer === -1) {
        setTimeout(makeComputerMove, 500);
    }
    selectedPiece = null;
}

function showCheckWarning(message) {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'check-warning';
    warningDiv.textContent = message;
    warningDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #ff4444;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: fadeOut 2s forwards;
    `;
    document.body.appendChild(warningDiv);
    setTimeout(() => warningDiv.remove(), 2000);
}

function canResolveCheck(row, col) {
    for (let endRow = 0; endRow < 8; endRow++) {
        for (let endCol = 0; endCol < 8; endCol++) {
            if (canMoveWithoutCheck(row, col, endRow, endCol, currentPlayer)) {
                // Test if this move resolves check
                const tempPiece = currentBoard[endRow][endCol];
                currentBoard[endRow][endCol] = currentBoard[row][col];
                currentBoard[row][col] = 0;
                
                const stillInCheck = isInCheck(currentPlayer);
                
                // Undo test move
                currentBoard[row][col] = currentBoard[endRow][endCol];
                currentBoard[endRow][endCol] = tempPiece;
                
                if (!stillInCheck) return true;
            }
        }
    }
    return false;
}

// Add to makeComputerMove function
function makeComputerMove() {
    const bestMove = findBestMove(-1);
    if (bestMove) {
        const { startRow, startCol, endRow, endCol } = bestMove;
        
        currentBoard[endRow][endCol] = currentBoard[startRow][startCol];
        currentBoard[startRow][startCol] = 0;
        
        createBoard();
        
        isInCheckState = isInCheck(1);
        if (isInCheckState) {
            if (isCheckmate(1)) {
                alert("Checkmate! Black (Computer) wins!");
                resetGame();
                return;
            }
            showCheckWarning("White is in check!");
        } else if (isStalemate(1)) {
            alert("Stalemate! The game is a draw!");
            resetGame();
            return;
        }
        
        currentPlayer = 1;
        updateTurnIndicator();
    }
}


function executeMove(startRow, startCol, endRow, endCol) {
    const movingPiece = currentBoard[startRow][startCol];
    const capturedPiece = currentBoard[endRow][endCol];

    storeMoveForUndo(); // Add this line

    currentBoard[endRow][endCol] = movingPiece;
    currentBoard[startRow][startCol] = 0;

    if (isInCheck(currentPlayer)) {
        currentBoard[startRow][startCol] = movingPiece;
        currentBoard[endRow][endCol] = capturedPiece;
        return false;
    }

    recordMove(startRow, startCol, endRow, endCol, movingPiece);
    createBoard();
    return true;
}


function animateMove(startRow, startCol, endRow, endCol) {
    const piece = document.querySelector(`#cell_${startRow}_${startCol} .piece`);
    const targetCell = document.querySelector(`#cell_${endRow}_${endCol}`);
    
    if (piece && targetCell) {
        const rect = targetCell.getBoundingClientRect();
        piece.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
        
        setTimeout(() => {
            createBoard();
            document.querySelector(`#cell_${endRow}_${endCol}`).classList.add('last-move');
        }, 300);
    }
}

function checkPawnPromotion(row, col) {
    const piece = currentBoard[row][col];
    if (Math.abs(piece) === 1) {
        const promotionRow = piece === 1 ? 0 : 7;
        if (row === promotionRow) {
            return new Promise((resolve) => {
                showPromotionDialog(row, col, resolve);
            });
        }
    }
    return Promise.resolve(false);
}

async function handleMove(startRow, startCol, endRow, endCol) {
    const piece = currentBoard[startRow][startCol];
    currentBoard[endRow][endCol] = piece;
    currentBoard[startRow][startCol] = 0;
    
    await checkPawnPromotion(endRow, endCol);
    createBoard();
}


function showPromotionDialog(row, col) {
    const promotionDialog = document.createElement('div');
    promotionDialog.className = 'promotion-dialog';
    promotionDialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border: 2px solid #333;
        z-index: 1000;
    `;

    const pieces = currentPlayer === 1 ? [2, 3, 4, 5] : [-2, -3, -4, -5];
    pieces.forEach(pieceType => {
        const pieceOption = document.createElement('div');
        pieceOption.style.cssText = `
            width: 60px;
            height: 60px;
            background-image: url(${pieceIcons[pieceType]});
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            cursor: pointer;
            display: inline-block;
            margin: 5px;
        `;
        
        pieceOption.addEventListener('click', () => {
            currentBoard[row][col] = pieceType;
            createBoard();
            document.body.removeChild(promotionDialog);
            
            if (currentPlayer === -1) {
                setTimeout(makeComputerMove, 500);
            }
        });
        
        promotionDialog.appendChild(pieceOption);
    });

    document.body.appendChild(promotionDialog);
}

// Include the remaining necessary functions (isValidMove, isPieceBetween, clearHighlights, 
// highlightValidMoves, updateTurnIndicator, createTurnDisplay, resetGame) from your original code
function isValidMove(startRow, startCol, endRow, endCol) {
    const piece = currentBoard[startRow][startCol];
    const pieceType = Math.abs(piece);
    const targetPiece = currentBoard[endRow][endCol];

    // Prevent king capture
    if (Math.abs(targetPiece) === 6) {
        return false;
    }

    if (endRow < 0 || endRow > 7 || endCol < 0 || endCol > 7) return false;
    if (currentBoard[endRow][endCol] !== 0 && Math.sign(currentBoard[endRow][endCol]) === Math.sign(piece)) return false;

    // Rest of your existing switch statement remains the same
    switch (pieceType) {
        case 1: // Pawn
            const direction = Math.sign(piece) * -1;
            const isFirstMove = (piece > 0 && startRow === 6) || (piece < 0 && startRow === 1);
            if (endCol === startCol && currentBoard[endRow][endCol] === 0) {
                if (endRow === startRow + direction) return true;
                if (isFirstMove && endRow === startRow + 2 * direction && currentBoard[startRow + direction][startCol] === 0) return true;
            }
            if (Math.abs(endCol - startCol) === 1 && endRow === startRow + direction) {
                return currentBoard[endRow][endCol] !== 0;
            }
            return false;

        // Rest of the cases remain unchanged
        case 2: // Rook
            return (startRow === endRow || startCol === endCol) && !isPieceBetween(startRow, startCol, endRow, endCol);

        case 3: // Knight
            const rowDiff = Math.abs(endRow - startRow);
            const colDiff = Math.abs(endCol - startCol);
            return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

        case 4: // Bishop
            return Math.abs(endRow - startRow) === Math.abs(endCol - startCol) && !isPieceBetween(startRow, startCol, endRow, endCol);

        case 5: // Queen
            return ((startRow === endRow || startCol === endCol) || (Math.abs(endRow - startRow) === Math.abs(endCol - startCol))) && !isPieceBetween(startRow, startCol, endRow, endCol);

        case 6: // King
            return Math.abs(endRow - startRow) <= 1 && Math.abs(endCol - startCol) <= 1;

        default:
            return false;
    }
}

const moveCache = new Map();

function getCacheKey(startRow, startCol, endRow, endCol, player) {
    return `${startRow},${startCol},${endRow},${endCol},${player},${JSON.stringify(currentBoard)}`;
}

function isPieceBetween(startRow, startCol, endRow, endCol) {
    const rowDir = Math.sign(endRow - startRow);
    const colDir = Math.sign(endCol - startCol);

    let currentRow = startRow + rowDir;
    let currentCol = startCol + colDir;

    while (currentRow !== endRow || currentCol !== endCol) {
        if (currentBoard[currentRow][currentCol] !== 0) return true;
        currentRow += rowDir;
        currentCol += colDir;
    }

    return false;
}

function clearHighlights() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => square.classList.remove('selected', 'valid-move'));
}

function highlightValidMoves(row, col) {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (canMoveWithoutCheck(row, col, i, j, currentPlayer)) {
                const square = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                square.classList.add('valid-move');
            }
        }
    }
}

function updateTurnIndicator() {
    const turnDisplay = document.getElementById('turn-display') || createTurnDisplay();
    const currentSide = currentPlayer === 1 ? 'White' : 'Black';
    const isPlayerTurn = currentPlayer === playerSide;
    turnDisplay.textContent = `${currentSide}'s Turn (${isPlayerTurn ? playerName : 'Computer'})`;
}


function hasInsufficientMaterial() {
    const pieces = {white: [], black: []};
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = currentBoard[row][col];
            if (piece !== 0) {
                pieces[piece > 0 ? 'white' : 'black'].push(Math.abs(piece));
            }
        }
    }
    
    return checkInsufficientPieces(pieces.white) && checkInsufficientPieces(pieces.black);
}

function checkInsufficientPieces(pieces) {
    if (pieces.length === 1) return true; // Only king
    if (pieces.length === 2 && pieces.includes(3)) return true; // King and knight
    if (pieces.length === 2 && pieces.includes(4)) return true; // King and bishop
    return false;
}

function resetGame() {
    currentBoard = JSON.parse(JSON.stringify(initialBoard));
    currentPlayer = 1;
    selectedPiece = null;
    createBoard();
    updateTurnIndicator();
}

function createTurnDisplay() {
    const turnDisplay = document.createElement('div');
    turnDisplay.id = 'turn-display';
    turnDisplay.className = 'turn-indicator';
    
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.insertBefore(turnDisplay, gameContainer.firstChild);
    } else {
        const container = document.createElement('div');
        container.id = 'game-container';
        container.appendChild(turnDisplay);
        const chessBoard = document.getElementById('chess-board');
        chessBoard.parentNode.insertBefore(container, chessBoard);
    }
    
    return turnDisplay;
}

function findBestMove(player) {
    let bestMove = null;
    let bestScore = -Infinity;
    
    for (let startRow = 0; startRow < 8; startRow++) {
        for (let startCol = 0; startCol < 8; startCol++) {
            if (currentBoard[startRow][startCol] * player > 0) {
                for (let endRow = 0; endRow < 8; endRow++) {
                    for (let endCol = 0; endCol < 8; endCol++) {
                        if (canMoveWithoutCheck(startRow, startCol, endRow, endCol, player)) {
                            const score = evaluateMove(startRow, startCol, endRow, endCol);
                            if (score > bestScore) {
                                bestScore = score;
                                bestMove = { startRow, startCol, endRow, endCol };
                            }
                        }
                    }
                }
            }
        }
    }
    return bestMove;
}

function evaluateMove(startRow, startCol, endRow, endCol) {
    let score = 0;
    
    const capturedPiece = Math.abs(currentBoard[endRow][endCol]);
    if (capturedPiece > 0) {
        const pieceValues = { 1: 1, 2: 5, 3: 3, 4: 3, 5: 9, 6: 0 };
        score += pieceValues[capturedPiece] * 10;
    }
    
    if (endRow >= 3 && endRow <= 4 && endCol >= 3 && endCol <= 4) {
        score += 3;
    }
    
    score += Math.random() * 2;
    
    return score;
}

function resetGame() {
    currentBoard = JSON.parse(JSON.stringify(initialBoard));
    currentPlayer = 1;
    selectedPiece = null;
    moveStack = [];
    undoMovesLeft = 5;
    createBoard();
    updateTurnIndicator();
    updateUndoButton();
}



document.addEventListener('DOMContentLoaded', () => {
    createBoard();
    const undoButton = document.querySelector('.undo-move');
    undoButton.addEventListener('click', undoMove);
    updateUndoButton();
    const returnHomeButton = document.querySelector('.return-to-homepage');
    returnHomeButton.addEventListener('click', () => {
        const confirmReturn = confirm('Are you sure you want to return to the home page? Current game progress will be lost.');
        if (confirmReturn) {
            window.location.href = '../index.html';
        }
    });
});