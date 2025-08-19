const asyncHandler = require('../middleware/asyncHandler');

// @desc    Chat with Gemini AI
// @route   POST /api/gemini/chat
// @access  Private
const chatWithGemini = asyncHandler(async (req, res) => {
    const { prompt, history } = req.body;

    if (!prompt) {
        res.status(400);
        throw new Error('A prompt is required.');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        res.status(500);
        throw new Error('Gemini API key is not configured on the server.');
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const payload = {
        contents: [
            ...(history || []), // Include previous history if provided
            { role: "user", parts: [{ text: prompt }] }
        ]
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        res.status(response.status);
        throw new Error(errorData.error.message || 'Gemini API request failed');
    }

    const data = await response.json();
    const modelResponse = data.candidates[0].content.parts[0].text;
    res.json({ response: modelResponse });
});

module.exports = {
    chatWithGemini,
};
