const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');

// Load env vars and provide fallbacks
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/airchat';
const PORT = process.env.PORT || 3000;

// Route files
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Connect to Database
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected..."))
  .catch((err) => {
      console.error("MongoDB Connection Error:", err.message);
      // Removed process.exit(1) to allow server to run even if DB connection fails at start
  });

// Middleware
app.use(cors());
app.use(express.json());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('New user connected via Socket.IO');

    socket.on('joinRoom', ({ username, room }) => {
        socket.join(room);
        console.log(`${username} joined room: ${room}`);
        socket.to(room).emit('message', `${username} has joined the room`);
    });

    socket.on('chatMessage', ({ room, message }) => {
        io.to(room).emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected from Socket.IO');
    });
});

// Serve frontend
const frontendPath = path.resolve(__dirname, '../frontend');
app.use(express.static(frontendPath));

// All other GET requests not handled before will return our React app
app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.resolve(frontendPath, 'index.html'));
});

server.listen(PORT, () => {
    console.log(`AirChat Backend listening on port ${PORT}`);
});
