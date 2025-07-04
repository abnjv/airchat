const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// تقديم ملفات static من مجلد 'public'
app.use(express.static(path.join(__dirname, 'public')));

// عند الاتصال
io.on('connection', (socket) => {
    console.log('🎧 مستخدم جديد متصل');

    // استقبال الصوت من أحد المستخدمين وبثه للباقي
    socket.on('voice', (data) => {
        socket.broadcast.emit('voice', data);
    });

    // عند قطع الاتصال
    socket.on('disconnect', () => {
        console.log('❌ مستخدم قطع الاتصال');
    });
});

// تشغيل السيرفر على المنفذ 5000
server.listen(5000, () => {
    console.log('✅ السيرفر يعمل على https://airchat-8533.up.railway.app');
});
