const express = require('express');
const router = express.Router();
const { 
  addContacts, 
  getContacts, 
  getContact,
  deleteContact,
  updateContact,
  bulkUnsubscribe,
  importContactsFromCSV
} = require('../controllers/contactController');
const { protect } = require('../middlewares/auth');

// Protect all routes
router.use(protect);

// Contact routes for a specific flow
router.route('/:flowId/contacts')
  .post(addContacts)
  .get(getContacts);

// Bulk operations
router.post('/:flowId/contacts/bulk-unsubscribe', bulkUnsubscribe);
router.post('/:flowId/contacts/import-csv', importContactsFromCSV);

// Single contact operations
router.route('/:flowId/contacts/:contactId')
  .get(getContact)
  .put(updateContact)
  .delete(deleteContact);

module.exports = router;
