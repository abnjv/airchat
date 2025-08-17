const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/profile/:userId
// @access  Public
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user profile picture
// @route   PUT /api/profile/picture
// @access  Private
const updateUserProfilePicture = async (req, res) => {
    // In a real application, this would handle a file upload.
    // For now, we'll accept a URL from the request body.
    // This simulates the outcome of an upload (i.e., getting a URL).
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ message: 'Image URL is required' });
    }

    try {
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
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfilePicture,
};
