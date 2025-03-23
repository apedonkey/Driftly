const mongoose = require('mongoose');

const FlowSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a flow name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  isActive: {
    type: Boolean,
    default: false
  },
  triggerType: {
    type: String,
    enum: ['manual', 'scheduled', 'event', 'form_submission', 'api_trigger'],
    default: 'manual'
  },
  triggerConfig: {
    schedule: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
      },
      time: String,
      days: [Number], // 0-6, where 0 is Sunday
    },
    event: {
      type: String,
      conditions: mongoose.Schema.Types.Mixed,
    },
    form: {
      formId: String,
    },
    api: {
      webhookKey: String,
    }
  },
  steps: [
    {
      id: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['email', 'delay', 'condition', 'action'],
        required: true
      },
      config: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      },
      nextSteps: {
        default: String,
        yes: String,
        no: String
      }
    }
  ],
  stats: {
    triggered: {
      type: Number,
      default: 0
    },
    completed: {
      type: Number,
      default: 0
    },
    active: {
      type: Number,
      default: 0
    },
    failed: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    lastTriggered: Date,
    stepStats: mongoose.Schema.Types.Mixed,
  },
  errors: [
    {
      date: Date,
      contactId: String,
      stepId: String,
      stepName: String,
      errorType: String,
      errorMessage: String,
      additionalData: mongoose.Schema.Types.Mixed
    }
  ],
  errorStats: {
    totalErrors: {
      type: Number,
      default: 0
    },
    byStep: mongoose.Schema.Types.Mixed,
    byType: mongoose.Schema.Types.Mixed
  },
  analytics: {
    processingMetrics: {
      totalProcessed: {
        type: Number,
        default: 0
      },
      averageProcessingTime: {
        type: Number,
        default: 0
      },
      successRate: {
        type: Number,
        default: 1.0
      },
      lastProcessed: Date
    },
    processingTimes: [
      {
        date: Date,
        avgTime: Number,
        totalProcessed: Number
      }
    ],
    stepMetrics: [
      {
        stepId: String,
        name: String,
        totalProcessed: Number,
        successRate: Number,
        errorCount: Number,
        errorRate: Number,
        avgProcessingTime: Number,
        processingTimes: [
          {
            date: Date,
            avgTime: Number
          }
        ],
        errorDetails: [
          {
            errorType: String,
            count: Number
          }
        ]
      }
    ]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastTriggeredAt: Date
});

FlowSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

FlowSchema.methods.validateFlow = function() {
  if (!this.steps || this.steps.length === 0) {
    return { valid: false, reason: 'Flow must have at least one step' };
  }

  const stepIds = new Set(this.steps.map(step => step.id));
  
  for (const step of this.steps) {
    if (step.nextSteps) {
      if (step.nextSteps.default && step.nextSteps.default !== 'exit' && !stepIds.has(step.nextSteps.default)) {
        return { valid: false, reason: `Step ${step.name} references non-existent default next step: ${step.nextSteps.default}` };
      }
      
      if (step.nextSteps.yes && step.nextSteps.yes !== 'exit' && !stepIds.has(step.nextSteps.yes)) {
        return { valid: false, reason: `Step ${step.name} references non-existent yes branch step: ${step.nextSteps.yes}` };
      }
      
      if (step.nextSteps.no && step.nextSteps.no !== 'exit' && !stepIds.has(step.nextSteps.no)) {
        return { valid: false, reason: `Step ${step.name} references non-existent no branch step: ${step.nextSteps.no}` };
      }
    }
  }

  return { valid: true };
};

FlowSchema.methods.getAnalyticsSummary = function() {
  const summary = {
    triggered: this.stats.triggered || 0,
    completed: this.stats.completed || 0,
    active: this.stats.active || 0,
    failed: this.stats.failed || 0,
    conversionRate: this.stats.conversionRate || 0,
    errors: this.errorStats?.totalErrors || 0,
    processingMetrics: this.analytics?.processingMetrics || {
      totalProcessed: 0,
      averageProcessingTime: 0,
      successRate: 1.0
    }
  };

  return summary;
};

module.exports = mongoose.model('Flow', FlowSchema);
