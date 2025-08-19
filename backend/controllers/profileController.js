const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

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

// @desc    Update user profile picture
// @route   PUT /api/profile/picture
// @access  Private
const updateUserProfilePicture = asyncHandler(async (req, res) => {
    // In a real application, this would handle a file upload.
    // For now, we'll accept a URL from the request body.
    const { imageUrl } = req.body;

    if (!imageUrl) {
        res.status(400);
        throw new Error('Image URL is required');
    }

    const user = await User.findById(req.user.id);

    if (user) {
        user.profilePicture = imageUrl;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            profilePicture: updatedUser.profilePicture,
        });
    } else {
        // This case is unlikely if the user is authenticated via protect middleware
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    getUserProfile,
    updateUserProfilePicture,
};
