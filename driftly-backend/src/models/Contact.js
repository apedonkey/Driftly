const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  flow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flow',
    required: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'unsubscribed', 'bounced', 'error'],
    default: 'active'
  },
  currentStepId: {
    type: String
  },
  currentStep: {
    type: Number,
    default: 0
  },
  flowPath: [{
    stepId: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    action: String,
    result: mongoose.Schema.Types.Mixed
  }],
  tags: [String],
  lastEmailSent: {
    type: Date
  },
  nextEmailDate: {
    type: Date
  },
  nextProcessingDate: {
    type: Date
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  stats: {
    emailsSent: {
      type: Number,
      default: 0
    },
    opens: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    webhookCalls: {
      type: Number,
      default: 0
    },
    actionsPerformed: {
      type: Number,
      default: 0
    }
  },
  events: {
    lastOpen: Date,
    lastClick: Date,
    lastAction: Date,
    conversionDate: Date
  },
  interactions: [{
    stepId: String,
    opened: Boolean,
    openedAt: Date,
    clicked: Boolean,
    clickedAt: Date,
    clickedLinks: [String]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ContactSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

ContactSchema.index({ flow: 1, email: 1 }, { unique: true });

ContactSchema.index({ nextProcessingDate: 1, status: 1 });

ContactSchema.index({ tags: 1 });

module.exports = mongoose.model('Contact', ContactSchema);
