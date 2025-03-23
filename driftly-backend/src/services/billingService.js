const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const BillingPlan = require('../models/BillingPlan');

// Create a checkout session for flow subscription
const createCheckoutSession = async (userId) => {
  try {
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_FLOW_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?canceled=true`,
      metadata: {
        userId: userId.toString()
      }
    });
    
    return session;
  } catch (error) {
    console.error('Stripe Error:', error);
    throw error;
  }
};

// Create a customer in Stripe
const createCustomer = async (email, name) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
    });
    
    return customer;
  } catch (error) {
    console.error('Stripe Error:', error);
    throw error;
  }
};

// Cancel a subscription
const cancelSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.del(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Stripe Error:', error);
    throw error;
  }
};

// Get subscription details
const getSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Stripe Error:', error);
    throw error;
  }
};

// Update subscription quantity based on active flows
const updateSubscriptionQuantity = async (userId, activeFlowCount) => {
  try {
    // Get user
    const user = await User.findById(userId);
    if (!user || !user.subscriptionId) {
      throw new Error('User or subscription not found');
    }

    // Get subscription
    const subscription = await Subscription.findOne({ 
      user: userId,
      stripeSubscriptionId: user.subscriptionId
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Only update if quantity is different
    if (subscription.flowCount !== activeFlowCount) {
      // Update subscription quantity in Stripe
      await stripe.subscriptions.update(user.subscriptionId, {
        items: [
          {
            id: (await stripe.subscriptions.retrieve(user.subscriptionId)).items.data[0].id,
            quantity: activeFlowCount > 0 ? activeFlowCount : 1, // Minimum 1
          },
        ],
      });

      // Update local subscription
      await Subscription.findByIdAndUpdate(subscription._id, {
        flowCount: activeFlowCount > 0 ? activeFlowCount : 1
      });
    }

    return { success: true, flowCount: activeFlowCount > 0 ? activeFlowCount : 1 };
  } catch (error) {
    console.error('Stripe Update Error:', error);
    throw error;
  }
};

// Handle Stripe webhook events
const handleStripeEvent = async (event) => {
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
        
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'payment_method.attached':
        // Payment method added to customer
        // You might want to update user payment methods if tracking them
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Stripe webhook error:', error);
    throw error;
  }
};

// Handle checkout.session.completed event
const handleCheckoutSessionCompleted = async (session) => {
  try {
    // Get user ID from metadata
    const userId = session.metadata.userId;
    
    // Get subscription ID
    const subscriptionId = session.subscription;
    
    // Update user with subscription info
    await User.findByIdAndUpdate(userId, {
      activeSubscription: true,
      subscriptionId
    });
    
    // Get subscription details
    const subscriptionDetails = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Create subscription record
    await Subscription.create({
      user: userId,
      stripeSubscriptionId: subscriptionId,
      status: subscriptionDetails.status,
      flowCount: 1, // Start with 1
      currentPeriodStart: new Date(subscriptionDetails.current_period_start * 1000),
      currentPeriodEnd: new Date(subscriptionDetails.current_period_end * 1000),
      cancelAtPeriodEnd: subscriptionDetails.cancel_at_period_end
    });
  } catch (error) {
    console.error('Checkout session handling error:', error);
    throw error;
  }
};

// Handle invoice.paid event
const handleInvoicePaid = async (invoice) => {
  try {
    // Get subscription ID
    const subscriptionId = invoice.subscription;
    
    // Get subscription
    const subscription = await Subscription.findOne({ stripeSubscriptionId: subscriptionId });
    
    if (!subscription) {
      return;
    }
    
    // Get subscription details
    const subscriptionDetails = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Update subscription record
    await Subscription.findByIdAndUpdate(subscription._id, {
      status: subscriptionDetails.status,
      currentPeriodStart: new Date(subscriptionDetails.current_period_start * 1000),
      currentPeriodEnd: new Date(subscriptionDetails.current_period_end * 1000),
      cancelAtPeriodEnd: subscriptionDetails.cancel_at_period_end
    });
  } catch (error) {
    console.error('Invoice paid handling error:', error);
    throw error;
  }
};

// Handle customer.subscription.deleted event
const handleSubscriptionDeleted = async (subscription) => {
  try {
    // Get subscription
    const subscriptionRecord = await Subscription.findOne({ 
      stripeSubscriptionId: subscription.id 
    });
    
    if (!subscriptionRecord) {
      return;
    }
    
    // Update user
    await User.findByIdAndUpdate(subscriptionRecord.user, {
      activeSubscription: false,
      subscriptionId: null
    });
    
    // Update subscription record
    await Subscription.findByIdAndUpdate(subscriptionRecord._id, {
      status: 'canceled'
    });
  } catch (error) {
    console.error('Subscription deleted handling error:', error);
    throw error;
  }
};

// Handle customer.subscription.updated event
const handleSubscriptionUpdated = async (subscription) => {
  try {
    // Get subscription
    const subscriptionRecord = await Subscription.findOne({ 
      stripeSubscriptionId: subscription.id 
    });
    
    if (!subscriptionRecord) {
      return;
    }
    
    // Update subscription record
    await Subscription.findByIdAndUpdate(subscriptionRecord._id, {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });
  } catch (error) {
    console.error('Subscription updated handling error:', error);
    throw error;
  }
};

// Handle payment failed event
const handlePaymentFailed = async (invoice) => {
  try {
    // Get subscription ID
    const subscriptionId = invoice.subscription;
    
    // Get subscription
    const subscription = await Subscription.findOne({ stripeSubscriptionId: subscriptionId });
    
    if (!subscription) {
      return;
    }
    
    // Update subscription record to reflect past_due status
    await Subscription.findByIdAndUpdate(subscription._id, {
      status: 'past_due',
    });

    // You could also notify the user via email or in-app notification
  } catch (error) {
    console.error('Payment failed handling error:', error);
    throw error;
  }
};

// Handle subscription created event
const handleSubscriptionCreated = async (subscription) => {
  try {
    // Get metadata from subscription
    const planId = subscription.metadata.planId;
    
    // Find customer
    const customer = await stripe.customers.retrieve(subscription.customer);
    
    // Find user by stripe customer ID
    const user = await User.findOne({ stripeCustomerId: subscription.customer });
    
    if (!user) {
      console.error('User not found for subscription:', subscription.id);
      return;
    }
    
    // Get plan details if available
    let plan = null;
    if (planId) {
      plan = await BillingPlan.findById(planId);
    }
    
    // Update user with subscription info
    await User.findByIdAndUpdate(user._id, {
      activeSubscription: true,
      subscriptionId: subscription.id
    });
    
    // Create or update subscription record
    const existingSubscription = await Subscription.findOne({ 
      user: user._id 
    });
    
    if (existingSubscription) {
      await Subscription.findByIdAndUpdate(existingSubscription._id, {
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        flowCount: plan ? plan.limits.maxFlows : 1,
        planType: plan ? plan.name : 'flow',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      });
    } else {
      await Subscription.create({
        user: user._id,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        flowCount: plan ? plan.limits.maxFlows : 1,
        planType: plan ? plan.name : 'flow',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      });
    }
  } catch (error) {
    console.error('Subscription created handling error:', error);
    throw error;
  }
};

module.exports = {
  createCheckoutSession,
  createCustomer,
  cancelSubscription,
  getSubscription,
  updateSubscriptionQuantity,
  handleStripeEvent
};
