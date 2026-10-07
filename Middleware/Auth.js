// Middleware/Auth.js
// Import the jsonwebtoken library to generate and verify JWT tokens
// Import the dotenv library to load environment variables from the .env file
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


//middleware to verify the JWT token 
const protect = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Extract the token from the Authorization header
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};


module.exports = { protect }; // Export the protect middleware for use in other parts of the application
