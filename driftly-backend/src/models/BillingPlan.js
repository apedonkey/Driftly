const mongoose = require('mongoose');

const BillingPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    unique: true,
    trim: true
  },
  stripePriceId: {
    type: String,
    required: [true, 'Stripe price ID is required'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Plan description is required']
  },
  price: {
    type: Number,
    required: [true, 'Plan price is required'],
    min: [0, 'Price must be a positive number']
  },
  currency: {
    type: String,
    default: 'usd',
    enum: ['usd', 'eur', 'gbp', 'cad', 'aud']
  },
  interval: {
    type: String,
    default: 'month',
    enum: ['month', 'year']
  },
  features: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    included: {
      type: Boolean,
      default: true
    }
  }],
  limits: {
    maxFlows: {
      type: Number,
      default: 1
    },
    maxContacts: {
      type: Number,
      default: 500
    },
    maxEmailsPerMonth: {
      type: Number,
      default: 1000
    },
    maxUsers: {
      type: Number,
      default: 1
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
BillingPlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure only one default plan
BillingPlanSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

module.exports = mongoose.model('BillingPlan', BillingPlanSchema); 