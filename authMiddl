const jwt = require('jsonwebtoken');
const User = require('../models/User'); // استيراد نموذج المستخدم

const protect = async (req, res, next) => {
    let token;

    // 1. Check if the request headers contain a JWT token starting with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (removes 'Bearer ')
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify token
            // jwt.verify() will decode the token using the secret key from .env
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Find the user associated with the token (excluding password)
            // req.user will contain the user object, making it accessible in the following routes
            req.user = await User.findById(decoded.id).select('-password');

            // 4. Move to the next middleware or route handler
            next();

        } catch (error) {
            console.error('Not authorized, token failed:', error.message);
            res.status(401).json({ message: 'Not authorized, invalid token' });
        }
    }

    // 5. If no token is found in the headers
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

module.exports = { protect };
