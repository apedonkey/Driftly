const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Function to send an email
const sendEmail = async (to, subject, html, text) => {
  try {
    const msg = {
      to,
      from: process.env.FROM_EMAIL,
      subject,
      text: text || 'This email requires HTML to view properly',
      html
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

module.exports = {
  sendEmail
};
