document.addEventListener('DOMContentLoaded', () => {
    console.log('js werkt');
    const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    const player1Grid = document.querySelector('.player1-grid');
    const player2Grid = document.querySelector('.player2-grid');
    const startBtn = document.querySelector('.start-btn');
    const resetBtn = document.querySelector('.reset-btn');
    const finishBtn = document.querySelector('.finish-btn');
    const message = document.querySelector('.message');
    const playerOneScore = document.querySelector('.player-one-score');
    const playerOneHits = document.querySelector('.player-one-hits');
    const playerOneMisses = document.querySelector('.player-one-misses');
    const playerTwoScore = document.querySelector('.player-two-score');
    const playerTwoHits = document.querySelector('.player-two-hits');
    const playerTwoMisses = document.querySelector('.player-two-misses');
    const nameTag = document.querySelector('.name-tag')

    let player1Hits = 0;
    let player2Hits = 0;
    let player1Misses = 0;
    let player2Misses = 0;

    let currentPhase = 1;
    let player1Ships = [];
    let player2Ships = [];
    let isPlayer1Turn = true;
    let gridSize = 10;

    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    finishBtn.addEventListener('click', finishPlacement);

    // Function to start the game
    function startGame() {
        message.textContent = "Player 1, place your ships!";
        console.log("Player 1's ship placement phase started.");
        generateGrid(player1Grid);
        startBtn.disabled = true;
        finishBtn.style.display = 'inline-block';
        player1Grid.classList.remove('hidden');
        player2Grid.classList.add('hidden');
        nameTag.classList.add('hidden')
        message.classList.remove('final-place')
    }

    
    // Function to generate the header of the grid
    function generateHeader() {
        let headerHTML = '<div class="div"></div>';
        for (let i = 0; i < gridSize; i++) {
            headerHTML += `<div class="div">${alphabet[i]}</div>`;
        }
        return headerHTML;
    }

    // Function to generate the grid
    function generateGrid(gridElement, isAttackMode = false) {
        gridElement.innerHTML = `<div class="wrapper">
            ${generateHeader()}
            ${generateCells(isAttackMode)}
        </div>`;
        if (!isAttackMode) enableShipPlacement(gridElement);
        else enableAttacks(gridElement);
    }

    // Function to generate the cells of the grid
    function generateCells(isAttackMode) {
        let gridHTML = '';
        for (let row = 1; row <= gridSize; row++) {
            gridHTML += `<div class="div">${row}</div>`;
            for (let col = 0; col < gridSize; col++) {
                const coordinate = `${alphabet[col]}${row}`;
                gridHTML += `<div class="div" data-coordinate="${coordinate}"></div>`;
            }
        }
        return gridHTML;
    }

    // Function to enable ship placement
    function enableShipPlacement(gridElement) {
        const cells = gridElement.querySelectorAll('[data-coordinate]');
        cells.forEach(cell => {
            cell.addEventListener('click', () => {
                const coordinate = cell.getAttribute('data-coordinate');
                if (currentPhase === 1) {
                    if (player1Ships.length < 6 && !player1Ships.includes(coordinate)) {
                        console.log(`Player 1 placed a ship at ${coordinate}`);
                        cell.classList.add('ship');
                        player1Ships.push(coordinate);
                    } else if (player1Ships.length >= 6) {
                        alert('Player 1, you have already placed all 6 ships.');
                    } else {
                        alert('You already placed a ship here.');
                    }
                } else if (currentPhase === 2) {
                    if (player2Ships.length < 6 && !player2Ships.includes(coordinate)) {
                        console.log(`Player 2 placed a ship at ${coordinate}`);
                        cell.classList.add('ship');
                        player2Ships.push(coordinate);
                    } else if (player2Ships.length >= 6) {
                        alert('Player 2, you have already placed all 6 ships.');
                    } else {
                        alert('You already placed a ship here.');
                    }
                }
            });
        });
    }

    // Function to finish ship placement
    function finishPlacement() {
        if (currentPhase === 1 && player1Ships.length === 6) {
            message.textContent = "Player 2, place your ships!";
            currentPhase = 2;
            generateGrid(player2Grid);
            player1Grid.classList.add('hidden');
            player2Grid.classList.remove('hidden');
        } else if (currentPhase === 2 && player2Ships.length === 6) {
            message.textContent = "Player 1, start attacking!";
            currentPhase = 3;
            generateGrid(player1Grid, true);
            generateGrid(player2Grid, true);
            finishBtn.style.display = 'inline-block';
            player1Grid.classList.remove('hidden');
            player2Grid.classList.add('hidden');
        } else {
            alert(`Player ${currentPhase}, you need to place all 6 ships before finishing.`);
        }
    }

    // Function to enable attacks
    function enableAttacks(gridElement) {
        const cells = gridElement.querySelectorAll('[data-coordinate]');
        cells.forEach(cell => {
            cell.addEventListener('click', () => {
                const coord = cell.getAttribute('data-coordinate');
                if (isPlayer1Turn && currentPhase === 3 && gridElement === player1Grid) {
                    attackPlayer(coord, player2Ships, 'Player 1', gridElement);
                } else if (!isPlayer1Turn && currentPhase === 3 && gridElement === player2Grid) {
                    attackPlayer(coord, player1Ships, 'Player 2', gridElement);
                }
            });
        });
    }

    // Function to handle player attacks
    function attackPlayer(coord, opponentShips, playerName, gridElement) {
        const cell = gridElement.querySelector(`[data-coordinate="${coord}"]`);
        setTimeout(() => {
            if (opponentShips.includes(coord)) {
                // Successful hit
                cell.classList.add('ship-hit');
                console.log(`${playerName} hit a ship at ${coord}`);

                // Update scores and remove the ship from the opponent's list
                if (playerName === 'Player 1') {
                    player1Hits++;
                    const newShips = [];
                    player2Ships.forEach(ship => {
                        if (ship !== coord) {
                            newShips.push(ship);
                        }
                    });
                    player2Ships = newShips;
                    updateScores();
                    if (player2Ships.length === 0) {
                        message.textContent = 'Player 1 wins!';
                        endGame();
                        return;
                    }
                } else {
                    player2Hits++;
                    const newShips = [];
                    player1Ships.forEach(ship => {
                        if (ship !== coord) {
                            newShips.push(ship);
                        }
                    });
                    player1Ships = newShips;
                    updateScores();
                    if (player1Ships.length === 0) {
                        message.textContent = 'Player 2 wins!';
                        endGame();
                        return;
                    }
                }
            } else {
                // Missed attack
                cell.classList.add('miss');
                console.log(`${playerName} missed at ${coord}`);

                // Update misses count
                if (playerName === 'Player 1') {
                    player1Misses++;
                } else {
                    player2Misses++;
                }

                // Switch turns after a miss
                updateScores();
                switchTurns();
            }
        }, 100); // delay to resolve issue with automatic player switching
    }
    // Function to switch turns
    function switchTurns() {
        if (isPlayer1Turn) {
            isPlayer1Turn = false;
            message.textContent = "Player 2, it's your turn!";
            player1Grid.classList.add('hidden');
            player2Grid.classList.remove('hidden');
        } else {
            isPlayer1Turn = true;
            message.textContent = "Player 1, it's your turn!";
            player2Grid.classList.add('hidden');
            player1Grid.classList.remove('hidden');
        }
    }

    // Function to update scores
    function updateScores() {
        playerOneHits.textContent = player1Hits;
        playerOneMisses.textContent = player1Misses;
        playerTwoHits.textContent = player2Hits;
        playerTwoMisses.textContent = player2Misses;
        playerOneScore.textContent = player1Hits * 10 - player1Misses * 5;
        playerTwoScore.textContent = player2Hits * 10 - player2Misses * 5;
    }

    // Function to end the game
    function endGame() {
        const player1FinalScore = player1Hits * 10 - player1Misses * 5;
        const player2FinalScore = player2Hits * 10 - player2Misses * 5;

        if (player2Ships.length === 0) {
            alert(`Player 1 wins! Your score is ${player1FinalScore}`);
        }
        if (player1Ships.length === 0) {
            alert(`Player 2 wins! Your score is ${player2FinalScore}`);
        }
        message.classList.add('final-place')
        message.textContent = "Game Over!";
        startBtn.disabled = false;
        finishBtn.style.display = 'none';
        const cells = document.querySelectorAll('[data-coordinate]');
        cells.forEach(cell => {
            cell.replaceWith(cell.cloneNode(true));  // Removes event listeners by cloning the element
        });
    }

    // Function to reset
    function resetGame() {
        player1Score = 0;
        player2Score = 0;
        player1Hits = 0;
        player2Hits = 0;
        player1Misses = 0;
        player2Misses = 0;
        currentPhase = 1;
        player1Ships = [];
        player2Ships = [];
        isPlayer1Turn = true;
        message.textContent = "Player 1, place your ships!";
        startBtn.disabled = false;
        finishBtn.style.display = 'none';

        // Clear the grids (remove ship markers, hits, and misses)
        const cells1 = player1Grid.querySelectorAll('[data-coordinate]');
        const cells2 = player2Grid.querySelectorAll('[data-coordinate]');
        cells1.forEach(cell => {
            cell.classList.remove('ship', 'ship-hit', 'miss');
        });
        cells2.forEach(cell => {
            cell.classList.remove('ship', 'ship-hit', 'miss');
        });

        generateGrid(player1Grid);
        generateGrid(player2Grid);
        player1Grid.classList.remove('hidden');
        player2Grid.classList.add('hidden');
    }
});