const chooseWordForm = document.getElementById("choose-word");
const lettersDisplay = document.getElementById("letters-display");
const keyboardDisplay = document.getElementById("keyboard-display");
const missesDisplay = document.getElementById("misses-display");
const resetButton = document.getElementById("reset-game");
const image = document.getElementById("image");

const state = {
  word: [],
  hits: [],
  misses: [],
  available: [...ALPHABET],
  errors: []
};

// GAMEPLAY FUNCTIONS

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
  buttonEl.style.width = "80px";
  buttonEl.style.margin = "5px";
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
  keyboardDisplay.style.display = "none";
  resetButton.style.display = "inline";
};

const displayMisses = () => {
  missesDisplay.innerHTML = "";
  state.misses.map(miss => (missesDisplay.innerHTML += `<code>${miss}</code>`));
};

const tryGameOver = () => state.misses.length >= 6;

const resetBoard = () => {
  image.innerText = stage[0];
  clearDisplay();
  state.word = [];
  state.hits = [];
  state.misses = [];
  state.available = [...ALPHABET];
  displayMisses();
  displayLettersFields();
};

const letterPress = letter => {
  if (!state.available.includes(letter)) return;
  state.available = state.available.filter(x => x !== letter);
  displayLettersFields();
  socket.emit("letterGuess", { room, letter });
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

const p2view = () => {
  displayLettersFields();
  image.style.display = "inline";
  image.innerText = stage[state.misses.length || 0];
  displayAvailableLetters();
};

const p1view = () => {
  displayLettersFields();
  clearDisplay();
  image.style.display = "inline";
  image.innerText = stage[state.misses.length || 0];
};

const moveTaken = data => {
  const { hits, misses } = data;
  state.hits = hits;
  state.misses = misses;
  displayAvailableLetters();
  displayMisses();
  displayLettersFields();
  image.innerText = stage[state.misses.length || 0];
};

const gameState = () => {
  return {
    room,
    misses: state.misses,
    hits: state.hits
  };
};

// EVENT LISTENERS

chooseWordForm.addEventListener("submit", e => {
  e.preventDefault();
  validateWord(e.target.word.value);
  if (state.errors.length) return displayErrors();
  chooseWordForm.style.display = "none";
  state.word = e.target.word.value.split("").map(x => {
    if (x === " ") return " / ";
    return x.toUpperCase();
  });
  state.hits = state.word.map(x => {
    if (x === " / ") return " / ";
    return null;
  });
  chooseWordForm.reset();
  socket.emit("wordSubmitted", {
    room,
    hits: state.hits
  });
  p1view();
});

document.addEventListener("click", e => {
  if (e.target.className !== "letterButton") return;
  const letter = e.target.dataset.letter;
  letterPress(letter);
});

document.addEventListener("keypress", e => {
  if (!state.hits.length) return;
  if (state.word.length) return;
  if (state.misses.length >= 6) return;
  letterPress(e.key.toUpperCase());
});

resetButton.addEventListener("click", e => {
  socket.emit("resetGame", { room });
  resetBoard();
  image.style.display = "none";
  chooseWordForm.style.display = "inline";
  resetButton.style.display = "none";
});

// SOCKET ACTIONS

socket.on("playerJoined", () => {
  updateDisplay("Opponent has joined.", "success");
  chooseWordForm.style.display = "block";
});

socket.on("joinedRoom", () => {
  updateDisplay("Waiting for opponent to choose word/phrase.", "info");
});

socket.on("newWord", data => {
  clearDisplay();
  state.hits = data.hits;
  p2view();
});

socket.on("guessedLetter", data => {
  tryGuess(data.letter);
  displayMisses();
  displayLettersFields();

  if (checkWin()) {
    updateDisplay("You lost.", "error game-end");
    return socket.emit("gameEndWin", gameState());
  }
  if (tryGameOver()) {
    updateDisplay("You Won!", "success game-end");
    return socket.emit("gameEndLose", gameState());
  }
  socket.emit("tryLetter", { room, misses: state.misses, hits: state.hits });
});

socket.on("letterTried", data => {
  moveTaken(data);
});

socket.on("playerWon", data => {
  moveTaken(data);
  updateDisplay("You Won!", "success game-end");
  endGame();
});

socket.on("playerLost", data => {
  moveTaken(data);
  updateDisplay("You lost.", "error game-end");
  endGame();
});

socket.on("resetBoard", () => {
  image.style.display = "none";
  resetBoard();
  updateDisplay("Waiting for opponent to choose word/phrase.", "info");
});
