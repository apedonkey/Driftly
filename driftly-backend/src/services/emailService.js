const sgMail = require('@sendgrid/mail');
const sgClient = require('@sendgrid/client');
const Flow = require('../models/Flow');
const Contact = require('../models/Contact');

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
sgClient.setApiKey(process.env.SENDGRID_API_KEY);

// Function to send an email
const sendEmail = async (to, subject, html, text) => {
  try {
    const msg = {
      to,
      from: process.env.FROM_EMAIL,
      subject,
      text: text || 'This email requires HTML to view properly',
      html,
      trackingSettings: {
        clickTracking: {
          enable: true,
          enableText: true
        },
        openTracking: {
          enable: true
        }
      }
    };
    
    const response = await sgMail.send(msg);
    return response;
  } catch (error) {
    console.error('SendGrid Error:', error);
    if (error.response) {
      console.error('Error body:', error.response.body);
    }
    throw error;
  }
};

// Function to create a template in SendGrid
const createTemplate = async (name, subject, content) => {
  try {
    const data = {
      name,
      generation: 'dynamic',
      subject,
      html_content: content
    };
    
    const request = {
      method: 'POST',
      url: '/v3/templates',
      body: data
    };
    
    const [response] = await sgClient.request(request);
    return response.body;
  } catch (error) {
    console.error('SendGrid Template Error:', error);
    if (error.response) {
      console.error('Error body:', error.response.body);
    }
    throw error;
  }
};

// Function to handle email events from SendGrid webhooks
const handleEmailEvent = async (events) => {
  try {
    for (const event of events) {
      // Extract email and event type
      const { email, event: eventType, sg_message_id } = event;
      
      if (!email || !eventType || !sg_message_id) {
        continue;
      }
      
      // Find contact by email
      const contact = await Contact.findOne({ email });
      
      if (!contact) {
        continue;
      }
      
      // Update contact and flow stats based on event type
      switch (eventType) {
        case 'open':
          await Contact.findByIdAndUpdate(contact._id, {
            $inc: { 'stats.opens': 1 }
          });
          
          await Flow.findByIdAndUpdate(contact.flow, {
            $inc: { 'stats.opens': 1 }
          });
          break;
          
        case 'click':
          await Contact.findByIdAndUpdate(contact._id, {
            $inc: { 'stats.clicks': 1 }
          });
          
          await Flow.findByIdAndUpdate(contact.flow, {
            $inc: { 'stats.clicks': 1 }
          });
          break;
          
        case 'bounce':
        case 'dropped':
        case 'spamreport':
          await Contact.findByIdAndUpdate(contact._id, {
            status: 'bounced',
            nextEmailDate: null
          });
          break;
          
        case 'unsubscribe':
          await Contact.findByIdAndUpdate(contact._id, {
            status: 'unsubscribed',
            nextEmailDate: null
          });
          break;
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Email event handling error:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  createTemplate,
  handleEmailEvent
};
