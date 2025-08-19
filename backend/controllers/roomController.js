const Room = require('../models/Room');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private
const createRoom = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Please provide a room name');
    }

    const room = await Room.create({
        name,
        owner: req.user._id,
        participants: [req.user._id],
    });

    res.status(201).json(room);
});

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
const getRooms = asyncHandler(async (req, res) => {
    const rooms = await Room.find({}).populate('participants', 'username');
    res.json(rooms);
});

// @desc    Get room by ID
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id).populate('participants', 'username');

    if (room) {
        res.json(room);
    } else {
        res.status(404);
        throw new Error('Room not found');
    }
});

module.exports = {
    createRoom,
    getRooms,
    getRoomById,
};
