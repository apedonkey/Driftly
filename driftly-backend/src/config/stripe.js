const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a checkout session for flow subscription
const createCheckoutSession = async (customerId, priceId) => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId || process.env.STRIPE_FLOW_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?canceled=true`,
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

module.exports = {
  createCheckoutSession,
  createCustomer,
  cancelSubscription,
  getSubscription,
  stripe
};
