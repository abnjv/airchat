// @desc    Chat with Gemini AI
// @route   POST /api/gemini/chat
// @access  Private
const chatWithGemini = async (req, res) => {
    const { prompt, history } = req.body;

    if (!prompt) {
        return res.status(400).json({ message: 'A prompt is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ message: 'Gemini API key is not configured on the server.' });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const payload = {
        contents: [
            ...(history || []), // Include previous history if provided
            { role: "user", parts: [{ text: prompt }] }
        ]
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message || 'Gemini API request failed');
        }

        const data = await response.json();
        const modelResponse = data.candidates[0].content.parts[0].text;
        res.json({ response: modelResponse });

    } catch (error) {
        console.error('Error calling Gemini API:', error.message);
        res.status(500).json({ message: 'Failed to get a response from Gemini AI.' });
    }
};

module.exports = {
    chatWithGemini,
};
