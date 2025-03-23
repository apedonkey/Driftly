const express = require('express');
const router = express.Router();
const { 
  createFlow, 
  getFlows, 
  getFlow, 
  updateFlow, 
  deleteFlow,
  activateFlow,
  deactivateFlow
} = require('../controllers/flowController');
const { protect } = require('../middlewares/auth');

// Protect all routes
router.use(protect);

// Flow CRUD routes
router.route('/')
  .post(createFlow)
  .get(getFlows);

router.route('/:id')
  .get(getFlow)
  .put(updateFlow)
  .delete(deleteFlow);

// Flow activation/deactivation routes
router.put('/:id/activate', activateFlow);
router.put('/:id/deactivate', deactivateFlow);

module.exports = router;
