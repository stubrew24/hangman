const socket = io();
const newGameForm = document.getElementById("new-game");
const joinGameForm = document.getElementById("join-game");

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

socket.on("newGame", console.log);
