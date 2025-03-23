const express = require('express');
const router = express.Router();
const { handleEmailEvent } = require('../services/emailService');

// SendGrid webhook endpoint for email events
router.post('/webhook', async (req, res) => {
  try {
    const events = req.body;
    
    if (!Array.isArray(events)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event data'
      });
    }
    
    await handleEmailEvent(events);
    
    res.status(200).json({
      success: true,
      message: 'Events processed successfully'
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
