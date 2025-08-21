const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateUserProfile,
    uploadProfilePicture,
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Make sure this folder exists
    },
    filename: function (req, file, cb) {
        cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// Get a user's profile by ID
router.get('/:userId', getUserProfile);

// Update current user's profile (bio, etc.)
router.put('/', protect, updateUserProfile);

// Upload a new profile picture
router.post('/upload', protect, upload.single('profilePicture'), uploadProfilePicture);

module.exports = router;
