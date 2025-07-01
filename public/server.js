# Create a file with the provided server.js content and save it as server_final.js

server_js_code = """
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 5000;
const rooms = {}; // تخزين الغرف والمستخدمين

// تقديم ملفات الواجهة
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// الاتصال بالمستخدم
io.on("connection", socket => {
  console.log("🟢 متصل:", socket.id);

  // عند انضمام المستخدم لغرفة
  socket.on("join-room", ({ username, room }) => {
    socket.join(room);
    socket.username = username;
    socket.room = room;

    // أول من يدخل يصبح مضيف الغرفة
    if (!rooms[room]) {
      rooms[room] = { host: socket.id, users: {} };
    }

    rooms[room].users[socket.id] = username;

    console.log(`🚪 ${username} انضم إلى الغرفة ${room}`);

    // إرسال المستخدمين الحاليين للمستخدم الجديد
    const otherUsers = Object.keys(rooms[room].users)
      .filter(id => id !== socket.id);

    socket.emit("all-users", otherUsers);

    // إعلام الموجودين أن مستخدم جديد انضم
    socket.to(room).emit("user-connected", socket.id);
  });

  // استقبال وإرسال الإشارات (signal) الخاصة بـ WebRTC
  socket.on("signal", ({ targetId, signal }) => {
    io.to(targetId).emit("signal", {
      from: socket.id,
      signal,
    });
  });

  // قطع الاتصال
  socket.on("disconnect", () => {
    const room = socket.room;
    if (room && rooms[room]) {
      delete rooms[room].users[socket.id];
      socket.to(room).emit("user-disconnected", socket.id);
      console.log(`❌ ${socket.username} خرج من الغرفة ${room}`);

      // حذف الغرفة إن كان المضيف هو من خرج
      if (rooms[room].host === socket.id) {
        delete rooms[room];
        console.log(`🗑️ الغرفة ${room} تم حذفها`);
      }
    }
  });
});

// ✅ التعديل هنا لتشغيل السيرفر على جميع الشبكات
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ الخادم يعمل على http://0.0.0.0:${PORT}`);
});
"""

# Save the code to a file
file_path = "/mnt/data/server_final.js"
with open(file_path, "w") as f:
    f.write(server_js_code)

file_path
