const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Register a new user
// @route   POST /api/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({ name, email, password });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/login
// @access  Public
// Update login function to use generateTokens
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const { accessToken, refreshToken } = generateTokens(user);

        // Save refresh token to database
        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Generate JWT
// Generate tokens function
const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '15m' } // Shorter expiry for access token
    );

    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' } // Longer expiry for refresh token
    );

    return { accessToken, refreshToken };
};

// @desc    Refresh token
// @route   POST /api/refresh-token
// @access  Public
// Refresh Token Controller
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token required' });
    }

    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Find user with this refresh token
        const user = await User.findOne({
            _id: decoded.id,
            refreshToken
        });

        if (!user) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        // Generate new tokens
        const { accessToken, newRefreshToken } = generateTokens(user);

        // Update refresh token in database
        user.refreshToken = newRefreshToken;
        await user.save();

        res.json({
            accessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        console.error(error);
        res.status(403).json({ message: 'Invalid or expired refresh token' });
    }
};

// @desc    Logout user
// @route   POST /api/logout
// @access  Private
const logoutUser = async (req, res) => {
    try {
        // Get user from request (set by auth middleware)
        const user = req.user;

        // Clear the refresh token from database
        if (user) {
            await user.clearRefreshToken();
        }

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
};

// Update your exports to include logout
module.exports = {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser
};
