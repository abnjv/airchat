const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/profile/:userId
// @access  Public
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile (bio, etc.)
// @route   PUT /api/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.bio = req.body.bio || user.bio;
        // Add other fields to update here in the future

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            profilePicture: updatedUser.profilePicture,
            bio: updatedUser.bio,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});


// @desc    Upload new profile picture
// @route   POST /api/profile/upload
// @access  Private
const uploadProfilePicture = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        // The path to the uploaded file is available in req.file.path
        // Note: In a real production app, you'd want to handle removing the old picture
        // and also serve the 'uploads' directory statically.
        user.profilePicture = `/${req.file.path}`;
        const updatedUser = await user.save();

        res.json({
            message: 'Image uploaded successfully',
            profilePicture: updatedUser.profilePicture,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    getUserProfile,
    updateUserProfile,
    uploadProfilePicture,
};
