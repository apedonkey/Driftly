const mongoose = require('mongoose');

const TrackingEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['open', 'click', 'reply', 'unsubscribe', 'bounce', 'complaint'],
    required: true
  },
  flowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flow',
    required: true
  },
  stepId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FlowStep',
    required: true
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Contact',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  url: {
    type: String,
    required: false // Only for click events
  },
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'unknown'],
    default: 'unknown'
  },
  clientInfo: {
    type: String, // Email client information if available
    required: false
  },
  location: {
    country: String,
    region: String,
    city: String
  },
  trackingMethod: {
    type: String,
    enum: ['pixel', 'link', 'webhook', 'dns', 'redirect'],
    default: 'pixel'
  },
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

// Index for faster querying
TrackingEventSchema.index({ flowId: 1, stepId: 1, contactId: 1, type: 1 });
TrackingEventSchema.index({ timestamp: 1 });
TrackingEventSchema.index({ type: 1, timestamp: 1 });
TrackingEventSchema.index({ trackingMethod: 1 });

module.exports = mongoose.model('TrackingEvent', TrackingEventSchema); 