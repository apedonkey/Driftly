const Contact = require('../models/Contact');
const Flow = require('../models/Flow');

// @desc    Add contacts to a flow
// @route   POST /api/flows/:flowId/contacts
// @access  Private
exports.addContacts = async (req, res) => {
  try {
    const { flowId } = req.params;
    const { contacts } = req.body;
    
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
    
    // Validate contacts array
    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of contacts'
      });
    }
    
    // Process contacts
    const contactsToInsert = contacts.map(contact => ({
      user: req.user.id,
      flow: flowId,
      email: contact.email,
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      metadata: contact.metadata || {},
      nextEmailDate: new Date() // Schedule first email immediately
    }));
    
    // Insert contacts (ignoring duplicates)
    const result = await Contact.insertMany(contactsToInsert, { ordered: false })
      .catch(err => {
        // Handle duplicate key errors
        if (err.code === 11000) {
          return { insertedCount: err.result.nInserted };
        }
        throw err;
      });
    
    // Update flow stats
    await Flow.findByIdAndUpdate(flowId, {
      $inc: { 'stats.totalContacts': result.insertedCount || result.length }
    });
    
    res.status(201).json({
      success: true,
      count: result.insertedCount || result.length,
      message: `${result.insertedCount || result.length} contacts added to flow`
    });
  } catch (error) {
    console.error('Add contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get contacts for a flow
// @route   GET /api/flows/:flowId/contacts
// @access  Private
exports.getContacts = async (req, res) => {
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
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page - 1) * limit;
    
    // Get contacts
    const contacts = await Contact.find({ flow: flowId })
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Get total count
    const total = await Contact.countDocuments({ flow: flowId });
    
    res.status(200).json({
      success: true,
      count: contacts.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: contacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get a single contact
// @route   GET /api/flows/:flowId/contacts/:contactId
// @access  Private
exports.getContact = async (req, res) => {
  try {
    const { flowId, contactId } = req.params;
    
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
    
    // Find contact
    const contact = await Contact.findOne({ 
      _id: contactId,
      flow: flowId,
      user: req.user.id
    });
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete a contact
// @route   DELETE /api/flows/:flowId/contacts/:contactId
// @access  Private
exports.deleteContact = async (req, res) => {
  try {
    const { flowId, contactId } = req.params;
    
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
    
    // Find and delete contact
    const contact = await Contact.findOne({ 
      _id: contactId,
      flow: flowId,
      user: req.user.id
    });
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }
    
    await contact.deleteOne();
    
    // Update flow stats
    await Flow.findByIdAndUpdate(flowId, {
      $inc: { 'stats.totalContacts': -1 }
    });
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update a contact
// @route   PUT /api/flows/:flowId/contacts/:contactId
// @access  Private
exports.updateContact = async (req, res) => {
  try {
    const { flowId, contactId } = req.params;
    
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
    
    // Find and update contact
    let contact = await Contact.findOne({ 
      _id: contactId,
      flow: flowId,
      user: req.user.id
    });
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }
    
    contact = await Contact.findByIdAndUpdate(contactId, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Bulk unsubscribe contacts
// @route   POST /api/flows/:flowId/contacts/bulk-unsubscribe
// @access  Private
exports.bulkUnsubscribe = async (req, res) => {
  try {
    const { flowId } = req.params;
    const { contactIds } = req.body;
    
    // Validate contact IDs array
    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of contact IDs'
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
    
    // Update all specified contacts to unsubscribed status
    const result = await Contact.updateMany(
      { 
        _id: { $in: contactIds },
        flow: flowId,
        user: req.user.id
      },
      { 
        status: 'unsubscribed'
      }
    );
    
    res.status(200).json({
      success: true,
      count: result.modifiedCount,
      message: `${result.modifiedCount} contacts have been unsubscribed`
    });
  } catch (error) {
    console.error('Bulk unsubscribe error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Import contacts from CSV data
// @route   POST /api/flows/:flowId/contacts/import-csv
// @access  Private
exports.importContactsFromCSV = async (req, res) => {
  try {
    const { flowId } = req.params;
    const { csvData } = req.body;
    
    // Validate CSV data
    if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide valid CSV data'
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
    
    // Process CSV data - expecting an array of objects with at least 'email' property
    const contactsToInsert = csvData.map(row => ({
      user: req.user.id,
      flow: flowId,
      email: row.email,
      firstName: row.firstName || row.first_name || '',
      lastName: row.lastName || row.last_name || '',
      metadata: {
        ...Object.keys(row).reduce((metadata, key) => {
          // Skip fields we already handle specifically
          if (!['email', 'firstName', 'first_name', 'lastName', 'last_name'].includes(key)) {
            metadata[key] = row[key];
          }
          return metadata;
        }, {})
      },
      nextEmailDate: new Date() // Schedule first email immediately
    }));
    
    // Validate that all contacts have valid emails
    const invalidContacts = contactsToInsert.filter(contact => 
      !contact.email || !/\S+@\S+\.\S+/.test(contact.email)
    );
    
    if (invalidContacts.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email addresses found in CSV data',
        invalidCount: invalidContacts.length
      });
    }
    
    // Insert contacts (ignoring duplicates)
    const result = await Contact.insertMany(contactsToInsert, { ordered: false })
      .catch(err => {
        // Handle duplicate key errors
        if (err.code === 11000) {
          return { 
            insertedCount: err.result ? err.result.nInserted : 0,
            dupCount: contactsToInsert.length - (err.result ? err.result.nInserted : 0)
          };
        }
        throw err;
      });
    
    // Update flow stats with the number of successfully inserted contacts
    const insertedCount = result.insertedCount || result.length;
    if (insertedCount > 0) {
      await Flow.findByIdAndUpdate(flowId, {
        $inc: { 'stats.totalContacts': insertedCount }
      });
    }
    
    res.status(201).json({
      success: true,
      count: insertedCount,
      duplicates: result.dupCount || 0,
      message: `${insertedCount} contacts imported successfully${
        result.dupCount ? `, ${result.dupCount} duplicates skipped` : ''
      }`
    });
  } catch (error) {
    console.error('Import contacts CSV error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
