const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 5000;
const rooms = {};

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", socket => {
  console.log("🔌 مستخدم جديد:", socket.id);

  socket.on("join", ({ username, room }) => {
    socket.join(room);
    socket.username = username;
    socket.room = room;

    if (!rooms[room]) {
      rooms[room] = { host: socket.id, users: {} };
    }

    rooms[room].users[socket.id] = username;

    // إرسال للمستخدمين الحاليين أن شخص جديد دخل
    socket.to(room).emit("user-connected", socket.id);

    console.log(`👤 ${username} دخل الغرفة: ${room}`);
  });

  socket.on("offer", ({ to, offer }) => {
    io.to(to).emit("offer", { from: socket.id, offer });
  });

  socket.on("answer", ({ to, answer }) => {
    io.to(to).emit("answer", { from: socket.id, answer });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { from: socket.id, candidate });
  });

  socket.on("disconnect", () => {
    const room = socket.room;
    if (room && rooms[room]) {
      delete rooms[room].users[socket.id];
      socket.to(room).emit("user-disconnected", socket.id);
      console.log(`❌ ${socket.username} خرج من الغرفة ${room}`);

      // إذا كان هو المضيف نحذف الغرفة
      if (rooms[room].host === socket.id) {
        delete rooms[room];
        console.log(`🗑️ تم حذف الغرفة: ${room}`);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`✅ الخادم يعمل على http://localhost:${PORT}`);
});
