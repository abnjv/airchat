const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateUserProfilePicture,
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

// Get a user's profile
router.get('/:userId', getUserProfile);

// Update the current user's profile picture
router.put('/picture', protect, updateUserProfilePicture);

module.exports = router;
