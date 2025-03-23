const Flow = require('../models/Flow');
const Contact = require('../models/Contact');
const { sendEmail } = require('../config/sendgrid');
const axios = require('axios');

// AutomationProcessor service for handling advanced flow automation
class AutomationProcessor {
  constructor() {
    this.isRunning = false;
    this.scheduledTask = null;
  }

  // Process contacts that are due for processing
  async processContacts() {
    try {
      const now = new Date();
      
      // Find contacts that are due for processing
      const contacts = await Contact.find({
        status: 'active',
        nextProcessingDate: { $lte: now }
      }).populate({
        path: 'flow',
        select: 'steps isActive user triggerType triggerConfig'
      });

      console.log(`Found ${contacts.length} contacts due for processing`);

      for (const contact of contacts) {
        await this.processContactStep(contact);
      }
    } catch (error) {
      console.error('Error processing contacts:', error);
    }
  }

  // Process a single contact's current step
  async processContactStep(contact) {
    try {
      // Skip if flow is not active
      if (!contact.flow || !contact.flow.isActive) {
        return;
      }

      const flow = contact.flow;
      
      // Find the current step by ID
      const currentStepId = contact.currentStepId;
      const currentStep = flow.steps.find(step => step.id === currentStepId);
      
      if (!currentStep) {
        console.error(`Cannot find step with ID ${currentStepId} for contact ${contact._id}`);
        
        // Try to recover by finding the first step
        if (flow.steps.length > 0) {
          const firstStep = flow.steps.find(step => step.order === 0) || flow.steps[0];
          await Contact.findByIdAndUpdate(contact._id, {
            currentStepId: firstStep.id,
            nextProcessingDate: new Date(),
            $push: {
              flowPath: {
                stepId: firstStep.id,
                action: 'recover',
                result: 'Reset to first step due to missing current step'
              }
            }
          });
        } else {
          // Mark contact as error if we can't recover
          await Contact.findByIdAndUpdate(contact._id, {
            status: 'error',
            nextProcessingDate: null,
            $push: {
              flowPath: {
                stepId: null,
                action: 'error',
                result: 'Flow has no steps'
              }
            }
          });
        }
        return;
      }

      // Process the step based on its type
      switch (currentStep.type) {
        case 'email':
          await this.processEmailStep(contact, currentStep);
          break;
        case 'condition':
          await this.processConditionStep(contact, currentStep);
          break;
        case 'delay':
          await this.processDelayStep(contact, currentStep);
          break;
        case 'webhook':
          await this.processWebhookStep(contact, currentStep);
          break;
        case 'action':
          await this.processActionStep(contact, currentStep);
          break;
        default:
          console.error(`Unknown step type: ${currentStep.type}`);
          // Move to next step
          await this.moveToNextStep(contact, currentStep);
      }
    } catch (error) {
      console.error(`Error processing contact ${contact._id}:`, error);
      
      // Mark contact as error
      await Contact.findByIdAndUpdate(contact._id, {
        status: 'error',
        $push: {
          flowPath: {
            stepId: contact.currentStepId,
            action: 'error',
            result: error.message
          }
        }
      });
    }
  }

  // Process an email step
  async processEmailStep(contact, step) {
    try {
      // Send the email
      await sendEmail(
        contact.email,
        step.subject,
        this.personalizeEmail(step.body, contact)
      );

      // Update contact with email sent info
      await Contact.findByIdAndUpdate(contact._id, {
        lastEmailSent: new Date(),
        $inc: { 'stats.emailsSent': 1 },
        $push: {
          flowPath: {
            stepId: step.id,
            action: 'email_sent',
            result: 'success'
          },
          interactions: {
            stepId: step.id,
            opened: false,
            clicked: false
          }
        }
      });

      // Update flow stats
      await Flow.findByIdAndUpdate(contact.flow._id, {
        $inc: { 'stats.emailsSent': 1 }
      });

      // Move to next step
      await this.moveToNextStep(contact, step);
    } catch (error) {
      console.error(`Error sending email to ${contact.email}:`, error);
      
      // Check for permanent bounce
      if (error.response && error.response.body && 
          error.response.body.errors && 
          error.response.body.errors.some(e => e.message.includes('bounce'))) {
        await Contact.findByIdAndUpdate(contact._id, {
          status: 'bounced',
          nextProcessingDate: null,
          $push: {
            flowPath: {
              stepId: step.id,
              action: 'email_bounced',
              result: error.message
            }
          }
        });
      } else {
        // Otherwise record error but continue in flow
        await Contact.findByIdAndUpdate(contact._id, {
          $push: {
            flowPath: {
              stepId: step.id,
              action: 'email_error',
              result: error.message
            }
          }
        });
        
        // Still try to move to next step
        await this.moveToNextStep(contact, step);
      }
    }
  }

  // Process a condition step
  async processConditionStep(contact, step) {
    try {
      const { condition } = step;
      let conditionMet = false;
      
      // Evaluate the condition
      switch (condition.type) {
        case 'open':
          // Check if the contact opened a specific email
          conditionMet = await this.evaluateOpenCondition(contact, condition);
          break;
        case 'click':
          // Check if the contact clicked a link in a specific email
          conditionMet = await this.evaluateClickCondition(contact, condition);
          break;
        case 'attribute':
          // Check a contact attribute against a value
          conditionMet = await this.evaluateAttributeCondition(contact, condition);
          break;
        case 'tag':
          // Check if contact has a specific tag
          conditionMet = contact.tags && contact.tags.includes(condition.value);
          break;
        case 'date':
          // Check date-based conditions
          conditionMet = await this.evaluateDateCondition(contact, condition);
          break;
        default:
          console.error(`Unknown condition type: ${condition.type}`);
          conditionMet = false;
      }
      
      // Record the condition evaluation
      await Contact.findByIdAndUpdate(contact._id, {
        $push: {
          flowPath: {
            stepId: step.id,
            action: 'condition_evaluated',
            result: conditionMet
          }
        }
      });
      
      // Move to the appropriate next step based on condition result
      const nextStepId = conditionMet ? step.nextSteps.yes : step.nextSteps.no;
      
      if (nextStepId) {
        await Contact.findByIdAndUpdate(contact._id, {
          currentStepId: nextStepId,
          nextProcessingDate: new Date() // Process immediately
        });
      } else {
        // No next step defined, mark as completed
        await Contact.findByIdAndUpdate(contact._id, {
          status: 'completed',
          nextProcessingDate: null,
          $push: {
            flowPath: {
              stepId: step.id,
              action: 'completed',
              result: 'No next step defined'
            }
          }
        });
        
        // Update flow completion stats
        await Flow.findByIdAndUpdate(contact.flow._id, {
          $inc: { 'stats.completions': 1 }
        });
      }
    } catch (error) {
      console.error(`Error evaluating condition for contact ${contact._id}:`, error);
      
      // Move to default next step in case of error
      if (step.nextSteps.default) {
        await Contact.findByIdAndUpdate(contact._id, {
          currentStepId: step.nextSteps.default,
          nextProcessingDate: new Date(), // Process immediately
          $push: {
            flowPath: {
              stepId: step.id,
              action: 'condition_error',
              result: error.message
            }
          }
        });
      } else {
        // If no default step, use the 'no' path
        const nextStepId = step.nextSteps.no || null;
        if (nextStepId) {
          await Contact.findByIdAndUpdate(contact._id, {
            currentStepId: nextStepId,
            nextProcessingDate: new Date(), // Process immediately
            $push: {
              flowPath: {
                stepId: step.id,
                action: 'condition_error',
                result: `Error: ${error.message}, using 'no' path`
              }
            }
          });
        } else {
          // Mark as error if we can't proceed
          await Contact.findByIdAndUpdate(contact._id, {
            status: 'error',
            $push: {
              flowPath: {
                stepId: step.id,
                action: 'error',
                result: `Error: ${error.message}, no fallback path defined`
              }
            }
          });
        }
      }
    }
  }

  // Process a delay step
  async processDelayStep(contact, step) {
    try {
      // Calculate the delay time
      const delayMilliseconds = 
        (step.delayDays * 24 * 60 * 60 * 1000) + 
        (step.delayHours * 60 * 60 * 1000);
      
      const nextProcessingDate = new Date(Date.now() + delayMilliseconds);
      
      // Record that we're entering a delay
      await Contact.findByIdAndUpdate(contact._id, {
        nextProcessingDate,
        $push: {
          flowPath: {
            stepId: step.id,
            action: 'delay_started',
            result: `Delay for ${step.delayDays} days, ${step.delayHours} hours`
          }
        }
      });
      
      console.log(`Scheduled contact ${contact._id} for next processing at ${nextProcessingDate}`);
    } catch (error) {
      console.error(`Error processing delay for contact ${contact._id}:`, error);
      
      // Try to move to next step anyway
      await this.moveToNextStep(contact, step);
    }
  }

  // Process a webhook step
  async processWebhookStep(contact, step) {
    try {
      // Prepare webhook data with contact information
      const webhookData = {
        ...step.webhookBody,
        contact: {
          id: contact._id.toString(),
          email: contact.email,
          firstName: contact.firstName,
          lastName: contact.lastName,
          metadata: contact.metadata,
          tags: contact.tags
        }
      };
      
      // Send the webhook request
      const response = await axios({
        method: step.webhookMethod || 'POST',
        url: step.webhookUrl,
        headers: {
          'Content-Type': 'application/json',
          ...step.webhookHeaders
        },
        data: webhookData,
        timeout: 10000 // 10 second timeout
      });
      
      // Record the webhook call
      await Contact.findByIdAndUpdate(contact._id, {
        $inc: { 'stats.webhookCalls': 1 },
        $push: {
          flowPath: {
            stepId: step.id,
            action: 'webhook_called',
            result: {
              status: response.status,
              data: response.data
            }
          }
        }
      });
      
      // Move to next step
      await this.moveToNextStep(contact, step);
    } catch (error) {
      console.error(`Error calling webhook for contact ${contact._id}:`, error);
      
      // Record the error
      await Contact.findByIdAndUpdate(contact._id, {
        $push: {
          flowPath: {
            stepId: step.id,
            action: 'webhook_error',
            result: error.message
          }
        }
      });
      
      // Still try to move to next step
      await this.moveToNextStep(contact, step);
    }
  }

  // Process an action step
  async processActionStep(contact, step) {
    try {
      const { actionType, actionConfig } = step;
      
      switch (actionType) {
        case 'tag':
          // Add or remove tags
          if (actionConfig.operation === 'add') {
            await Contact.findByIdAndUpdate(contact._id, {
              $addToSet: { tags: { $each: actionConfig.tags } }
            });
          } else if (actionConfig.operation === 'remove') {
            await Contact.findByIdAndUpdate(contact._id, {
              $pull: { tags: { $in: actionConfig.tags } }
            });
          }
          break;
          
        case 'update_contact':
          // Update contact fields
          const updateData = {};
          if (actionConfig.fields) {
            Object.entries(actionConfig.fields).forEach(([key, value]) => {
              if (key !== '_id' && key !== 'user' && key !== 'flow') {
                // For metadata fields
                if (key.startsWith('metadata.')) {
                  const metaKey = key.substring(9);
                  updateData[`metadata.${metaKey}`] = value;
                } else {
                  updateData[key] = value;
                }
              }
            });
          }
          
          if (Object.keys(updateData).length > 0) {
            await Contact.findByIdAndUpdate(contact._id, updateData);
          }
          break;
          
        case 'add_to_flow':
          // Add contact to another flow
          // This is handled as a separate function
          await this.addContactToFlow(contact, actionConfig.flowId);
          break;
          
        case 'remove_from_flow':
          // Mark as completed in current flow
          if (actionConfig.removeFromCurrent) {
            await Contact.findByIdAndUpdate(contact._id, {
              status: 'completed',
              $push: {
                flowPath: {
                  stepId: step.id,
                  action: 'removed_from_flow',
                  result: 'Contact removed from flow'
                }
              }
            });
            
            // No further processing for this flow
            return;
          }
          break;
          
        case 'custom':
          // Custom action handler - this is typically handled by extensions
          console.log(`Custom action for contact ${contact._id}: ${JSON.stringify(actionConfig)}`);
          break;
      }
      
      // Record the action
      await Contact.findByIdAndUpdate(contact._id, {
        $inc: { 'stats.actionsPerformed': 1 },
        $set: { 'events.lastAction': new Date() },
        $push: {
          flowPath: {
            stepId: step.id,
            action: `action_${actionType}`,
            result: 'success'
          }
        }
      });
      
      // Move to next step
      await this.moveToNextStep(contact, step);
    } catch (error) {
      console.error(`Error performing action for contact ${contact._id}:`, error);
      
      // Record the error
      await Contact.findByIdAndUpdate(contact._id, {
        $push: {
          flowPath: {
            stepId: step.id,
            action: 'action_error',
            result: error.message
          }
        }
      });
      
      // Still try to move to next step
      await this.moveToNextStep(contact, step);
    }
  }

  // Helper function to move to the next step
  async moveToNextStep(contact, currentStep) {
    // Use default next step if available
    const nextStepId = currentStep.nextSteps && currentStep.nextSteps.default;
    
    if (nextStepId) {
      await Contact.findByIdAndUpdate(contact._id, {
        currentStepId: nextStepId,
        nextProcessingDate: new Date() // Process immediately
      });
    } else {
      // Look for a step with next order number
      const nextOrderStep = contact.flow.steps.find(s => s.order === currentStep.order + 1);
      
      if (nextOrderStep) {
        await Contact.findByIdAndUpdate(contact._id, {
          currentStepId: nextOrderStep.id,
          currentStep: currentStep.order + 1, // Keep legacy field updated
          nextProcessingDate: new Date() // Process immediately
        });
      } else {
        // No next step found, mark as completed
        await Contact.findByIdAndUpdate(contact._id, {
          status: 'completed',
          nextProcessingDate: null,
          $push: {
            flowPath: {
              stepId: currentStep.id,
              action: 'completed',
              result: 'End of flow reached'
            }
          }
        });
        
        // Update flow completion stats
        await Flow.findByIdAndUpdate(contact.flow._id, {
          $inc: { 'stats.completions': 1 }
        });
      }
    }
  }

  // Add a contact to a flow
  async addContactToFlow(contact, flowId) {
    try {
      // Check if flow exists
      const flow = await Flow.findById(flowId);
      if (!flow) {
        throw new Error(`Flow with ID ${flowId} not found`);
      }
      
      // Check if contact already exists in the flow
      const existingContact = await Contact.findOne({
        email: contact.email,
        flow: flowId
      });
      
      if (existingContact) {
        // If already in this flow, we can optionally reset progress
        await Contact.findByIdAndUpdate(existingContact._id, {
          status: 'active',
          currentStepId: flow.steps.length > 0 ? flow.steps[0].id : null,
          currentStep: 0,
          nextProcessingDate: new Date(),
          $push: {
            flowPath: {
              stepId: null,
              action: 'reset',
              result: 'Contact added to flow again'
            }
          }
        });
      } else {
        // Create new contact in the flow
        const newContact = new Contact({
          user: contact.user,
          flow: flowId,
          email: contact.email,
          firstName: contact.firstName,
          lastName: contact.lastName,
          status: 'active',
          currentStepId: flow.steps.length > 0 ? flow.steps[0].id : null,
          currentStep: 0,
          nextProcessingDate: new Date(),
          metadata: { ...contact.metadata },
          tags: [...contact.tags]
        });
        
        await newContact.save();
        
        // Update flow stats
        await Flow.findByIdAndUpdate(flowId, {
          $inc: { 'stats.totalContacts': 1 }
        });
      }
    } catch (error) {
      console.error(`Error adding contact to flow: ${error.message}`);
      throw error;
    }
  }

  // Evaluate if a contact opened an email
  async evaluateOpenCondition(contact, condition) {
    // Get the target step to check for opens
    const targetStepId = condition.value;
    
    // Find the interaction for this step
    const interaction = contact.interactions.find(i => i.stepId === targetStepId);
    
    if (!interaction) {
      return false;
    }
    
    // If timeframe is specified, check if the open occurred within that timeframe
    if (condition.timeframe && interaction.openedAt) {
      const timeframeLimit = new Date();
      timeframeLimit.setHours(timeframeLimit.getHours() - condition.timeframe);
      
      return interaction.opened && new Date(interaction.openedAt) >= timeframeLimit;
    }
    
    return interaction.opened;
  }

  // Evaluate if a contact clicked a link in an email
  async evaluateClickCondition(contact, condition) {
    // Get the target step to check for clicks
    const targetStepId = condition.value;
    
    // Find the interaction for this step
    const interaction = contact.interactions.find(i => i.stepId === targetStepId);
    
    if (!interaction) {
      return false;
    }
    
    // If timeframe is specified, check if the click occurred within that timeframe
    if (condition.timeframe && interaction.clickedAt) {
      const timeframeLimit = new Date();
      timeframeLimit.setHours(timeframeLimit.getHours() - condition.timeframe);
      
      return interaction.clicked && new Date(interaction.clickedAt) >= timeframeLimit;
    }
    
    return interaction.clicked;
  }

  // Evaluate attribute-based condition
  async evaluateAttributeCondition(contact, condition) {
    const { attribute, operator, value } = condition;
    
    // Get the attribute value from contact
    let contactValue = null;
    
    if (attribute.startsWith('metadata.')) {
      // Extract from metadata
      const metaKey = attribute.substring(9);
      contactValue = contact.metadata && contact.metadata[metaKey];
    } else {
      // Get from top-level attributes
      contactValue = contact[attribute];
    }
    
    // Evaluate based on operator
    switch (operator) {
      case 'equals':
        return contactValue === value;
        
      case 'not_equals':
        return contactValue !== value;
        
      case 'contains':
        if (typeof contactValue === 'string') {
          return contactValue.includes(value);
        } else if (Array.isArray(contactValue)) {
          return contactValue.includes(value);
        }
        return false;
        
      case 'not_contains':
        if (typeof contactValue === 'string') {
          return !contactValue.includes(value);
        } else if (Array.isArray(contactValue)) {
          return !contactValue.includes(value);
        }
        return true;
        
      case 'greater_than':
        return typeof contactValue === 'number' && contactValue > value;
        
      case 'less_than':
        return typeof contactValue === 'number' && contactValue < value;
        
      case 'exists':
        return contactValue !== undefined && contactValue !== null && contactValue !== '';
        
      case 'not_exists':
        return contactValue === undefined || contactValue === null || contactValue === '';
        
      default:
        return false;
    }
  }

  // Evaluate date-based condition
  async evaluateDateCondition(contact, condition) {
    const { attribute, operator, value } = condition;
    
    // Get the date from contact
    let dateValue = null;
    
    if (attribute === 'createdAt') {
      dateValue = contact.createdAt;
    } else if (attribute === 'lastEmailSent') {
      dateValue = contact.lastEmailSent;
    } else if (attribute.startsWith('events.')) {
      const eventType = attribute.substring(7);
      dateValue = contact.events && contact.events[eventType];
    } else if (attribute.startsWith('metadata.')) {
      const metaKey = attribute.substring(9);
      dateValue = contact.metadata && contact.metadata[metaKey];
      if (dateValue && typeof dateValue === 'string') {
        dateValue = new Date(dateValue);
      }
    }
    
    if (!dateValue) {
      return false;
    }
    
    const contactDate = new Date(dateValue);
    const now = new Date();
    
    // Handle different operators
    switch (operator) {
      case 'before':
        return contactDate < new Date(value);
        
      case 'after':
        return contactDate > new Date(value);
        
      case 'within_days':
        const daysDiff = Math.floor((now - contactDate) / (1000 * 60 * 60 * 24));
        return daysDiff <= value;
        
      case 'older_than_days':
        const daysOld = Math.floor((now - contactDate) / (1000 * 60 * 60 * 24));
        return daysOld > value;
        
      default:
        return false;
    }
  }

  // Personalize email content
  personalizeEmail(content, contact) {
    let personalized = content;
    
    // Replace basic placeholders
    personalized = personalized
      .replace(/{{firstName}}/g, contact.firstName || '')
      .replace(/{{lastName}}/g, contact.lastName || '')
      .replace(/{{email}}/g, contact.email || '');
    
    // Replace any custom metadata fields
    if (contact.metadata) {
      Object.keys(contact.metadata).forEach(key => {
        const value = contact.metadata[key] || '';
        personalized = personalized.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
    }
    
    return personalized;
  }

  // Manually trigger processing (for testing)
  async manualProcess() {
    console.log('Manually triggering automation processing...');
    await this.processContacts();
    return { success: true, message: 'Automation processing triggered' };
  }
}

// Create singleton instance
const automationProcessor = new AutomationProcessor();

module.exports = automationProcessor; 