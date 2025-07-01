const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// خدمة ملفات HTML + CSS + JS من مجلد public
app.use(express.static(path.join(__dirname, 'public')));

// عند دخول المستخدم للرابط الأساسي
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// عند دخول المستخدم للرابط /room
app.get('/room', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'room.html'));
});

// WebSocket Socket.IO
io.on('connection', (socket) => {
  console.log('✅ مستخدم متصل:', socket.id);

  socket.on('join-room', ({ roomId, userName }) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', { id: socket.id, userName });

    // إرسال المستخدمين الجدد
    socket.on('send-signal', (data) => {
      socket.to(data.to).emit('receive-signal', {
        from: socket.id,
        signal: data.signal,
        userName: data.userName,
      });
    });

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-left', socket.id);
      console.log('❌ قطع الاتصال:', socket.id);
    });
  });
});

// تشغيل السيرفر على البورت 5000
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 AirChat Server يعمل على http://localhost:${PORT}`);
});
