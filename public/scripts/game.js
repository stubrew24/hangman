const gameDisplay = document.getElementById("game-display");
const chooseWordForm = document.getElementById("choose-word");
const lettersDisplay = document.getElementById("letters-display");
const keyboardDisplay = document.getElementById("keyboard-display");

const state = {
  word: [],
  guess: [],
  available: [...ALPHABET]
};

chooseWordForm.addEventListener("submit", e => {
  e.preventDefault();
  if (!e.target.word.value) return;
  state.word = e.target.word.value.split("");
  state.guess = state.word.map(x => null);
  chooseWordForm.reset();
  displayLettersFields();
  displayAvailableLetters();
});

const displayLettersFields = () => {
  if (!state.word.length) return;
  const displayWord = state.guess
    .map(letter => (letter === null ? "_" : letter))
    .join("");
  lettersDisplay.innerText = displayWord;
};

const displayAvailableLetters = () => {
  keyboardDisplay.innerHTML = "";
  state.available.map(letter => displayLetter(letter));
};

const displayLetter = letter => {
  const buttonEl = document.createElement("button");
  buttonEl.innerText = letter;
  buttonEl.addEventListener("click", e => {
    if (!state.available.includes(letter)) return;
    state.available = state.available.filter(x => x !== letter);
    tryGuess(letter);
    displayLettersFields();
    if (checkWin()) return endGame();
    displayAvailableLetters();
  });
  keyboardDisplay.appendChild(buttonEl);
};

const tryGuess = guess => {
  state.word.map((letter, index) => {
    if (letter === guess) state.guess[index] = guess;
  });
};

const checkWin = () => {
  return arrayCompare(state.word, state.guess);
};

const arrayCompare = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

const endGame = () => {
  keyboardDisplay.style.display = "none";
  console.log("winner");
};
