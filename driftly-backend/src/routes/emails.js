const express = require('express');
const router = express.Router();
const { 
  sendTestEmail, 
  processEmails, 
  createSendGridTemplate,
  getFlowEmailStats
} = require('../controllers/emailController');
const { protect } = require('../middlewares/auth');

// Protect all routes
router.use(protect);

// Email routes
router.post('/test', sendTestEmail);
router.post('/process', processEmails);
router.post('/create-template', createSendGridTemplate);
router.get('/stats/:flowId', getFlowEmailStats);

module.exports = router;
