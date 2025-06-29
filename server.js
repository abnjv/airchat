const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const chalk = require('chalk'); // ألوان للوحة الطرفية

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = new Map(); // تخزين المستخدمين socket.id => username

// تقديم ملفات HTML من مجلد public
app.use(express.static(path.join(__dirname, 'public')));

// عند اتصال مستخدم جديد
io.on('connection', (socket) => {
  console.log(chalk.blue('📶 مستخدم متصل: ' + socket.id));

  // عند دخول الغرفة
  socket.on('join', (username) => {
    users.set(socket.id, username);
    console.log(chalk.yellow(`✅ دخل الغرفة: ${username}`));
    sendUserList(); // تحديث القائمة للجميع
  });

  // عند الخروج من الغرفة بزر الخروج
  socket.on('leave', (username) => {
    users.delete(socket.id);
    console.log(chalk.red(`❌ خرج من الغرفة: ${username}`));
    sendUserList();
  });

  // عند انقطاع الاتصال
  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    if (username) {
      users.delete(socket.id);
      console.log(chalk.red(`❌ خرج بسبب انقطاع الاتصال: ${username}`));
      sendUserList();
    }
  });

  // دالة إرسال قائمة المستخدمين
  function sendUserList() {
    const userList = Array.from(users.values());
    io.emit('user-list', userList); // إرسال للجميع
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(chalk.green(`✅ السيرفر شغال على http://localhost:${PORT}`));
});
