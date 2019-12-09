var rooms = 0;

const sockets = io => {
  io.on("connection", socket => {
    // console.log("user connected:", socket.id);

    socket.on("createGame", data => {
      socket.join(`room-${++rooms}`);
      socket.emit("newGame", { ...data, room: `room-${rooms}` });
    });

    socket.on("joinGame", data => {
      const room = io.nsps["/"].adapter.rooms[data.room];
      if (room && room.length === 1) {
        socket.join(data.room);
        socket.broadcast
          .to(data.room)
          .emit("playerJoined", { name: data.name });
        socket.emit("joinedRoom", { name: data.name, room: data.room });
        // console.log(room);
      } else {
        socket.emit("err", { message: "Sorry, game is full." });
      }
    });

    socket.on("wordSubmitted", data => {
      socket.broadcast.to(data.room).emit("newWord", { hits: data.hits });
    });

    socket.on("letterGuess", data => {
      socket.broadcast
        .to(data.room)
        .emit("guessedLetter", { letter: data.letter });
    });

    socket.on("tryLetter", data => {
      socket.broadcast
        .to(data.room)
        .emit("letterTried", { misses: data.misses, hits: data.hits });
    });

    socket.on("gameEndWin", data => {
      socket.broadcast
        .to(data.room)
        .emit("playerWon", { misses: data.misses, hits: data.hits });
    });

    socket.on("gameEndLose", data => {
      socket.broadcast
        .to(data.room)
        .emit("playerLost", { misses: data.misses, hits: data.hits });
    });

    socket.on("resetGame", data => {
      socket.broadcast.to(data.room).emit("resetBoard", { ...data });
    });

    socket.on("disconnect", () => console.log("user disconnected:", socket.id));
  });
};

module.exports.sockets = sockets;
