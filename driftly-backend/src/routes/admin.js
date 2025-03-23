const express = require('express');
const router = express.Router();
const { 
  getBillingPlans, 
  createBillingPlan, 
  updateBillingPlan, 
  deleteBillingPlan,
  getSubscriptionStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

// Protect all routes and require admin role
router.use(protect);
router.use(authorize('admin'));

// Billing plan routes
router.route('/billing/plans')
  .get(getBillingPlans)
  .post(createBillingPlan);

router.route('/billing/plans/:id')
  .put(updateBillingPlan)
  .delete(deleteBillingPlan);

// Subscription statistics
router.get('/billing/stats', getSubscriptionStats);

module.exports = router; 