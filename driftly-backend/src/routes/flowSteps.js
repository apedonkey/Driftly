const express = require('express');
const router = express.Router();
const { 
  updateFlowSteps, 
  getFlowAnalytics 
} = require('../controllers/flowStepsController');
const { protect } = require('../middlewares/auth');

// Protect all routes
router.use(protect);

// Flow steps routes
router.put('/:id/steps', updateFlowSteps);

// Flow analytics route
router.get('/:id/analytics', getFlowAnalytics);

module.exports = router;
