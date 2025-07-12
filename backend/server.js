require('dotenv').config(); // تحميل متغيرات البيئة من ملف .env

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose'); // استيراد mongoose

// استيراد نماذج البيانات
const User = require('./models/User');
const Room = require('./models/Room');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // السماح بالوصول من أي مصدر (للتطوير)
        methods: ["GET", "POST"]
    }
});

// استخدام CORS للسماح للواجهة الأمامية بالاتصال
app.use(cors());
// للسماح للسيرفر بقراءة JSON من الطلبات
app.use(express.json());

// توصيل قاعدة البيانات MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.error(err));

const PORT = process.env.PORT || 3000; // المنفذ الذي سيعمل عليه السيرفر

// مسار اختبار بسيط للتحقق من أن السيرفر يعمل
app.get('/', (req, res) => {
    res.send('AirChat Backend is running!');
});

// تعريف مسارات الـ API (سنضيفها لاحقاً هنا)
// مثال:
// app.post('/api/users/register', (req, res) => { ... });
// app.post('/api/users/login', (req, res) => { ... });

// بدء تشغيل سيرفر Socket.IO
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // مثال: استقبال رسائل الدردشة
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        io.emit('chat message', msg); // إرسال الرسالة إلى جميع المتصلين
    });

    // مثال: عند انفصال المستخدم
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// بدء تشغيل سيرفر HTTP
server.listen(PORT, () => {
    console.log(`AirChat Backend listening on port ${PORT}`);
    console.log(`Access it at http://localhost:${PORT}`);
});
