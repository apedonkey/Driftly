const express = require('express');
const router = express.Router();
const { 
  createAutomation, 
  getAutomations, 
  getAutomation, 
  updateAutomation, 
  deleteAutomation,
  activateAutomation,
  deactivateAutomation,
  updateAutomationSteps,
  getAutomationAnalytics,
  triggerAutomation,
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
} = require('../controllers/automationController');
const { protect } = require('../middlewares/auth');

// Protect all routes
router.use(protect);

// Automation CRUD routes
router.route('/')
  .get(getAutomations)
  .post(createAutomation);

router.route('/:id')
  .get(getAutomation)
  .put(updateAutomation)
  .delete(deleteAutomation);

// Automation step management
router.put('/:id/steps', updateAutomationSteps);

// Activation/deactivation routes
router.put('/:id/activate', activateAutomation);
router.put('/:id/deactivate', deactivateAutomation);

// Analytics and triggering
router.get('/:id/analytics', getAutomationAnalytics);
router.post('/:id/trigger', triggerAutomation);

// Get all contacts in an automation
router.get('/:id/contacts', getAutomationContacts);

// Add contacts to an automation
router.post('/:id/contacts', addContactsToAutomation);

// Remove contacts from an automation
router.delete('/:id/contacts/:contactId', removeContactFromAutomation);

// Reset a contact in the automation (start from the beginning)
router.post('/:id/contacts/:contactId/reset', resetContact);

// Get all errors for an automation
router.get('/:id/errors', getAutomationErrors);

// Get error statistics for an automation
router.get('/:id/error-stats', getAutomationErrorStats);

// Get contacts in error state for an automation
router.get('/:id/error-contacts', getContactsInError);

// Retry a specific contact that had an error
router.post('/:id/error-contacts/:contactId/retry', retryContact);

// Retry all contacts in error state for an automation
router.post('/:id/error-contacts/retry-all', retryAllContacts);

// Test an automation step with sample data
router.post('/:id/test-step/:stepId', testAutomationStep);

module.exports = router; 