var rooms = 0;

const sockets = io => {
  io.on("connection", socket => {
    console.log("user connected:", socket.id);

    socket.on("createGame", data => {
      socket.join(`room-${++rooms}`);
      socket.emit("newGame", { ...data, room: `room-${rooms}` });
    });

    socket.on("joinGame", data => {
      const room = io.nsps["/"].adapter.rooms[data.room];
      if (room && room.length === 1) {
        socket.join(data.room);
        socket.broadcast.to(data.room).emit("player1", { name: data.name });
        socket.emit("player2", { name: data.name, room: data.room });
        console.log(room);
      } else {
        socket.emit("err", { message: "Sorry, game is full." });
      }
    });

    socket.on("disconnect", () => console.log("user disconnected:", socket.id));
  });
};

module.exports.sockets = sockets;
