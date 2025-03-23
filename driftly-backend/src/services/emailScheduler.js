const cron = require('node-cron');
const Flow = require('../models/Flow');
const Contact = require('../models/Contact');
const { sendEmail } = require('../config/sendgrid');
const automationProcessor = require('./automationProcessor');

// Email scheduler service
class EmailScheduler {
  constructor() {
    this.isRunning = false;
    this.scheduledTask = null;
  }

  // Start the scheduler
  start() {
    if (this.isRunning) {
      console.log('Email scheduler is already running');
      return;
    }

    // Schedule to run every 15 minutes
    this.scheduledTask = cron.schedule('*/15 * * * *', async () => {
      console.log('Running email scheduler job...');
      
      // Process both legacy format and new automation format
      await this.processEmails();
      await automationProcessor.processContacts();
    });

    this.isRunning = true;
    console.log('Email scheduler started');
  }

  // Stop the scheduler
  stop() {
    if (!this.isRunning) {
      console.log('Email scheduler is not running');
      return;
    }

    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.scheduledTask = null;
    }

    this.isRunning = false;
    console.log('Email scheduler stopped');
  }

  // Process emails that are due to be sent (legacy format)
  async processEmails() {
    try {
      const now = new Date();
      
      // Find contacts that are due for their next email
      const contacts = await Contact.find({
        status: 'active',
        nextEmailDate: { $lte: now },
        // Only process contacts without currentStepId (legacy format)
        currentStepId: { $exists: false }
      }).populate({
        path: 'flow',
        select: 'steps isActive user'
      });

      console.log(`Found ${contacts.length} legacy contacts due for emails`);

      for (const contact of contacts) {
        await this.processContact(contact);
      }
    } catch (error) {
      console.error('Error processing emails:', error);
    }
  }

  // Process a single contact (legacy format)
  async processContact(contact) {
    try {
      // Skip if flow is not active
      if (!contact.flow || !contact.flow.isActive) {
        return;
      }

      const flow = contact.flow;
      const currentStep = contact.currentStep;
      const steps = flow.steps;

      // Check if there are more steps to send
      if (currentStep >= steps.length) {
        // Mark contact as completed
        await Contact.findByIdAndUpdate(contact._id, {
          status: 'completed',
          nextEmailDate: null
        });
        return;
      }

      // Get the current step details
      const step = steps[currentStep];

      // If flow has been upgraded to new format, convert this contact
      if (steps.some(s => s.id && s.type)) {
        await this.migrateContactToNewFormat(contact, flow);
        return;
      }

      // Send the email
      try {
        await sendEmail(
          contact.email,
          step.subject,
          this.personalizeEmail(step.body, contact)
        );

        // Calculate next email date
        const nextEmailDate = this.calculateNextEmailDate(step);

        // Update contact with next step and email date
        await Contact.findByIdAndUpdate(contact._id, {
          currentStep: currentStep + 1,
          lastEmailSent: new Date(),
          nextEmailDate: nextEmailDate,
          $inc: { 'stats.emailsSent': 1 }
        });

        // Update flow stats
        await Flow.findByIdAndUpdate(flow._id, {
          $inc: { 'stats.emailsSent': 1 }
        });

        console.log(`Email sent to ${contact.email} for flow ${flow._id}, step ${currentStep + 1}`);
      } catch (error) {
        console.error(`Error sending email to ${contact.email}:`, error);
        
        // Mark as bounced if SendGrid reports a permanent failure
        if (error.response && error.response.body && 
            error.response.body.errors && 
            error.response.body.errors.some(e => e.message.includes('bounce'))) {
          await Contact.findByIdAndUpdate(contact._id, {
            status: 'bounced',
            nextEmailDate: null
          });
        }
      }
    } catch (error) {
      console.error(`Error processing contact ${contact._id}:`, error);
    }
  }

  // Migrate a contact from legacy format to new format
  async migrateContactToNewFormat(contact, flow) {
    try {
      console.log(`Migrating contact ${contact._id} to new automation format`);
      
      // Find current step's ID in the new format
      let currentStepId = null;
      if (flow.steps && flow.steps.length > 0) {
        const matchingStep = flow.steps.find(s => s.order === contact.currentStep);
        if (matchingStep) {
          currentStepId = matchingStep.id;
        } else {
          // Default to first step if no match
          currentStepId = flow.steps[0].id;
        }
      }
      
      if (!currentStepId) {
        console.error(`Cannot find step for contact ${contact._id} in flow ${flow._id}`);
        return;
      }
      
      // Update contact to use new format
      await Contact.findByIdAndUpdate(contact._id, {
        currentStepId,
        nextProcessingDate: contact.nextEmailDate || new Date(),
        $push: {
          flowPath: {
            stepId: currentStepId,
            action: 'migrated',
            result: `Migrated from legacy format. Previous step: ${contact.currentStep}`
          }
        }
      });
      
      console.log(`Contact ${contact._id} successfully migrated to new format`);
    } catch (error) {
      console.error(`Error migrating contact ${contact._id}:`, error);
    }
  }

  // Calculate the next email date based on delay settings
  calculateNextEmailDate(step) {
    const now = new Date();
    const delayMilliseconds = 
      (step.delayDays * 24 * 60 * 60 * 1000) + 
      (step.delayHours * 60 * 60 * 1000);
    
    return new Date(now.getTime() + delayMilliseconds);
  }

  // Personalize email content with contact details
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

  // Manually trigger email processing (for testing or API endpoints)
  async manualTrigger() {
    console.log('Manually triggering email processing...');
    await this.processEmails();
    await automationProcessor.processContacts();
    return { success: true, message: 'Email processing triggered' };
  }
}

// Create singleton instance
const emailScheduler = new EmailScheduler();

module.exports = emailScheduler;
