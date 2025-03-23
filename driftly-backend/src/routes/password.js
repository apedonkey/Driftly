const express = require('express');
const router = express.Router();
const { forgotPassword, resetPassword } = require('../controllers/passwordController');
const { body } = require('express-validator');

// Forgot password route
router.post('/forgot-password', 
  [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail()
  ], 
  forgotPassword
);

// Reset password route
router.put('/reset-password/:resettoken', 
  [
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  resetPassword
);

module.exports = router;
