const Room = require('../models/Room');
const User = require('../models/User');

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private
const createRoom = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Please provide a room name' });
    }

    try {
        const room = await Room.create({
            name,
            owner: req.user._id,
            participants: [req.user._id],
        });

        res.status(201).json(room);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while creating room' });
    }
};

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find({}).populate('participants', 'username');
        res.json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching rooms' });
    }
};

// @desc    Get room by ID
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate('participants', 'username');

        if (room) {
            res.json(room);
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching room' });
    }
};

module.exports = {
    createRoom,
    getRooms,
    getRoomById,
};
