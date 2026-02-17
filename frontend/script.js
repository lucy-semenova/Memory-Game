//********************************************* Java Script for Grid ***********************/
const revealsEl = document.getElementById("reveals");
const timerEl = document.getElementById("timer");
const flipSound = new Audio("assets/flip.mp3");
const TOTAL_PAIRS=8;

// Game state
let reveals = 0; // Count of revealed cards
let timer = 0; // Timer in seconds
let timerInterval = null;
let startTime = null; // Timestamp when timer starts
let flippedCards = [];
let counter = 0;
let canClick = true;
let matchedPairs=0;

// Update displays
function updateCounter() {
  document.getElementById("reveals").textContent = counter;
}

// Flip card function
function flipCard(cardElement) {
  if (!canClick) return;
  if (cardElement.classList.contains("flipped")) return;

  if (counter === 0) {
    startTimer();
  }

  cardElement.classList.add("flipped");
  flippedCards.push(cardElement);
  counter++;
  updateCounter();

  

  if (flippedCards.length === 2) {
    canClick = false;

    // Get two CardElement Id
    const card1Id=flippedCards[0].getAttribute('data-card-id');
    const card2Id=flippedCards[1].getAttribute('data-card-id');

    if (card1Id===card2Id)
      {
        handleMatch();
      }
      else
      {
        handleMismatch();
      }
    
  }
}
//Match Handle
function handleMatch(){
  // Add matched class to both cards
  flippedCards[0].classList.add("matched");
  flippedCards[1].classList.add("matched");

  // Increase match paired counter
  matchedPairs++;

  // Empty flippedCards
  flippedCards=[];

  //Unlook the board
  canClick=true;

  //check win condition
  //checkWinCondition();
}

// handle mis match condition
function handleMismatch(){

  setTimeout(() =>{
      // remove class flipped from cards.
    flippedCards[0].classList.remove("flipped");
    flippedCards[1].classList.remove("flipped");
    // empty flipped card array
    flippedCards=[];

    //unlook the board
    canClick=true;

  }, 1500);
  
  

}

// Card data - 8 unique cards
const cardData = [
  { id: 1, name: "bog", image: "assets/bog.png" },
  { id: 2, name: "bil", image: "assets/bil.png" },
  { id: 3, name: "cykel", image: "assets/cykel.png" },
  { id: 4, name: "skole", image: "assets/skole.png" },
  { id: 5, name: "sol", image: "assets/sol.png" },
  { id: 6, name: "stol", image: "assets/stol.png" },
  { id: 7, name: "bold", image: "assets/bold.png" },
  { id: 8, name: "træ", image: "assets/træ.png" },
];
// Duplicate cards so each appears twice
function duplicateCards(cards) {
  return cards.flatMap((card) => [{ ...card }, { ...card }]);
}

// Shuffle array using Fisher-Yates algorithm
function shuffleCards(cards) {
  const shuffled = JSON.parse(JSON.stringify(cards))// DEEP Copy. Make a copy

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

// Initialize game cards
let gameCards = shuffleCards(duplicateCards(cardData));

// Generate all cards and add to grid
function createCards() {
  const gridContainer = document.getElementById("card-grid");
  gridContainer.innerHTML = ""; // Clear any existing cards

  gameCards.forEach((card, index) => {
    // Create card HTML
    const cardDiv = document.createElement("div");
    cardDiv.className = "flip-card";
    cardDiv.id = `card-${index}`;
    cardDiv.setAttribute("data-card-id", card.id);
    
   cardDiv.addEventListener("click", () => {
  flipCard(cardDiv);
});


    cardDiv.innerHTML = `
    <div class="flip-card">
    <div class="flip-card-inner">
      <div class="flip-card-back">
          <img src="assets/back-card.png" alt="card back" />
      </div>
      <div class="flip-card-front">
          <img src="${card.image}" alt="${card.name}" />
      </div>

    </div>
    </div>
    `;

    gridContainer.appendChild(cardDiv);
  });
}
document.addEventListener("DOMContentLoaded", createCards);

//*************************************** End of Grid  */

// Timer Functions

function startTimer() {
  if (timerInterval) return; // Prevent multiple intervals
  startTime = Date.now() - timer * 1000; // Resume correctly if paused
  timerInterval = setInterval(() => {
    timer = Math.floor((Date.now() - startTime) / 1000);
    timerEl.textContent = formatTime(timer);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timer = 0;
  startTime = null;
  timerEl.textContent = formatTime(timer);
}

function formatTime(seconds) {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

//restart game function

const restartButton = document.getElementById("restartButton");

restartButton.addEventListener("click", () => {
  // Reset game state
  counter = 0;
  flippedCards = [];
  canClick = true;

  updateCounter();
  resetTimer();

  // Reshuffle cards
  gameCards = shuffleCards(duplicateCards(cardData));

  // Recreate grid
  createCards();
});
