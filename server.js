const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

const rooms = {};

io.on("connection", socket => {
  socket.on("joinRoom", ({ username, room }) => {
    socket.join(room);
    if (!rooms[room]) rooms[room] = [];
    rooms[room].push({ id: socket.id, username });
    io.to(room).emit("roomUsers", { users: rooms[room] });
  });

  socket.on("disconnect", () => {
    for (const room in rooms) {
      rooms[room] = rooms[room].filter(user => user.id !== socket.id);
      io.to(room).emit("roomUsers", { users: rooms[room] });
    }
  });
});

server.listen(3000, () => console.log("Server is running"));