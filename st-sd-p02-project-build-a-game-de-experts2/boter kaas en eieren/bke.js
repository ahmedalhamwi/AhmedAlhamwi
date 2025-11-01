console.log("boter-kaas-eieren loaded");

const cells = document.querySelectorAll(".grid-item");
const resetButton = document.querySelector(".reset-button");
const currentPlayerDisplay = document.querySelector("#current-player");
const messageHTML = document.querySelector(".message");
const winCombinations = [
   [0, 1, 2],
   [3, 4, 5],
   [6, 7, 8],
   [0, 3, 6],
   [1, 4, 7],
   [2, 5, 8],
   [0, 4, 8],
   [2, 4, 6],
];

let boardState = Array(9).fill(""); // Tracks the state of the board
let currentPlayer = "X"; // Tracks the current player ("X" starts)
let gameActive = true; // Tracks if the game is still active

// Handle cell click
function clickCell(index) {
   if (!gameActive) {
       messageHTML.textContent = "Game over!";
       return;
   }
   if (boardState[index] !== "") {
       messageHTML.textContent = "Daar is al een teken gezet.";
       return;
   }
   // Update board state and UI
   boardState[index] = currentPlayer;
   cells[index].textContent = currentPlayer;

   // Check for winner or draw
   if (checkWinner()) {
       messageHTML.textContent =`Speler ${currentPlayer} heeft gewonnen!`;
       gameActive = false;
       return;
   }
   if (boardState.every(cell => cell !== "")) {
       messageHTML.textContent = "Gelijkspel!";
       gameActive = false;
       return;
   }
   // Switch turns
   currentPlayer = currentPlayer === "X" ? "O" : "X";
   currentPlayerDisplay.textContent = currentPlayer;
}

// Check for a winner
function checkWinner() {
   return winCombinations.some(combination => {
       return combination.every(index => boardState[index] === currentPlayer);
   });
}

// Reset the game
function resetGame() {
   boardState.fill(""); // Reset board state
   currentPlayer = "X"; // Reset starting player
   gameActive = true; // Reactivate the game
   currentPlayerDisplay.textContent = currentPlayer; // Update display

   cells.forEach(cell => {
       cell.textContent = ""; // Clear the board
   });
}

// Initialize the game
function setupGame() {
   // Attach click events to all cells
   cells.forEach((cell, index) => {
       cell.addEventListener("click", () => clickCell(index));
   });

   // Set initial display values
   currentPlayerDisplay.textContent = currentPlayer;

   // Attach reset button event
   resetButton.addEventListener("click", resetGame);

   resetGame(); // Initialize the board
}

// Run the game setup
setupGame();
