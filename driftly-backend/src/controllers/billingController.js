const User = require('../models/User');
const Subscription = require('../models/Subscription');
const BillingPlan = require('../models/BillingPlan');
const { getSubscription } = require('../services/billingService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Get current subscription details
// @route   GET /api/billing/subscription
// @access  Private
exports.getSubscriptionDetails = async (req, res) => {
  try {
    // Find user subscription
    const subscription = await Subscription.findOne({ user: req.user.id });
    
    if (!subscription) {
      return res.status(200).json({
        success: true,
        data: {
          isActive: false,
          subscription: null
        }
      });
    }
    
    // Get fresh data from Stripe
    let stripeSubscription = null;
    if (subscription.stripeSubscriptionId) {
      try {
        stripeSubscription = await getSubscription(subscription.stripeSubscriptionId);
      } catch (error) {
        console.error('Error fetching Stripe subscription:', error);
        // Continue with local data if Stripe API fails
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        isActive: subscription.status === 'active',
        subscription: {
          id: subscription._id,
          status: subscription.status,
          flowCount: subscription.flowCount,
          planType: subscription.planType,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          stripeData: stripeSubscription || null
        }
      }
    });
  } catch (error) {
    console.error('Get subscription details error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get billing history (invoices)
// @route   GET /api/billing/history
// @access  Private
exports.getBillingHistory = async (req, res) => {
  try {
    // Get user
    const user = await User.findById(req.user.id);
    
    if (!user.stripeCustomerId) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    // Get invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: 10
    });
    
    // Format invoices for response
    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      amountPaid: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency,
      status: invoice.status,
      date: new Date(invoice.created * 1000),
      invoiceUrl: invoice.hosted_invoice_url,
      pdfUrl: invoice.invoice_pdf,
      description: invoice.lines.data[0]?.description || 'Subscription payment'
    }));
    
    res.status(200).json({
      success: true,
      data: formattedInvoices
    });
  } catch (error) {
    console.error('Get billing history error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get subscription usage metrics
// @route   GET /api/billing/metrics
// @access  Private
exports.getSubscriptionMetrics = async (req, res) => {
  try {
    // Get user subscription
    const subscription = await Subscription.findOne({ user: req.user.id });
    
    if (!subscription || subscription.status !== 'active') {
      return res.status(200).json({
        success: true,
        data: {
          isActive: false,
          metrics: null
        }
      });
    }
    
    // Count active flows
    const flowCount = subscription.flowCount || 1;
    
    // Calculate days remaining in billing period
    const now = new Date();
    const periodEnd = new Date(subscription.currentPeriodEnd);
    const daysRemaining = Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24));
    
    // Calculate renewal date
    const renewalDate = periodEnd.toISOString().split('T')[0];
    
    res.status(200).json({
      success: true,
      data: {
        isActive: true,
        metrics: {
          flowCount,
          flowLimit: flowCount, // Currently limited to what they're paying for
          daysRemaining,
          renewalDate,
          planType: subscription.planType
        }
      }
    });
  } catch (error) {
    console.error('Get subscription metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get all available billing plans
// @route   GET /api/billing/plans
// @access  Private
exports.getBillingPlans = async (req, res) => {
  try {
    // Get all active plans
    const plans = await BillingPlan.find({ isActive: true })
      .sort({ displayOrder: 1 });
    
    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    console.error('Get billing plans error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get a single billing plan
// @route   GET /api/billing/plans/:id
// @access  Private
exports.getBillingPlan = async (req, res) => {
  try {
    const plan = await BillingPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Get billing plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Create checkout session for plan upgrade/change
// @route   POST /api/billing/change-plan
// @access  Private
exports.changePlan = async (req, res) => {
  try {
    const { planId } = req.body;
    
    if (!planId) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID is required'
      });
    }
    
    // Get the plan
    const plan = await BillingPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found or inactive'
      });
    }
    
    // Get user
    const user = await User.findById(req.user.id);
    if (!user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        error: 'No Stripe customer found'
      });
    }
    
    // Get current subscription
    const subscription = await Subscription.findOne({ user: req.user.id });
    
    let session;
    
    // If user has an active subscription, create update checkout session
    if (subscription && subscription.status === 'active') {
      session = await stripe.checkout.sessions.create({
        customer: user.stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.stripePriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
        cancel_url: `${process.env.FRONTEND_URL}/dashboard?canceled=true`,
        subscription_data: {
          metadata: {
            planId: plan._id.toString()
          }
        }
      });
    } else {
      // New subscription
      session = await stripe.checkout.sessions.create({
        customer: user.stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.stripePriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
        cancel_url: `${process.env.FRONTEND_URL}/dashboard?canceled=true`,
        subscription_data: {
          metadata: {
            planId: plan._id.toString()
          }
        },
        metadata: {
          userId: req.user.id
        }
      });
    }
    
    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Change plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}; 