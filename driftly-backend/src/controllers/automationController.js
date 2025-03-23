const Flow = require('../models/Flow');
const Contact = require('../models/Contact');
const errorHandlingService = require('../services/errorHandlingService');
const automationProcessor = require('../services/automationProcessor');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// @desc    Create a new automation flow
// @route   POST /api/automations
// @access  Private
exports.createAutomation = async (req, res) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;
    
    // If steps are included, make sure they have IDs
    if (req.body.steps && Array.isArray(req.body.steps)) {
      req.body.steps = req.body.steps.map(step => ({
        ...step,
        id: step.id || `step_${uuidv4()}`
      }));
    } else {
      // Create a default step if none provided
      req.body.steps = [{
        id: `step_${uuidv4()}`,
        order: 0,
        type: 'email',
        subject: '',
        body: '',
        delayDays: 1,
        delayHours: 0
      }];
    }
    
    // Create flow
    const flow = await Flow.create(req.body);
    
    res.status(201).json({
      success: true,
      data: flow
    });
  } catch (error) {
    console.error('Create automation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get all automation flows for a user
// @route   GET /api/automations
// @access  Private
exports.getAutomations = async (req, res) => {
  try {
    const flows = await Flow.find({ user: req.user.id });
    
    res.status(200).json({
      success: true,
      count: flows.length,
      data: flows
    });
  } catch (error) {
    console.error('Get automations error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single automation flow
// @route   GET /api/automations/:id
// @access  Private
exports.getAutomation = async (req, res) => {
  try {
    const flow = await Flow.findById(req.params.id);
    
    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Automation flow not found'
      });
    }
    
    // Make sure user owns the flow
    if (flow.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this automation'
      });
    }
    
    res.status(200).json({
      success: true,
      data: flow
    });
  } catch (error) {
    console.error('Get automation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update automation flow
// @route   PUT /api/automations/:id
// @access  Private
exports.updateAutomation = async (req, res) => {
  try {
    let flow = await Flow.findById(req.params.id);
    
    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Automation flow not found'
      });
    }
    
    // Make sure user owns the flow
    if (flow.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this automation'
      });
    }
    
    // If steps are being updated, ensure they all have IDs
    if (req.body.steps && Array.isArray(req.body.steps)) {
      req.body.steps = req.body.steps.map(step => ({
        ...step,
        id: step.id || `step_${uuidv4()}`
      }));
      
      // Create a new flow object to validate
      const flowToValidate = new Flow({
        ...flow.toObject(),
        steps: req.body.steps
      });
      
      // Validate flow structure
      const validationResult = flowToValidate.validateFlowStructure();
      if (!validationResult.valid) {
        return res.status(400).json({
          success: false,
          error: validationResult.error
        });
      }
    }
    
    // Update flow
    flow = await Flow.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: flow
    });
  } catch (error) {
    console.error('Update automation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete automation flow
// @route   DELETE /api/automations/:id
// @access  Private
exports.deleteAutomation = async (req, res) => {
  try {
    const flow = await Flow.findById(req.params.id);
    
    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Automation flow not found'
      });
    }
    
    // Make sure user owns the flow
    if (flow.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this automation'
      });
    }
    
    // Deactivate the flow before deletion
    flow.isActive = false;
    await flow.save();
    
    // Update contacts in this flow to completed state
    await Contact.updateMany(
      { flow: req.params.id, status: 'active' },
      { 
        status: 'completed',
        $push: {
          flowPath: {
            stepId: null,
            action: 'completed',
            result: 'Flow deleted'
          }
        }
      }
    );
    
    // Delete the flow
    await flow.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete automation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Activate an automation flow
// @route   PUT /api/automations/:id/activate
// @access  Private
exports.activateAutomation = async (req, res) => {
  try {
    let flow = await Flow.findById(req.params.id);
    
    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Automation flow not found'
      });
    }
    
    // Make sure user owns the flow
    if (flow.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to activate this automation'
      });
    }
    
    // Validate flow structure
    const validationResult = flow.validateFlowStructure();
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        error: validationResult.error
      });
    }
    
    // Additional validation for required fields
    const emailSteps = flow.steps.filter(step => step.type === 'email');
    for (const step of emailSteps) {
      if (!step.subject || !step.body) {
        return res.status(400).json({
          success: false,
          error: `Email step ${step.id} (order ${step.order}) is missing subject or body content`
        });
      }
    }
    
    // Update flow to active
    flow = await Flow.findByIdAndUpdate(
      req.params.id, 
      { isActive: true },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: flow
    });
  } catch (error) {
    console.error('Activate automation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Deactivate an automation flow
// @route   PUT /api/automations/:id/deactivate
// @access  Private
exports.deactivateAutomation = async (req, res) => {
  try {
    let flow = await Flow.findById(req.params.id);
    
    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Automation flow not found'
      });
    }
    
    // Make sure user owns the flow
    if (flow.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to deactivate this automation'
      });
    }
    
    // Update flow to inactive
    flow = await Flow.findByIdAndUpdate(
      req.params.id, 
      { isActive: false },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: flow
    });
  } catch (error) {
    console.error('Deactivate automation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update steps in an automation flow
// @route   PUT /api/automations/:id/steps
// @access  Private
exports.updateAutomationSteps = async (req, res) => {
  try {
    let flow = await Flow.findById(req.params.id);
    
    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Automation flow not found'
      });
    }
    
    // Make sure user owns the flow
    if (flow.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this automation'
      });
    }
    
    // Ensure all steps have IDs
    const steps = req.body.map(step => ({
      ...step,
      id: step.id || `step_${uuidv4()}`
    }));
    
    // Create a new flow object to validate
    const flowToValidate = new Flow({
      ...flow.toObject(),
      steps
    });
    
    // Validate flow structure
    const validationResult = flowToValidate.validateFlowStructure();
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        error: validationResult.error
      });
    }
    
    // Update flow steps
    flow = await Flow.findByIdAndUpdate(
      req.params.id,
      { steps },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: flow
    });
  } catch (error) {
    console.error('Update automation steps error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get automation analytics
// @route   GET /api/automations/:id/analytics
// @access  Private
exports.getAutomationAnalytics = async (req, res) => {
  try {
    const flow = await Flow.findById(req.params.id);
    
    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Automation flow not found'
      });
    }
    
    // Make sure user owns the flow
    if (flow.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this automation'
      });
    }
    
    // Get contacts in this flow
    const contacts = await Contact.find({ flow: req.params.id });
    
    // Count contacts in each status
    const statusCounts = {
      active: 0,
      paused: 0,
      completed: 0,
      unsubscribed: 0,
      bounced: 0,
      error: 0
    };
    
    contacts.forEach(contact => {
      if (statusCounts[contact.status] !== undefined) {
        statusCounts[contact.status]++;
      }
    });
    
    // Get step-by-step metrics
    const stepMetrics = {};
    
    flow.steps.forEach(step => {
      stepMetrics[step.id] = {
        id: step.id,
        order: step.order,
        type: step.type,
        name: step.subject || `Step ${step.order + 1}`,
        entered: 0,
        completed: 0,
        emails: {
          sent: 0,
          opened: 0,
          clicked: 0
        },
        conversions: 0
      };
    });
    
    // Analyze contact paths through the flow
    contacts.forEach(contact => {
      if (!contact.flowPath || !Array.isArray(contact.flowPath)) {
        return;
      }
      
      contact.flowPath.forEach(path => {
        const { stepId, action } = path;
        
        if (stepId && stepMetrics[stepId]) {
          if (action === 'enter') {
            stepMetrics[stepId].entered++;
          } else if (action === 'completed' || action.includes('exit')) {
            stepMetrics[stepId].completed++;
          } else if (action === 'email_sent') {
            stepMetrics[stepId].emails.sent++;
          }
        }
      });
      
      // Add interaction data
      if (contact.interactions && Array.isArray(contact.interactions)) {
        contact.interactions.forEach(interaction => {
          const { stepId, opened, clicked } = interaction;
          
          if (stepId && stepMetrics[stepId]) {
            if (opened) {
              stepMetrics[stepId].emails.opened++;
            }
            if (clicked) {
              stepMetrics[stepId].emails.clicked++;
            }
          }
        });
      }
    });
    
    // Calculate overall metrics
    const totalContacts = contacts.length;
    const activeContacts = statusCounts.active;
    const completionRate = totalContacts > 0 ? (statusCounts.completed / totalContacts) * 100 : 0;
    
    // Convert step metrics to array
    const stepsArray = Object.values(stepMetrics).sort((a, b) => a.order - b.order);
    
    res.status(200).json({
      success: true,
      data: {
        flow: {
          id: flow._id,
          name: flow.name,
          isActive: flow.isActive,
          triggerType: flow.triggerType
        },
        metrics: {
          totalContacts,
          activeContacts,
          completionRate,
          statusCounts,
          emailStats: {
            sent: flow.stats.emailsSent,
            opened: flow.stats.opens,
            clicked: flow.stats.clicks,
            openRate: flow.stats.emailsSent > 0 ? (flow.stats.opens / flow.stats.emailsSent) * 100 : 0,
            clickRate: flow.stats.opens > 0 ? (flow.stats.clicks / flow.stats.opens) * 100 : 0
          }
        },
        steps: stepsArray
      }
    });
  } catch (error) {
    console.error('Get automation analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Trigger processing of the automation
// @route   POST /api/automations/:id/trigger
// @access  Private
exports.triggerAutomation = async (req, res) => {
  try {
    const flow = await Flow.findById(req.params.id);
    
    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Automation flow not found'
      });
    }
    
    // Make sure user owns the flow
    if (flow.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to trigger this automation'
      });
    }
    
    // Process contacts in this flow
    const contacts = await Contact.find({ 
      flow: req.params.id,
      status: 'active'
    });
    
    // Update contacts to be processed immediately
    await Contact.updateMany(
      { flow: req.params.id, status: 'active' },
      { nextProcessingDate: new Date() }
    );
    
    // Trigger the automation processor
    await automationProcessor.manualProcess();
    
    res.status(200).json({
      success: true,
      message: `Triggered processing for ${contacts.length} contacts in the flow`
    });
  } catch (error) {
    console.error('Trigger automation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * @desc    Get contacts in an automation
 * @route   GET /api/automations/:id/contacts
 * @access  Private
 */
const getAutomationContacts = async (req, res) => {
  try {
    const automation = await Flow.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    const contacts = await Contact.find({
      flow: automation._id
    }).select('_id email firstName lastName status currentStepId lastUpdated');

    res.json(contacts);
  } catch (error) {
    logger.error('Error getting automation contacts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Add contacts to an automation
 * @route   POST /api/automations/:id/contacts
 * @access  Private
 */
const addContactsToAutomation = async (req, res) => {
  try {
    const { contactIds } = req.body;

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({ message: 'Contact IDs are required' });
    }

    const automation = await Flow.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    // Check if automation has steps
    if (!automation.steps || automation.steps.length === 0) {
      return res.status(400).json({ message: 'Automation has no steps' });
    }

    // Get the first step ID
    const firstStepId = automation.steps[0].id;

    // Get contacts
    const contacts = await Contact.find({
      _id: { $in: contactIds },
      user: req.user.id
    });

    if (contacts.length === 0) {
      return res.status(404).json({ message: 'No valid contacts found' });
    }

    // Add contacts to automation
    const updatePromises = contacts.map(contact => {
      return Contact.findByIdAndUpdate(contact._id, {
        flow: automation._id,
        status: 'active',
        currentStepId: firstStepId,
        $push: { 
          flowPath: { 
            stepId: firstStepId, 
            timestamp: new Date() 
          } 
        }
      });
    });

    await Promise.all(updatePromises);

    // Update automation stats
    automation.stats.active += contacts.length;
    await automation.save();

    res.json({ 
      message: `Added ${contacts.length} contacts to automation`,
      addedCount: contacts.length
    });
  } catch (error) {
    logger.error('Error adding contacts to automation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Remove a contact from an automation
 * @route   DELETE /api/automations/:id/contacts/:contactId
 * @access  Private
 */
const removeContactFromAutomation = async (req, res) => {
  try {
    const automation = await Flow.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    const contact = await Contact.findOne({
      _id: req.params.contactId,
      user: req.user.id,
      flow: automation._id
    });

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found in this automation' });
    }

    // Update contact to remove from automation
    contact.flow = null;
    contact.status = 'completed';
    contact.currentStepId = null;
    await contact.save();

    // Update automation stats
    if (automation.stats.active > 0) {
      automation.stats.active -= 1;
    }
    automation.stats.completed += 1;
    await automation.save();

    res.json({ message: 'Contact removed from automation' });
  } catch (error) {
    logger.error('Error removing contact from automation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Reset a contact in an automation (start from beginning)
 * @route   POST /api/automations/:id/contacts/:contactId/reset
 * @access  Private
 */
const resetContact = async (req, res) => {
  try {
    const automation = await Flow.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    // Check if automation has steps
    if (!automation.steps || automation.steps.length === 0) {
      return res.status(400).json({ message: 'Automation has no steps' });
    }

    const contact = await Contact.findOne({
      _id: req.params.contactId,
      user: req.user.id,
      flow: automation._id
    });

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found in this automation' });
    }

    // Reset contact to start from the first step
    const firstStepId = automation.steps[0].id;
    contact.status = 'active';
    contact.currentStepId = firstStepId;
    contact.flowPath = [{ stepId: firstStepId, timestamp: new Date() }];
    contact.lastError = null;
    await contact.save();

    res.json({ message: 'Contact reset to beginning of automation' });
  } catch (error) {
    logger.error('Error resetting contact in automation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get all errors for an automation
 * @route   GET /api/automations/:id/errors
 * @access  Private
 */
const getAutomationErrors = async (req, res) => {
  try {
    const automation = await Flow.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    // Get filters from query params
    const filters = {
      stepId: req.query.stepId,
      errorType: req.query.errorType,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const errors = await errorHandlingService.getFlowErrors(automation._id, filters);

    res.json(errors);
  } catch (error) {
    logger.error('Error getting automation errors:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get error statistics for an automation
 * @route   GET /api/automations/:id/error-stats
 * @access  Private
 */
const getAutomationErrorStats = async (req, res) => {
  try {
    const automation = await Flow.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    const errorStats = await errorHandlingService.getErrorStats(automation._id);

    res.json(errorStats);
  } catch (error) {
    logger.error('Error getting automation error stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get contacts in error state for an automation
 * @route   GET /api/automations/:id/error-contacts
 * @access  Private
 */
const getContactsInError = async (req, res) => {
  try {
    const automation = await Flow.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    const contactsInError = await errorHandlingService.getContactsInError(automation._id);

    res.json(contactsInError);
  } catch (error) {
    logger.error('Error getting contacts in error state:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Retry a specific contact that had an error
 * @route   POST /api/automations/:id/error-contacts/:contactId/retry
 * @access  Private
 */
const retryContact = async (req, res) => {
  try {
    const automation = await Flow.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    const contact = await Contact.findOne({
      _id: req.params.contactId,
      user: req.user.id,
      flow: automation._id,
      status: 'error'
    });

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found or not in error state' });
    }

    const updatedContact = await errorHandlingService.retryContact(automation._id, contact._id);

    res.json({ 
      message: 'Contact set for retry',
      contact: {
        id: updatedContact._id,
        email: updatedContact.email,
        status: updatedContact.status,
        currentStepId: updatedContact.currentStepId
      }
    });
  } catch (error) {
    logger.error('Error retrying contact:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Retry all contacts in error state for an automation
 * @route   POST /api/automations/:id/error-contacts/retry-all
 * @access  Private
 */
const retryAllContacts = async (req, res) => {
  try {
    const automation = await Flow.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    const result = await errorHandlingService.retryAllContacts(automation._id);

    res.json({ 
      message: `Reset ${result.reset} contacts for retry`,
      attempted: result.attempted,
      reset: result.reset
    });
  } catch (error) {
    logger.error('Error retrying all contacts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Test an automation step with sample data
 * @route   POST /api/automations/:id/test-step/:stepId
 * @access  Private
 */
const testAutomationStep = async (req, res) => {
  try {
    const { id, stepId } = req.params;
    const { testData } = req.body;

    if (!testData) {
      return res.status(400).json({ message: 'Test data is required' });
    }

    const automation = await Flow.findOne({
      _id: id,
      user: req.user.id
    });

    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    const step = automation.steps.find(s => s.id === stepId);
    if (!step) {
      return res.status(404).json({ message: 'Step not found in this automation' });
    }

    // Create a temporary context for processing
    const context = {
      flow: automation,
      step,
      contact: testData,
      isTest: true
    };

    // Process the step
    const result = await automationProcessor.processStep(context);

    res.json({
      success: true,
      result,
      message: 'Step tested successfully'
    });
  } catch (error) {
    logger.error('Error testing automation step:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error testing step',
      error: error.toString()
    });
  }
};

module.exports = {
  // ... existing exports ...
  getAutomationContacts,
  addContactsToAutomation,
  removeContactFromAutomation,
  resetContact,
  getAutomationErrors,
  getAutomationErrorStats,
  getContactsInError,
  retryContact,
  retryAllContacts,
  testAutomationStep
}; 