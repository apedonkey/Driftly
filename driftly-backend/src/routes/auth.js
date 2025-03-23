const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { validateRegister, validateLogin, validateProfileUpdate, validatePasswordChange } = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');

// Register route
router.post('/register', validateRegister, register);

// Login route
router.post('/login', validateLogin, login);

// Get current user route (protected)
router.get('/me', protect, getMe);

// Update profile route (protected)
router.put('/profile', protect, validateProfileUpdate, updateProfile);

// Change password route (protected)
router.put('/change-password', protect, validatePasswordChange, changePassword);

module.exports = router;
