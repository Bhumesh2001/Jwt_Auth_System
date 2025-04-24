const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getUserProfile } = require('../controllers/profileController');

const router = express.Router();

router.get('/profile', protect, getUserProfile);

module.exports = router;