const socket = io();
const newGameForm = document.getElementById("new-game");
const joinGameForm = document.getElementById("join-game");
const gameDisplay = document.getElementById("game-display");
const gameStatus = document.getElementById("game-status");
let room;

newGameForm.addEventListener("submit", e => {
  e.preventDefault();
  const name = e.target.name.value;
  socket.emit("createGame", { name });
});

joinGameForm.addEventListener("submit", e => {
  e.preventDefault();
  const name = e.target.name.value;
  const game = e.target.game.value;
  console.log(name, game);
  if (!name || !game) return;
  socket.emit("joinGame", { name, room: `room-${game}` });
});

socket.on("newGame", data => {
  hideStartPage();
  room = data.room;
  gameStatus.innerText = `Room: ${data.room}. Waiting for opponent to join...`;
  showGamePage(data);
});

socket.on("joinedRoom", data => {
  hideStartPage();
  room = data.room;
  showGamePage(data);
});

const hideStartPage = () => {
  newGameForm.style.display = "none";
  joinGameForm.style.display = "none";
};

const showGamePage = data => {
  gameDisplay.style.display = "inline";
};

const roomToInt = room => {
  return room.split("-")[1];
};
