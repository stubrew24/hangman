const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;
const { sockets } = require("./sockets");
var enforce = require("express-sslify");

app.use(enforce.HTTPS({ trustProtoHeader: true }));

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

sockets(io);

http.listen(port, console.log("Listening on port " + port));
