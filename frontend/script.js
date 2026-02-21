//********************************************* Java Script for Grid ***********************/
const revealsEl = document.getElementById("reveals");
const timerEl = document.getElementById("timer");
const flipSound = new Audio("assets/flip.mp3");
const winMessage = document.getElementById("win-message");
const finalScore = document.getElementById("finalScore");
const finalReveals = document.getElementById("finalReveals");
const playAgainBtn = document.getElementById("play-again-btn");
const winButton = document.getElementById("win-btn");

const TOTAL_PAIRS = 8;

// Game state
const gameState={
timer : 0,// Timer in seconds
timerInterval : null,
startTime : null, // Timestamp when timer starts
flippedCards : [],
counter : 0,
canClick : true,
matchedPairs : 0,
gameCards : [],
cardData : [], // Will be populated from API
}


// Update displays
function updateCounter(state) {
  document.getElementById("reveals").textContent = state.counter;
}

// Flip card function
function flipCard(cardElement,state) {
  if (!state.canClick) return;
  if (cardElement.classList.contains("flipped")) return;

  if (state.counter === 0) {
    startTimer(state);
  }

// Play flip sound
  flipSound.currentTime = 0; // 
  flipSound.play();

  cardElement.classList.add("flipped");
  state.flippedCards.push(cardElement);
  state.counter++;
  updateCounter(state);

  // Keep one card flipped only for 1500ms
  setTimeout(()=>{
    if (state.flippedCards.length === 1)
    {cardElement.classList.remove("flipped");
      // empty flipped card array
    state.flippedCards = [];
    }
  },1500)


  if (state.flippedCards.length === 2) {
    state.canClick = false;

    // Get two CardElement Id
    const card1Id = state.flippedCards[0].getAttribute("data-card-id");
    const card2Id = state.flippedCards[1].getAttribute("data-card-id");



    // wait 1.5s so player sees both cards
    setTimeout(() => {
      if (card1Id === card2Id) {
        handleMatch(state);
      } else {
        handleMismatch(state);
      }
    }, 300);
  }
}

//Match Handle
function handleMatch(state) {
  // Add matched class to both cards
  state.flippedCards[0].classList.add("matched");
  state.flippedCards[1].classList.add("matched");

  // Increase match paired counter
  state.matchedPairs++;

  // Empty flippedCards
  state.flippedCards = [];

  //Unlock the board
  state.canClick = true;

  //check win condition
  checkWinCondition(state);
}

// handle mis match condition
function handleMismatch(state) {
  setTimeout(() => {
    // remove class flipped from cards.
    state.flippedCards[0].classList.remove("flipped");
    state.flippedCards[1].classList.remove("flipped");
    // empty flipped card array
    state.flippedCards = [];

    //unlook the board
    state.canClick = true;
  }, 300);
}
//check win condition
function checkWinCondition(state) {
  if (state.matchedPairs === TOTAL_PAIRS) {
    // Player won!
    stopTimer(state);
    // delay for the last card seen by player
    setTimeout(function () {
      showWinMessage(state);
    }, 300);
  }
}



// Fetch card data from API
async function fetchCardData(limit = TOTAL_PAIRS, state) {
  const messageEl = document.getElementById("message");

  try {
    
    const response = await fetch(
      `http://localhost:3000/cards/all-cards/${limit}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error: Status: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.warn("No cards received from API");
      return [];
    }

    state.cardData = data.map((card) => ({
      id: card.id,
      name: card.card_name,
      image: card.image_path,
    }));

    createCards(state);

    return state.cardData; // always return array
  } catch (error) {
    console.error("Error fetching cards:", error);
    messageEl.textContent = "Failed to load cards. Please try again later.";
    return [];
  }
}

// Duplicate cards so each appears twice
function duplicateCards(cards) {
  return cards.flatMap((card) => [{ ...card }, { ...card }]);
}

// Shuffle array using Fisher-Yates algorithm
function shuffleCards(cards) {
  const shuffled = JSON.parse(JSON.stringify(cards)); // DEEP Copy. Make a copy

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

// Generate all cards and add to grid
function createCards(state) {
  const gridContainer = document.getElementById("card-grid");
  gridContainer.innerHTML = ""; // Clear any existing cards

  
    // Initialize game cards
    state.gameCards = shuffleCards(duplicateCards(state.cardData));

    state.gameCards.forEach((card, index) => {
      // Create card HTML
      const cardDiv = document.createElement("div");
      cardDiv.className = "flip-card";
      cardDiv.id = `card-${index}`;
      cardDiv.setAttribute("data-card-id", card.id);

      cardDiv.addEventListener("click", () => {
        flipCard(cardDiv,state);
      });

      cardDiv.innerHTML = `
        <div class="flip-card-inner">
      <div class="flip-card-back">
          <img src="assets/back-card.png" alt="card back" />
      </div>
      <div class="flip-card-front">
          <img src="${card.image}" alt="${card.name}" />
      </div>
    </div>
    `;

      gridContainer.appendChild(cardDiv);
    });
 // });
}




document.addEventListener("DOMContentLoaded", () => {
    
    fetchCardData(TOTAL_PAIRS, gameState);
});

//********************************************* Win message ***********************/

// Show Win Message
function showWinMessage(state) {
   // Stop timer 
  stopTimer(state);
  
  // 🎉 CONFETTI BURST
  const confettiCanvas = document.querySelector("canvas"); // the one created by confetti
if (confettiCanvas) {
  confettiCanvas.style.zIndex = "9999";      // bring to front
  confettiCanvas.style.pointerEvents = "none"; // clicks pass through
}
  confetti({
    particleCount: 150,
    spread: 120,
    origin: { y: 0.6 }
    
  });

  finalScore.textContent = timerEl.textContent;
  finalReveals.textContent = revealsEl.textContent;
  winMessage.classList.remove("hidden");
}

function hideWinMessage(state) {
  winMessage.classList.add("hidden");
}



//********************************************* Timer Functions ***********************/

// Timer Functions

function startTimer(state) {
  if (state.timerInterval) return; // Prevent multiple intervals
  state.startTime = Date.now() - state.timer * 1000; // Resume correctly if paused
  state.timerInterval = setInterval(() => {
    state.timer = Math.floor((Date.now() - state.startTime) / 1000);
    timerEl.textContent = formatTime(state.timer);
  }, 1000);
}

function stopTimer(state) {
  clearInterval(state.timerInterval);
  state.timerInterval = null;
}

function resetTimer(state) {
  clearInterval(state.timerInterval);
  state.timerInterval = null;
  state.timer = 0;
  state.startTime = null;
  timerEl.textContent = formatTime(state.timer);
}

function formatTime(seconds) {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}


  // Reset game state
function restartGame(state) {
  hideWinMessage(state);

  resetTimer(state);
  
  state.matchedPairs = 0;
  state.counter = 0;
  state.flippedCards = [];
  state.canClick = true;

  updateCounter(state);
 

  // Recreate grid
  createCards(state);

}


//win-btn for debugging 


playAgainBtn.addEventListener("click", () => restartGame(gameState));
document.getElementById("restartButton").addEventListener("click", () => restartGame(gameState));
