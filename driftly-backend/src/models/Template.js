const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a template name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    enum: ['welcome', 'onboarding', 'sales', 'follow-up', 're-engagement', 'promotional', 'educational', 'events', 'custom'],
    default: 'custom'
  },
  tags: {
    type: [String],
    default: []
  },
  steps: [
    {
      order: {
        type: Number,
        required: true
      },
      subject: {
        type: String,
        required: [true, 'Please add an email subject'],
        trim: true
      },
      body: {
        type: String,
        required: [true, 'Please add email content']
      },
      delayDays: {
        type: Number,
        default: 0,
        min: [0, 'Delay must be at least 0 days']
      },
      delayHours: {
        type: Number,
        default: 0,
        min: [0, 'Delay hours must be at least 0 hours'],
        max: [23, 'Delay hours cannot exceed 23']
      }
    }
  ],
  isSystem: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
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
TemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Template', TemplateSchema);
