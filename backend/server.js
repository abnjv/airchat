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
const profileRoutes = require('./routes/profileRoutes');

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
  });

// Middleware
app.use(cors());
app.use(express.json());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/gemini', require('./routes/geminiRoutes'));

// In-memory mapping of userId to socketId for signaling
const userSockets = {};

// Socket.IO connection
io.on('connection', (socket) => {
    console.log(`New user connected: ${socket.id}`);

    socket.on('register-socket', (userId) => {
        userSockets[userId] = socket.id;
        console.log(`Registered socket for user ${userId}`);
    });

    socket.on('joinRoom', ({ username, room }) => {
        socket.join(room);
        console.log(`${username} (${socket.id}) joined room: ${room}`);
        socket.to(room).emit('message', `${username} has joined the room`);
    });

    socket.on('chatMessage', ({ room, message }) => {
        io.to(room).emit('message', message);
    });

    // --- WebRTC Signaling Events ---

    // Offer sent from User A to User B
    socket.on('voice-offer', ({ offer, toUserId, fromUser }) => {
        const toSocketId = userSockets[toUserId];
        if (toSocketId) {
            console.log(`Relaying voice offer from ${fromUser.username} to ${toUserId}`);
            io.to(toSocketId).emit('voice-offer', { offer, fromUser });
        }
    });

    // Answer sent from User B back to User A
    socket.on('voice-answer', ({ answer, toUserId, fromUser }) => {
        const toSocketId = userSockets[toUserId];
        if (toSocketId) {
            console.log(`Relaying voice answer from ${fromUser.username} to ${toUserId}`);
            io.to(toSocketId).emit('voice-answer', { answer, fromUser });
        }
    });

    // ICE candidates exchanged between peers
    socket.on('ice-candidate', ({ candidate, toUserId }) => {
        const toSocketId = userSockets[toUserId];
        if (toSocketId) {
            io.to(toSocketId).emit('ice-candidate', { candidate });
        }
    });


    socket.on('kick-user', async ({ roomId, userIdToKick, requestingUserId }) => {
        const room = await Room.findById(roomId);

        // Check if the requesting user is the owner
        if (room && room.owner.toString() === requestingUserId) {
            const socketIdToKick = userSockets[userIdToKick];
            if (socketIdToKick) {
                // Have the user leave the socket.io room and notify them
                io.to(socketIdToKick).emit('kicked', { roomName: room.name });
                const socketToKick = io.sockets.sockets.get(socketIdToKick);
                if(socketToKick) {
                    socketToKick.leave(roomId);
                }
                io.to(roomId).emit('message', `A user has been kicked from the room.`);
            }
        } else {
            // Notify requester that they don't have permission
            socket.emit('message', "You do not have permission to kick users from this room.");
        }
    });

    socket.on('disconnect', () => {
        // Clean up user from mapping on disconnect
        for (const userId in userSockets) {
            if (userSockets[userId] === socket.id) {
                delete userSockets[userId];
                console.log(`Unregistered socket for user ${userId}`);
                break;
            }
        }
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Serve frontend
const frontendPath = path.resolve(__dirname, '../frontend');
app.use(express.static(frontendPath));

app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.resolve(frontendPath, 'index.html'));
});

server.listen(PORT, () => {
    console.log(`AirChat Backend listening on port ${PORT}`);
});
