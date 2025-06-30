const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let rooms = {}; // كل غرفة تحتوي على المستخدمين

io.on('connection', socket => {
  console.log('🟢 مستخدم متصل:', socket.id);

  socket.on('join', username => {
    const roomId = username; // كل اسم مستخدم = غرفة خاصة
    socket.join(roomId);
    socket.username = username;
    socket.roomId = roomId;

    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push(username);

    console.log(`✅ ${username} انضم للغرفة ${roomId}`);
    io.to(roomId).emit('update-users', rooms[roomId]);

    // إعلام الآخرين لبدء الاتصال
    socket.to(roomId).emit('user-connected', socket.id);
  });

  socket.on('leave', username => {
    const roomId = socket.roomId;
    if (roomId && rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter(user => user !== username);
      socket.leave(roomId);
      io.to(roomId).emit('update-users', rooms[roomId]);
      socket.to(roomId).emit('user-disconnected', socket.id);
      console.log(`🚪 ${username} غادر الغرفة ${roomId}`);
    }
  });

  socket.on('disconnect', () => {
    const roomId = socket.roomId;
    const username = socket.username;
    if (roomId && rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter(user => user !== username);
      io.to(roomId).emit('update-users', rooms[roomId]);
      socket.to(roomId).emit('user-disconnected', socket.id);
      console.log(`🔴 ${username} فصل الاتصال من الغرفة ${roomId}`);
    }
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
