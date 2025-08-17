const express = require('express');
const router = express.Router();
const {
    createRoom,
    getRooms,
    getRoomById,
} = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

// Route to get all rooms and create a new room
router.route('/')
    .get(getRooms)
    .post(protect, createRoom); // Protect the create room route

// Route to get a single room by ID
router.route('/:id')
    .get(getRoomById);

module.exports = router;
