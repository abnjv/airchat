const Room = require('../models/Room');

// In-memory mapping of userId to socketId for signaling
const userSockets = {};

// Helper function to relay signaling messages
const relayToUser = (io, socket, event, { toUserId, ...payload }) => {
    const toSocketId = userSockets[toUserId];
    if (toSocketId) {
        console.log(`Relaying event '${event}' to user ${toUserId}`);
        io.to(toSocketId).emit(event, payload);
    } else {
        // Optional: notify sender that user is not available
        socket.emit('user-unavailable', { userId: toUserId });
        console.log(`Could not find socket for user ${toUserId} to relay event '${event}'`);
    }
};


const socketHandler = (io) => {
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

        // --- WebRTC Signaling Events (Refactored) ---
        socket.on('voice-offer', (data) => relayToUser(io, socket, 'voice-offer', data));
        socket.on('voice-answer', (data) => relayToUser(io, socket, 'voice-answer', data));
        socket.on('ice-candidate', (data) => relayToUser(io, socket, 'ice-candidate', data));


        socket.on('kick-user', async ({ roomId, userIdToKick, requestingUserId }) => {
            try {
                const room = await Room.findById(roomId);

                // Check if the requesting user is the owner
                if (room && room.owner.toString() === requestingUserId) {
                    const socketIdToKick = userSockets[userIdToKick];
                    if (socketIdToKick) {
                        // Have the user leave the socket.io room and notify them
                        io.to(socketIdToKick).emit('kicked', { roomName: room.name });
                        const socketToKick = io.sockets.sockets.get(socketIdToKick);
                        if (socketToKick) {
                            socketToKick.leave(roomId);
                        }
                        io.to(roomId).emit('message', `A user has been kicked from the room.`);
                    }
                } else {
                    // Notify requester that they don't have permission
                    socket.emit('permission-denied', { message: "You do not have permission to kick users from this room." });
                }
            } catch (error) {
                console.error('Error in kick-user event:', error);
                socket.emit('error', { message: 'An error occurred while trying to kick the user.' });
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
};

module.exports = socketHandler;
