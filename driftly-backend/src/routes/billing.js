const express = require('express');
const router = express.Router();
const { 
  createCheckoutSession, 
  cancelSubscription, 
  updateSubscriptionQuantity,
  handleStripeEvent
} = require('../services/billingService');
const {
  getSubscriptionDetails,
  getBillingHistory,
  getSubscriptionMetrics,
  getBillingPlans,
  getBillingPlan,
  changePlan
} = require('../controllers/billingController');
const { protect } = require('../middlewares/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Protect routes except webhook
router.use('/webhook', express.raw({ type: 'application/json' }));
router.use(/^(?!\/webhook).*$/, protect);

// Subscription details routes
router.get('/subscription', getSubscriptionDetails);
router.get('/history', getBillingHistory);
router.get('/metrics', getSubscriptionMetrics);

// Plan routes
router.get('/plans', getBillingPlans);
router.get('/plans/:id', getBillingPlan);
router.post('/change-plan', changePlan);

// Create checkout session for subscription
router.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await createCheckoutSession(req.user.id);
    
    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Cancel subscription
router.post('/cancel-subscription', async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.subscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'No active subscription found'
      });
    }
    
    await cancelSubscription(user.subscriptionId);
    
    res.status(200).json({
      success: true,
      message: 'Subscription canceled successfully'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Update subscription quantity based on active flows
router.post('/update-subscription', async (req, res) => {
  try {
    const { activeFlowCount } = req.body;
    
    if (activeFlowCount === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Active flow count is required'
      });
    }
    
    const result = await updateSubscriptionQuantity(req.user.id, activeFlowCount);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Stripe webhook
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    await handleStripeEvent(event);
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ success: false, error: `Webhook Error: ${error.message}` });
  }
});

module.exports = router;
