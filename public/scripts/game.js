const gameDisplay = document.getElementById("game-display");
const chooseWordForm = document.getElementById("choose-word");
const lettersDisplay = document.getElementById("letters-display");
const keyboardDisplay = document.getElementById("keyboard-display");
const gameStatus = document.getElementById("game-status");
const missesDisplay = document.getElementById("misses-display");
const resetButton = document.getElementById("reset-game");
const image = document.getElementById("image");

/**
 * TODO:
 * -  [x] non alpha error / restriction
 * -  [x] min / max letters
 * -  [x] keyboard input
 */

const state = {
  word: [],
  hits: [],
  misses: [],
  available: [...ALPHABET],
  errors: []
};

chooseWordForm.addEventListener("submit", e => {
  e.preventDefault();
  validateWord(e.target.word.value);
  if (state.errors.length) return displayErrors();
  image.innerText = stage[0];
  chooseWordForm.style.display = "none";
  const word = e.target.word.value.toUpperCase();
  state.word = word.split("");
  state.hits = state.word.map(x => {
    if (x === " ") return " / ";
    return null;
  });
  chooseWordForm.reset();
  displayLettersFields();
  displayAvailableLetters();
});

const displayLettersFields = () => {
  const displayWord = state.hits
    .map(letter => {
      if (letter === null) return "_";
      return letter;
    })
    .join("");
  lettersDisplay.innerText = displayWord;
};

const displayAvailableLetters = () => {
  keyboardDisplay.style.display = "inline";
  keyboardDisplay.innerHTML = "";
  state.available.map(letter => displayLetter(letter));
};

const displayLetter = letter => {
  const buttonEl = document.createElement("button");
  buttonEl.innerText = letter;
  buttonEl.className = "letterButton";
  buttonEl.dataset.letter = letter;
  keyboardDisplay.appendChild(buttonEl);
};

const tryGuess = guess => {
  let hit = false;
  state.word.map((letter, index) => {
    if (letter === guess) {
      hit = true;
      state.hits[index] = guess;
    }
  });
  if (!hit) state.misses.push(guess);
};

const checkWin = () => {
  return arrayCompare(state.word, state.hits);
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
  gameStatus.innerHTML = "<h1>Winner</h1>";
  keyboardDisplay.style.display = "none";
  resetButton.style.display = "inline";
};

const displayMisses = () => {
  missesDisplay.innerText = "";
  state.misses.map(miss => (missesDisplay.innerText += miss));
};

const tryGameOver = () => {
  if (state.misses.length >= 6) {
    gameStatus.innerHTML = "<h2>Game Over</h2>";
    keyboardDisplay.style.display = "none";
    resetButton.style.display = "inline";
  }
};

resetButton.addEventListener("click", e => {
  image.innerText = stage[0];
  chooseWordForm.style.display = "inline";
  gameStatus.innerText = "";
  resetButton.style.display = "none";
  state.word = [];
  state.hits = [];
  state.misses = [];
  displayMisses();
  state.available = [...ALPHABET];
  displayLettersFields();
});

document.addEventListener("click", e => {
  if (e.target.className !== "letterButton") return;
  const letter = e.target.dataset.letter;
  letterPress(letter);
});

document.addEventListener("click", e => {
  if (e.target.className !== "letterButton") return;
  const letter = e.target.dataset.letter;
  letterPress(letter);
});

document.addEventListener("keypress", e => {
  if (!state.word.length) return;
  letterPress(e.key.toUpperCase());
});

const letterPress = letter => {
  if (!state.available.includes(letter)) return;
  state.available = state.available.filter(x => x !== letter);
  tryGuess(letter);
  displayLettersFields();
  if (checkWin()) return endGame();
  displayAvailableLetters();
  displayMisses();
  image.innerText = stage[state.misses.length || 0];
  tryGameOver();
};

const displayErrors = () => {
  gameStatus.innerHTML = "<p>";
  gameStatus.innerHTML += state.errors.join("<br />");
  gameStatus.innerHTML += "</p>";
};

const validateWord = word => {
  state.errors = [];
  if (!word) state.errors.push("Please enter a word or phrase.");
  if (!word.match(/^[a-zA-Z\s]+$/i))
    state.errors.push("Phrase can only conatin letters and spaces.");
  if (word.length < 5)
    state.errors.push("Minimum length of word/phrase is 5 letters.");
};
