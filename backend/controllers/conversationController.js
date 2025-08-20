const asyncHandler = require('../middleware/asyncHandler');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// @desc    Create or fetch a 1-on-1 conversation
// @route   POST /api/conversations
// @access  Private
const createConversation = asyncHandler(async (req, res) => {
    const { userId } = req.body; // The other user's ID

    if (!userId) {
        res.status(400);
        throw new Error('User ID is required to start a conversation');
    }

    // Check if a conversation with these two participants already exists
    let conversation = await Conversation.findOne({
        participants: { $all: [req.user._id, userId] }
    });

    if (conversation) {
        // If it exists, return the existing conversation
        res.status(200).json(conversation);
    } else {
        // If not, create a new one
        const newConversation = await Conversation.create({
            participants: [req.user._id, userId]
        });
        res.status(201).json(newConversation);
    }
});


// @desc    Get all conversations for the current user
// @route   GET /api/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
    const conversations = await Conversation.find({ participants: req.user._id })
        .populate('participants', 'username profilePicture')
        .populate('lastMessage')
        .sort({ updatedAt: -1 });

    res.json(conversations);
});


module.exports = {
    createConversation,
    getConversations,
};
