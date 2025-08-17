const express = require('express');
const router = express.Router();
const { chatWithGemini } = require('../controllers/geminiController');
const { protect } = require('../middleware/authMiddleware');

// Chat with Gemini
router.post('/chat', protect, chatWithGemini);

module.exports = router;
