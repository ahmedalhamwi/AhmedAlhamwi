// Game state
let playerCredits = 1000;
let betAmount = 0;
let scoreHistory = []; // Array to store player's score history

// Constants
const MAX_HISTORY_ITEMS = 10; // Maximum number of history items to show

// Function to control game buttons based on bet status
function toggleGameButtons(enabled) {
    const gameButtons = document.querySelectorAll('.higher-button, .lower-button, .gelijk-button');
    gameButtons.forEach(button => {
        button.disabled = !enabled;
    });
}

// Event listener to place a bet - enables game buttons after valid bet
document.querySelector('.placeBet').addEventListener('click', function () {
    const betInput = parseInt(document.getElementById('betAmount').value);

    if ([99, 110, 120, 250, 350].includes(betInput)) {
        betAmount = betInput;
        console.log(`U heeft ${betAmount} credits ingezet.`);
        toggleGameButtons(true); // Enable game buttons after valid bet
    } else {
        alert('Voer een geldig bedrag in: 99, 110, 120, 250 of 350 credits.');
    }
});

// Event listener for "All In" bet - enables game buttons after bet
document.querySelector('.allIn').addEventListener('click', function () {
    betAmount = playerCredits;
    console.log(`All in! U heeft ${betAmount} credits ingezet.`);
    toggleGameButtons(true); // Enable game buttons after all-in bet
});

// Function to roll a dice and return a value between 1 and 6
function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
}

// Function to update credit display
let playerCreditsHtml = document.querySelector('.player-credits');
function updateCreditDisplay() {
    playerCreditsHtml.textContent = playerCredits;
}

// Function to disable/enable buttons based on player credits
function manageButtonStates() {
    const buttons = document.querySelectorAll('.higher-button, .lower-button, .gelijk-button');
    buttons.forEach(button => {
        button.disabled = playerCredits <= -160; // Disable buttons if credits go below -160
    });
}

// Function to play a round of the game
function playRound(guess) {
    const dice1 = rollDice();
    const dice2 = rollDice();
    const sum = dice1 + dice2;

    let result;
    let pointChange = 0;

    // Determine win/lose conditions based on the player's guess
    if (guess === 'higher' && sum > 7) {
        pointChange = betAmount * 1.5;
        result = `You win! +${pointChange} credits`;
    } else if (guess === 'lower' && sum < 7) {
        pointChange = betAmount * 1.5;
        result = `You win! +${pointChange} credits`;
    } else if (guess === 'seven' && sum === 7) {
        pointChange = betAmount * 2.4;
        result = `You win! +${pointChange} credits`;
    } else {
        pointChange = -betAmount;
        result = `You lose! ${pointChange} credits`;
    }

    // Update player's credits
    playerCredits += pointChange;
    updateCreditDisplay();
    manageButtonStates();

    // End game conditions
    if (playerCredits >= 2100) {
        endGame(true);
    } else if (playerCredits <= -160) {
        endGame(false);
    }

    // Update history with the new score
    addScoreToHistory(playerCredits);

    return { result, dice1, dice2 };
}

// Function to end the game
function endGame(isWin) {
    const message = isWin ?
        'Congratulations! You have won the game by reaching 2100 credits!' :
        'Game over! You have lost the game by reaching -160 credits.';

    const playAgain = confirm(message + ' Do you want to play again?');
    if (playAgain) {
        startGame();
    } else {
        window.location.href = 'index.html';
    }
}

// Function to start the game and reset states
function startGame() {
    playerCredits = 1000;
    scoreHistory = [];
    betAmount = 0;
    updateCreditDisplay();
    updateScoreHistoryDisplay();
    toggleGameButtons(false); // Start with disabled game buttons
    manageButtonStates();
}

// Event listeners for higher, lower, and seven guesses
document.querySelector('.higher-button').addEventListener('click', () => handleGuess('higher'));
document.querySelector('.lower-button').addEventListener('click', () => handleGuess('lower'));
document.querySelector('.gelijk-button').addEventListener('click', () => handleGuess('seven'));

// Function to handle player's guess - disables buttons after round completion
function handleGuess(guess) {
    if (playerCredits > -160) {
        const roundResult = playRound(guess);
        document.querySelector('.player-dice-one').innerHTML = `&#98${roundResult.dice1 + 55};`;
        document.querySelector('.player-dice-two').innerHTML = `&#98${roundResult.dice2 + 55};`;
        document.querySelector('.message-box p').textContent = roundResult.result;
        betAmount = 0; // Reset bet amount
        toggleGameButtons(false); // Disable buttons until next bet
    } else {
        console.log("Not enough playerCredits");
    }
}

// Function to quit the game
const quitButton = document.createElement('button');
quitButton.textContent = 'Quit Game';
quitButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to quit the game?')) {
        toggleGameButtons(false);
        window.location.href = 'index.html';
    }
});
document.querySelector('.controls').appendChild(quitButton);

// Function to add a score to the history array
function addScoreToHistory(score) {
    scoreHistory.unshift(score);
    if (scoreHistory.length > MAX_HISTORY_ITEMS) {
        scoreHistory.pop();
    }
    updateScoreHistoryDisplay();
}

// Function to update the score history display in the UI
function updateScoreHistoryDisplay() {
    const scoreHistoryDisplay = document.querySelector('.player-history-list');
    scoreHistoryDisplay.innerHTML = '';

    scoreHistory.forEach((score, index) => {
        const scoreElement = document.createElement('div');
        scoreElement.classList.add('player-history-item');
        scoreElement.textContent = `Game ${scoreHistory.length - index}: ${score} credits`;
        scoreHistoryDisplay.appendChild(scoreElement);
    });
}

// Initialize game on page load
document.addEventListener('DOMContentLoaded', function () {
    startGame();
});
