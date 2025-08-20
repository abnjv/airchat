const Room = require('../models/Room');
const User = require('../models/User');
const Message = require('../models/Message'); // Import Message model
const jwt = require('jsonwebtoken');

// In-memory mapping of userId to socketId for signaling
const userSockets = {};

// Middleware for Socket.IO authentication
const socketAuthMiddleware = async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error: No token provided.'));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return next(new Error('Authentication error: User not found.'));
        }
        socket.user = user; // Attach user to the socket object
        next();
    } catch (err) {
        return next(new Error('Authentication error: Invalid token.'));
    }
};


// Helper function to relay signaling messages
const relayToUser = (io, socket, event, { toUserId, ...payload }) => {
    const toSocketId = userSockets[toUserId];
    if (toSocketId) {
        console.log(`Relaying event '${event}' to user ${toUserId}`);
        io.to(toSocketId).emit(event, payload);
    } else {
        socket.emit('user-unavailable', { userId: toUserId });
        console.log(`Could not find socket for user ${toUserId} to relay event '${event}'`);
    }
};


const socketHandler = (io) => {
    io.use(socketAuthMiddleware); // Apply authentication middleware

    io.on('connection', (socket) => {
        console.log(`Authenticated user connected: ${socket.user.username} (${socket.id})`);

        socket.on('register-socket', (userId) => {
            userSockets[userId] = socket.id;
            console.log(`Registered socket for user ${userId}`);
        });

        socket.on('joinRoom', async ({ username, room: roomId }) => {
            try {
                socket.join(roomId);
                console.log(`${username} (${socket.id}) joined room: ${roomId}`);

                const room = await Room.findByIdAndUpdate(
                    roomId,
                    { $addToSet: { participants: socket.user.id } },
                    { new: true }
                ).populate('participants', 'username profilePicture');

                if (room) {
                    socket.to(roomId).emit('user_joined', { username: socket.user.username });
                    io.to(roomId).emit('update_participants', room.participants);

                    // Fetch last 50 messages and send to the joining user
                    const history = await Message.find({ room: roomId })
                        .sort({ createdAt: -1 })
                        .limit(50)
                        .populate('sender', 'username profilePicture');

                    socket.emit('message_history', history.reverse());
                }
            } catch (error) {
                console.error(`Error in joinRoom event for room ${roomId}:`, error);
            }
        });

        socket.on('chatMessage', async ({ room, text }) => {
            try {
                // Create the message object
                const messageData = {
                    text: text,
                    sender: socket.user._id,
                    room: room,
                };

                // Save the message to the database
                const message = await Message.create(messageData);

                // Populate sender info for broadcasting
                const populatedMessage = await Message.findById(message._id).populate('sender', 'username profilePicture');

                // Broadcast the populated message to the room
                io.to(room).emit('message', populatedMessage);
            } catch (error) {
                console.error(`Error saving or broadcasting message for room ${room}:`, error);
            }
        });

        socket.on('private_message', async ({ conversationId, text }) => {
            try {
                const messageData = { text, sender: socket.user._id, conversation: conversationId };
                const message = await Message.create(messageData);
                const populatedMessage = await Message.findById(message._id).populate('sender', 'username profilePicture');

                const conversation = await Conversation.findById(conversationId);
                if(conversation) {
                    conversation.participants.forEach(participantId => {
                        const participantSocketId = userSockets[participantId.toString()];
                        if(participantSocketId) {
                            io.to(participantSocketId).emit('private_message', populatedMessage);
                        }
                    });
                    conversation.lastMessage = message._id;
                    await conversation.save();
                }
            } catch (error) {
                console.error('Error handling private message:', error);
            }
        });

        // --- WebRTC Signaling Events (Refactored) ---
        socket.on('voice-offer', (data) => relayToUser(io, socket, 'voice-offer', data));
        socket.on('voice-answer', (data) => relayToUser(io, socket, 'voice-answer', data));
        socket.on('ice-candidate', (data) => relayToUser(io, socket, 'ice-candidate', data));


        socket.on('kick-user', async ({ roomId, userIdToKick }) => {
            try {
                const room = await Room.findById(roomId);
                // Security Fix: Use the authenticated user from the socket connection
                if (room && room.owner.toString() === socket.user._id.toString()) {
                    const socketIdToKick = userSockets[userIdToKick];
                    if (socketIdToKick) {
                        io.to(socketIdToKick).emit('kicked', { roomName: room.name });
                        const socketToKick = io.sockets.sockets.get(socketIdToKick);
                        if (socketToKick) {
                            socketToKick.leave(roomId);
                        }
                        io.to(roomId).emit('message', `A user has been kicked from the room.`);
                    }
                } else {
                    socket.emit('permission-denied', { message: "You do not have permission to kick users from this room." });
                }
            } catch (error) {
                console.error('Error in kick-user event:', error);
                socket.emit('error', { message: 'An error occurred while trying to kick the user.' });
            }
        });

        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.user.username} (${socket.id})`);

            // Find rooms this user was a participant in
            const rooms = await Room.find({ participants: socket.user._id });

            for (const room of rooms) {
                // Remove user from room's participant list
                room.participants.pull(socket.user._id);
                await room.save();

                // Get the updated participant list
                const updatedRoom = await Room.findById(room._id).populate('participants', 'username profilePicture');

                // Notify remaining users in the room
                io.to(room._id.toString()).emit('update_participants', updatedRoom.participants);
            }

            // Clean up user from signaling map
            for (const userId in userSockets) {
                if (userSockets[userId] === socket.id) {
                    delete userSockets[userId];
                    console.log(`Unregistered socket for user ${userId}`);
                    break;
                }
            }
        });
    });
};

module.exports = socketHandler;
