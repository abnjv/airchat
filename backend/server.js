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
const CORS_ORIGIN = process.env.CORS_ORIGIN || `http://localhost:${PORT}`;

// Route files
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const profileRoutes = require('./routes/profileRoutes');
const conversationRoutes = require('./routes/conversationRoutes');

const app = express();
const server = http.createServer(app);

const corsOptions = {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
};

const io = new Server(server, {
    cors: corsOptions
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
app.use(cors(corsOptions));
app.use(express.json());

// Make io accessible to our router
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/gemini', require('./routes/geminiRoutes'));

const socketHandler = require('./socket/socketHandler');

// Handle Socket.IO connections
socketHandler(io);

// Serve static assets from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

if (process.env.NODE_ENV === 'production') {
    // In production, serve the built frontend assets
    const buildPath = path.resolve(__dirname, '../dist');
    app.use(express.static(buildPath));

    // For any other request, serve the index.html
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(buildPath, 'index.html'));
    });
} else {
    // In development, the Vite server handles the frontend
    // We can add a simple message for the root path
    app.get('/', (req, res) => {
        res.send('API is running... (Vite dev server should be used for frontend)');
    });
}

// Custom error handler middleware
app.use((err, req, res, next) => {
    console.error(`Error: ${err.message}`);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
});

server.listen(PORT, () => {
    console.log(`AirChat Backend listening on port ${PORT}`);
});
