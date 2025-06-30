const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = new Set();

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
  let currentUser = '';

  socket.on('join', username => {
    currentUser = username;
    users.add(username);
    io.emit('update-users', Array.from(users));
    socket.broadcast.emit('user-connected', socket.id);
  });

  socket.on('leave', () => {
    users.delete(currentUser);
    io.emit('update-users', Array.from(users));
    socket.broadcast.emit('user-disconnected', socket.id);
  });

  socket.on('disconnect', () => {
    users.delete(currentUser);
    io.emit('update-users', Array.from(users));
    socket.broadcast.emit('user-disconnected', socket.id);
  });

  socket.on('offer', (id, description) => {
    socket.to(id).emit('offer', socket.id, description);
  });

  socket.on('answer', (id, description) => {
    socket.to(id).emit('answer', socket.id, description);
  });

  socket.on('ice-candidate', (id, candidate) => {
    socket.to(id).emit('ice-candidate', socket.id, candidate);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
