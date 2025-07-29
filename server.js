
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const User = require('./models/User');
const Room = require('./models/Room');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.error("MongoDB Error:", err));

app.use(express.json());

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('joinRoom', ({ username, room }) => {
        socket.join(room);
        socket.to(room).emit('message', `${username} has joined the room`);
    });

    socket.on('chatMessage', ({ room, message }) => {
        io.to(room).emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

app.get('/', (req, res) => {
    res.send('AirChat Backend is running');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`AirChat Backend listening on port ${PORT}`);
});
