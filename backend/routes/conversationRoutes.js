const express = require('express');
const router = express.Router();
const {
    createConversation,
    getConversations,
} = require('../controllers/conversationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getConversations)
    .post(protect, createConversation);

module.exports = router;
