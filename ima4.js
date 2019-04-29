const cards = document.querySelectorAll('.memory-card');
const ngButton = document.getElementsByName('new-game-btn');
const rstButton = document.getElementsByName('reset-game-btn');
const timer = document.getElementsByClassName('timer')[0];
const gameboardOverlay = document.getElementsByClassName('overlay')[0];
const gameOverCard = document.getElementsByClassName('go-card')[0];
const cardText = document.getElementsByClassName('cardText')[0];

let hasFlippedCard = false;
let lockBoard = false;
let gameOver = false;
let seconds = 0;
let minutes = 0;
let gameOverInfo = '';
let time = '00:00';
let defaultTime = "09:59";
let firstCard, secondCard, t, newTotalSeconds, newTime, storedTime, bestOverall, bestTime;


// Show the cards once the window has fully loaded //
window.onload = function(){
  cardReveal(); //Shows all card pairs at beginning of game
};

function cardReveal(){
  Array.from(cards).forEach(card => card.classList.add('flip'));
  lockBoard = true; //Makes cards non-clickable before new game started
}

// Starts by defining the card flip action //
Array.from(cards).forEach(card => card.addEventListener('click', flipCard));

// Flips the cards once clicked and checks for a match //
function flipCard(){
  if(lockBoard) return;
  if(this === firstCard) return;

  this.classList.toggle('flip');

  if(!hasFlippedCard){
    //First card flip action
    hasFlippedCard = true;
    firstCard = this;
    return;
  }
  // second card flip action
  secondCard = this;

  checkForMatch(); //Runs the match checker function
};

function checkForMatch(){
  //Check if cards match with ternary operator
  let isMatch = firstCard.dataset.framework === secondCard.dataset.framework; //Set the condition
  isMatch ? disableCards() : unflipCards(); //Checks condition then runs either true function or false function
}

function disableCards(){
  //If it is a match this will disable the matched cards
  let first = firstCard;  //Needed for fade Timeout
  let second = secondCard;  //Needed for fade Timeout

  setTimeout(function(){
    first.classList.add('fadeOutDown');
    second.classList.add('fadeOutDown');
    checkClass(); //Checks to see if all cards have matched and been faded
  }, 750);

  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);

  resetBoard(); //Resets hasFlippedCard after the second flip action
}

function unflipCards(){
  lockBoard = true; //Locks the board until flip animation has completed.

  //If it is not a match this will flip the cards back over after a short time
  setTimeout(() => {
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');
    resetBoard(); //Unlocks board once cards have flipped back over
  }, 750);
}

function resetBoard(){
  [hasFlippedCard, lockBoard] = [false, false]; //Resets to original values after flipping action
  [firstCard, secondCard] = [null, null]; //Resets to original values after flipping action
}

//  Top Screen New Game Start Button Section  //
ngButton[0].addEventListener('click', function(){
  ngButton[0].classList.add('btn-hide'); //Hides new game button
  rstButton[0].classList.remove('btn-hide'); // Replaces with Rest button

  flipAllCards();
  resetBoard();
  shuffle();
});

// New Game Start After Game Over Actions Only //
ngButton[1].addEventListener('click', function(){
  gameboardOverlay.classList.add('hide');
  gameOverCard.classList.add('hide');
  ngButton[0].classList.add('btn-hide'); //Swaps button shown
  rstButton[0].classList.remove('btn-hide'); //Swaps button shown

  resetTimer();
  reflipCards();
  flipAllCards();
  resetBoard();
  resetGameOverCard();
});

// Shuffles the cards order //
function shuffle(){
  Array.from(cards).forEach(card => {
    let randomPos = 0;
    randomPos = Math.floor(Math.random() * 20);
    card.style.order = randomPos;
  });
}

// Flips cards over and makes them clickable //
function flipAllCards(){
  Array.from(cards).forEach(card => card.classList.remove('flip'));
  Array.from(cards).forEach(card => card.style.cursor = "pointer");
}

// Time Keeper Section //
timer.textContent = "00:00";

function resetTimer(){
  seconds = 0;
  minutes = 0;
}

function addTime(){
  seconds++;
  if(seconds >=60){
    seconds = 0;
    minutes++;
  }
  timer.textContent = (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
  secondTimeout();
}

function secondTimeout(){
    t = setTimeout(addTime, 1000);
}

// Starts the Timer //
ngButton[0].addEventListener('click', addTime);
ngButton[1].addEventListener('click', addTime);

// Board Reset Section //
rstButton[0].addEventListener('click', function(){
  reflipCards();
  resetTimer();
});

// Reflips the card after a game when new game is started //
function reflipCards(){
  Array.from(cards).forEach(card => card.classList.remove('fadeOutDown'));
  Array.from(cards).forEach(card => card.addEventListener('click', flipCard));
  Array.from(cards).forEach(card => card.classList.remove('flip'));
  resetBoard();
  shuffle();
}

 // Testing game over //
function checkClass(){
  let totalFaded = 0;

  for (var i = 0; i < cards.length; i++){
    if(cards[i].classList.contains('fadeOutDown')){
      totalFaded++;
    }
  }

  // Check to see if game over by comparing faded cards
  if(totalFaded == 20){
    clearTimeout(t);
    storeTime();
    setTimeout(function(){
      displayGameOver();
      },1000);
  }
}

// Section To Store Time To Local Memory //
defaultTime = toSeconds(defaultTime); // Converts to default time in seconds

function storeTime(bestOverall){
  bestOverall = localStorage.getItem(storedTime); //Gets as string

  if(bestOverall == null){
    bestOverall = defaultTime;
  }

  newTime = timer.textContent; // Sets current game's time as a string
  newTotalSeconds = toSeconds(newTime); // Converts time string to number in seconds

  if(newTotalSeconds < bestOverall){
    localStorage.setItem(storedTime, newTotalSeconds);
    bestOverall = localStorage.getItem(storedTime);
  }
  convertTime(bestOverall);
}

// Convert time string to seconds as a number
function toSeconds(newTime) {
  let bits = newTime.split(':');
  bits = (Number(bits[0])*60) + Number(bits[1]);
  return bits;
}

function displayGameOver(bestOverall){
  gameboardOverlay.classList.remove('hide');
  gameOverCard.classList.remove('hide');
  checkForWinner();
}

//Resets the text written to the gameover card on multiple play throughs //
function resetGameOverCard(){
  gameOverInfo = '';
}

// Checks to see if you beat your best time //
function checkForWinner(){
  let bestInSecs = toSeconds(bestTime);
  let isWinner = newTotalSeconds <= bestInSecs;
  isWinner ? ifWon() : ifLost(); // Performs win or lose function based on win
}

// Writes text if you beat your best time //
function ifWon(){
  gameOverInfo += '<h1>Ganaste!</h1>' +
    '<h2>Tu Tiempo:</h2>' +
    '<h3>' + newTime + '</h3>' +
    '<h2>Mejor Tiempo:</h2>' +
    '<h3>' + bestTime + '</h3>';

  cardText.innerHTML = gameOverInfo;
}
// Writes text if you were slower than your best time //
function ifLost(){
  gameOverInfo += '<h1 style="color: #f39c12">Demasiado Lento! Inteta de Nuevo!</h1>' +
    '<h2>Tu Tiempo:</h2>' +
    '<h3>' + newTime + '</h3>' +
    '<h2>Mejor Tiempo:</h2>' +
    '<h3>' + bestTime + '</h3>';

  cardText.innerHTML = gameOverInfo;
}

// Convert stored time back to string for display //
function convertTime(bestOverall){
  if(bestOverall > 60){
    minutes = Math.floor(bestOverall / 60);
    seconds = bestOverall - (minutes * 60);
    bestTime = (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
  }else{
    bestTime = "00:" + bestOverall;
  }
}
