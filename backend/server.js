require('dotenv').config(); // تحميل متغيرات .env

const PORT = process.env.PORT || 3000;
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const User = require('./models/User');
const Room = require('./models/Room');
const authRoutes = require('./routes/authRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// إعدادات CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));

// تحويل البيانات إلى JSON
app.use(express.json());

// الاتصال بقاعدة بيانات MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected...'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// نقطة فحص السيرفر
app.get('/', (req, res) => {
  res.send('AirChat Backend is running!');
});

// مسارات المصادقة
app.use('/api/auth', authRoutes);

// WebSocket مع Socket.IO
io.on('connection', (socket) => {
  console.log('✅ A user connected:', socket.id);

  socket.on('chat message', (msg) => {
    console.log('💬 Chat message:', msg);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// تشغيل السيرفر
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Access it at http://localhost:${PORT}`);
});
