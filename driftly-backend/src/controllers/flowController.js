const Flow = require('../models/Flow');
const Contact = require('../models/Contact');
const User = require('../models/User');

// @desc    Create a new flow
// @route   POST /api/flows
// @access  Private
exports.createFlow = async (req, res) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;
    
    // Create flow
    const flow = await Flow.create(req.body);
    
    res.status(201).json({
      success: true,
      data: flow
    });
  } catch (error) {
    console.error('Create flow error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get all flows for a user
// @route   GET /api/flows
// @access  Private
exports.getFlows = async (req, res) => {
  try {
    const flows = await Flow.find({ user: req.user.id });
    
    res.status(200).json({
      success: true,
      count: flows.length,
      data: flows
    });
  } catch (error) {
    console.error('Get flows error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single flow
// @route   GET /api/flows/:id
// @access  Private
exports.getFlow = async (req, res) => {
  try {
    const flow = await Flow.findById(req.params.id);
    
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
    
    res.status(200).json({
      success: true,
      data: flow
    });
  } catch (error) {
    console.error('Get flow error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update flow
// @route   PUT /api/flows/:id
// @access  Private
exports.updateFlow = async (req, res) => {
  try {
    let flow = await Flow.findById(req.params.id);
    
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
        error: 'Not authorized to update this flow'
      });
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
    console.error('Update flow error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete flow
// @route   DELETE /api/flows/:id
// @access  Private
exports.deleteFlow = async (req, res) => {
  try {
    const flow = await Flow.findById(req.params.id);
    
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
        error: 'Not authorized to delete this flow'
      });
    }
    
    // Delete all contacts associated with this flow
    await Contact.deleteMany({ flow: req.params.id });
    
    // Delete the flow
    await flow.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete flow error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Activate a flow
// @route   PUT /api/flows/:id/activate
// @access  Private
exports.activateFlow = async (req, res) => {
  try {
    let flow = await Flow.findById(req.params.id);
    
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
        error: 'Not authorized to activate this flow'
      });
    }
    
    // Check if user has an active subscription
    const user = await User.findById(req.user.id);
    if (!user.activeSubscription) {
      return res.status(400).json({
        success: false,
        error: 'You need an active subscription to activate flows'
      });
    }
    
    // Update flow to active
    flow = await Flow.findByIdAndUpdate(
      req.params.id, 
      { isActive: true },
      { new: true }
    );
    
    // Increment user's active flow count
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { activeFlows: 1 } }
    );
    
    res.status(200).json({
      success: true,
      data: flow
    });
  } catch (error) {
    console.error('Activate flow error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Deactivate a flow
// @route   PUT /api/flows/:id/deactivate
// @access  Private
exports.deactivateFlow = async (req, res) => {
  try {
    let flow = await Flow.findById(req.params.id);
    
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
        error: 'Not authorized to deactivate this flow'
      });
    }
    
    // Check if flow is already inactive
    if (!flow.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Flow is already inactive'
      });
    }
    
    // Update flow to inactive
    flow = await Flow.findByIdAndUpdate(
      req.params.id, 
      { isActive: false },
      { new: true }
    );
    
    // Decrement user's active flow count
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { activeFlows: -1 } }
    );
    
    res.status(200).json({
      success: true,
      data: flow
    });
  } catch (error) {
    console.error('Deactivate flow error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
