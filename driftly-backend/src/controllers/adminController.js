const User = require('../models/User');
const BillingPlan = require('../models/BillingPlan');
const Subscription = require('../models/Subscription');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Get all billing plans (admin)
// @route   GET /api/admin/billing/plans
// @access  Private/Admin
exports.getBillingPlans = async (req, res) => {
  try {
    // Get all plans, including inactive ones
    const plans = await BillingPlan.find().sort({ displayOrder: 1 });
    
    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    console.error('Admin get billing plans error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Create a new billing plan
// @route   POST /api/admin/billing/plans
// @access  Private/Admin
exports.createBillingPlan = async (req, res) => {
  try {
    // Create Stripe product and price first
    const stripeProduct = await stripe.products.create({
      name: req.body.name,
      description: req.body.description
    });
    
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(req.body.price * 100), // Convert to cents
      currency: req.body.currency || 'usd',
      recurring: {
        interval: req.body.interval || 'month'
      },
      metadata: {
        plan_name: req.body.name
      }
    });
    
    // Create plan in database with Stripe ID reference
    req.body.stripePriceId = stripePrice.id;
    
    const billingPlan = await BillingPlan.create(req.body);
    
    res.status(201).json({
      success: true,
      data: billingPlan
    });
  } catch (error) {
    console.error('Create billing plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update a billing plan
// @route   PUT /api/admin/billing/plans/:id
// @access  Private/Admin
exports.updateBillingPlan = async (req, res) => {
  try {
    let plan = await BillingPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }
    
    // Update in Stripe if needed - note that price changes typically 
    // create new prices in Stripe rather than updating existing ones
    if (req.body.name !== plan.name || req.body.description !== plan.description) {
      try {
        const priceObject = await stripe.prices.retrieve(plan.stripePriceId);
        await stripe.products.update(priceObject.product, {
          name: req.body.name,
          description: req.body.description
        });
      } catch (error) {
        console.error('Stripe product update error:', error);
        // Continue anyway, as we might want to update local data even if Stripe fails
      }
    }
    
    // If price changed, we need to create a new price in Stripe
    if (req.body.price && req.body.price !== plan.price) {
      try {
        const oldPriceObject = await stripe.prices.retrieve(plan.stripePriceId);
        
        // Create new price
        const newPrice = await stripe.prices.create({
          product: oldPriceObject.product,
          unit_amount: Math.round(req.body.price * 100),
          currency: req.body.currency || plan.currency,
          recurring: {
            interval: req.body.interval || plan.interval
          },
          metadata: {
            plan_name: req.body.name || plan.name
          }
        });
        
        // Update with new price ID
        req.body.stripePriceId = newPrice.id;
        
        // Archive old price
        await stripe.prices.update(plan.stripePriceId, { active: false });
      } catch (error) {
        console.error('Stripe price update error:', error);
        // Continue without price update if Stripe fails
        delete req.body.price;
        delete req.body.stripePriceId;
      }
    }
    
    // Update in database
    plan = await BillingPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Update billing plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete a billing plan
// @route   DELETE /api/admin/billing/plans/:id
// @access  Private/Admin
exports.deleteBillingPlan = async (req, res) => {
  try {
    const plan = await BillingPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }
    
    // Check if there are active subscriptions using this plan
    const activeSubscriptions = await Subscription.find({ 
      planType: plan.name, 
      status: 'active' 
    });
    
    if (activeSubscriptions.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete plan with active subscriptions'
      });
    }
    
    // Archive in Stripe
    try {
      const priceObject = await stripe.prices.retrieve(plan.stripePriceId);
      await stripe.prices.update(plan.stripePriceId, { active: false });
      await stripe.products.update(priceObject.product, { active: false });
    } catch (error) {
      console.error('Stripe archive error:', error);
      // Continue with deletion anyway
    }
    
    // Delete from database
    await plan.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete billing plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get subscription statistics for admin
// @route   GET /api/admin/billing/stats
// @access  Private/Admin
exports.getSubscriptionStats = async (req, res) => {
  try {
    // Get total active subscriptions count
    const activeSubscriptionsCount = await Subscription.countDocuments({ 
      status: 'active' 
    });
    
    // Get total subscriptions across all statuses
    const totalSubscriptionsCount = await Subscription.countDocuments();
    
    // Count subscriptions by type/plan
    const subscriptionsByPlan = await Subscription.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$planType', count: { $sum: 1 } } }
    ]);
    
    // Get recent subscriptions
    const recentSubscriptions = await Subscription.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');
    
    res.status(200).json({
      success: true,
      data: {
        activeSubscriptions: activeSubscriptionsCount,
        totalSubscriptions: totalSubscriptionsCount,
        subscriptionsByPlan,
        recentSubscriptions
      }
    });
  } catch (error) {
    console.error('Get subscription stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}; 