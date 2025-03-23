const Flow = require('../models/Flow');
const Contact = require('../models/Contact');
const Template = require('../models/Template');
const { sendEmail } = require('../config/sendgrid');
const { createTemplate } = require('../services/emailService');
const emailScheduler = require('../services/emailScheduler');

// @desc    Send a test email for a specific flow step
// @route   POST /api/emails/test
// @access  Private
exports.sendTestEmail = async (req, res) => {
  try {
    const { flowId, stepIndex, testEmail } = req.body;
    
    // Validate required fields
    if (!flowId || stepIndex === undefined || !testEmail) {
      return res.status(400).json({
        success: false,
        error: 'Please provide flowId, stepIndex, and testEmail'
      });
    }
    
    // Check if flow exists and belongs to user
    const flow = await Flow.findById(flowId);
    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Flow not found'
      });
    }
    
    // Make sure user owns the flow
    if (flow.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this flow'
      });
    }
    
    // Check if step exists
    if (!flow.steps || stepIndex >= flow.steps.length) {
      return res.status(404).json({
        success: false,
        error: 'Step not found'
      });
    }
    
    const step = flow.steps[stepIndex];
    
    // Create a mock contact for personalization
    const mockContact = {
      email: testEmail,
      firstName: 'Test',
      lastName: 'User',
      metadata: {}
    };
    
    // Personalize email content
    const personalizedContent = emailScheduler.personalizeEmail(step.body, mockContact);
    
    // Send test email
    await sendEmail(
      testEmail,
      step.subject,
      personalizedContent
    );
    
    res.status(200).json({
      success: true,
      message: `Test email sent to ${testEmail}`
    });
  } catch (error) {
    console.error('Send test email error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Manually trigger email processing
// @route   POST /api/emails/process
// @access  Private
exports.processEmails = async (req, res) => {
  try {
    const result = await emailScheduler.manualTrigger();
    res.status(200).json(result);
  } catch (error) {
    console.error('Email processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Create a SendGrid template from flow step
// @route   POST /api/emails/create-template
// @access  Private
exports.createSendGridTemplate = async (req, res) => {
  try {
    const { flowId, stepIndex, name } = req.body;
    
    // Validate required fields
    if (!flowId || stepIndex === undefined || !name) {
      return res.status(400).json({
        success: false,
        error: 'Please provide flowId, stepIndex, and name'
      });
    }
    
    // Check if flow exists and belongs to user
    const flow = await Flow.findById(flowId);
    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Flow not found'
      });
    }
    
    // Make sure user owns the flow
    if (flow.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this flow'
      });
    }
    
    // Check if step exists
    if (!flow.steps || stepIndex >= flow.steps.length) {
      return res.status(404).json({
        success: false,
        error: 'Step not found'
      });
    }
    
    const step = flow.steps[stepIndex];
    
    // Create SendGrid template
    const template = await createTemplate(
      name,
      step.subject,
      step.body
    );
    
    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get email stats for a flow
// @route   GET /api/emails/stats/:flowId
// @access  Private
exports.getFlowEmailStats = async (req, res) => {
  try {
    const { flowId } = req.params;
    
    // Check if flow exists and belongs to user
    const flow = await Flow.findById(flowId);
    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Flow not found'
      });
    }
    
    // Make sure user owns the flow
    if (flow.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this flow'
      });
    }
    
    // Get stats from the flow
    const { stats } = flow;
    
    // Calculate rates
    const openRate = stats.emailsSent > 0 
      ? (stats.opens / stats.emailsSent * 100).toFixed(2) 
      : 0;
      
    const clickRate = stats.opens > 0 
      ? (stats.clicks / stats.opens * 100).toFixed(2) 
      : 0;
    
    // Get per-step stats if available
    let stepStats = [];
    if (flow.steps && flow.steps.length > 0) {
      // Get contacts for this flow to calculate step stats
      const contacts = await Contact.find({ flow: flowId });
      
      // Calculate stats per step
      stepStats = flow.steps.map((step, index) => {
        // Count contacts at or past this step
        const contactsReceived = contacts.filter(c => c.currentStep > index).length;
        
        return {
          step: index + 1,
          subject: step.subject,
          contactsReceived,
          completed: contactsReceived > 0 
            ? ((contactsReceived / stats.totalContacts) * 100).toFixed(2) 
            : 0
        };
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        totalContacts: stats.totalContacts || 0,
        emailsSent: stats.emailsSent || 0,
        opens: stats.opens || 0,
        clicks: stats.clicks || 0,
        openRate,
        clickRate,
        steps: stepStats
      }
    });
  } catch (error) {
    console.error('Get flow email stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}; 