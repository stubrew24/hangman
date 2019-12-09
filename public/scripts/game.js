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
  errors: [],
  player: null
};

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

const endGame = message => {
  gameStatus.innerHTML = `<h1>${message}</h1>`;
  keyboardDisplay.style.display = "none";
  resetButton.style.display = "inline";
};

const displayMisses = () => {
  missesDisplay.innerText = "";
  state.misses.map(miss => (missesDisplay.innerText += miss));
};

const tryGameOver = () => state.misses.length >= 6;

resetButton.addEventListener("click", e => {
  socket.emit("resetGame", { room });
  resetBoard();
  chooseWordForm.style.display = "inline";
  resetButton.style.display = "none";
});

const resetBoard = () => {
  image.innerText = stage[0];
  gameStatus.innerText = "";
  state.word = [];
  state.hits = [];
  state.misses = [];
  state.available = [...ALPHABET];
  displayMisses();
  displayLettersFields();
};

document.addEventListener("click", e => {
  if (e.target.className !== "letterButton") return;
  const letter = e.target.dataset.letter;
  letterPress(letter);
});

document.addEventListener("keypress", e => {
  if (!state.hits.length) return;
  if (state.word.length) return;
  letterPress(e.key.toUpperCase());
});

const letterPress = letter => {
  if (!state.available.includes(letter)) return;
  state.available = state.available.filter(x => x !== letter);
  displayLettersFields();
  socket.emit("letterGuess", { room, letter });
  // tryGuess(letter);
  // if (checkWin()) return endGame();
  // displayAvailableLetters();
  // displayMisses();
  // image.innerText = stage[state.misses.length || 0];
  // tryGameOver();
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
  image.innerText = stage[state.misses.length || 0];
  displayAvailableLetters();
};

const p1view = () => {
  displayLettersFields();
  image.innerText = stage[state.misses.length || 0];
};

socket.on("playerJoined", e => {
  // state.player = 1;
  gameStatus.innerText = "";
  chooseWordForm.style.display = "inline";
});

socket.on("joinedRoom", e => {
  // state.player = 2;
  gameStatus.innerText = "";
  // chooseWordForm.style.display = "inline";
});

socket.on("newWord", data => {
  state.hits = data.hits;
  p2view();
});

socket.on("guessedLetter", data => {
  const { letter } = data;
  tryGuess(letter);
  displayMisses();
  displayLettersFields();
  if (checkWin()) {
    gameStatus.innerHTML = `<h1>You Lost!</h1>`;
    return socket.emit("gameEndWin", {
      room,
      misses: state.misses,
      hits: state.hits
    });
  }
  if (tryGameOver()) {
    gameStatus.innerHTML = `<h1>You Won!</h1>`;
    return socket.emit("gameEndLose", {
      room,
      misses: state.misses,
      hits: state.hits
    });
  }
  socket.emit("tryLetter", { room, misses: state.misses, hits: state.hits });
});

socket.on("letterTried", data => {
  const { hits, misses } = data;
  state.hits = hits;
  state.misses = misses;
  displayAvailableLetters();
  displayMisses();
  displayLettersFields();
  image.innerText = stage[state.misses.length || 0];
});

socket.on("playerWon", data => {
  const { hits, misses } = data;
  state.hits = hits;
  state.misses = misses;
  displayAvailableLetters();
  displayMisses();
  displayLettersFields();
  image.innerText = stage[state.misses.length || 0];
  endGame("You won!");
});

socket.on("playerLost", data => {
  const { hits, misses } = data;
  state.hits = hits;
  state.misses = misses;
  displayAvailableLetters();
  displayMisses();
  displayLettersFields();
  image.innerText = stage[state.misses.length || 0];
  endGame("You lose! :(");
});

socket.on("resetBoard", data => {
  resetBoard();
});

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
// Sockets //

const P1_Starts_Room = {
  emit: "createGame",
  receives: "newGame",
  broadcast: null
};

const P2_Joins_Room = {
  emit: "joinGame",
  recieves: "joinedRoom",
  broadcast: "playerJoined"
};

const P1_Chooses_Word = {
  emit: "wordSubmitted",
  recieves: null,
  broadcast: "newWord"
};

const P2_Makes_a_Guess = {
  emit: "letterGuess",
  recieves: null,
  broadcast: "guessedLetter"
};

const P1_Recieves_guessedLetter_broadcast = {
  //////////////////////////
  emit: "tryLetter",
  recieves: null,
  broadcast: "letterTried",
  //////////////////////////
  emit: "gameEndLose",
  receives: null,
  broadcast: "playerLost",
  //////////////////////////
  emit: "gameEndWin",
  receives: null,
  broadcast: "playerWon"
};
