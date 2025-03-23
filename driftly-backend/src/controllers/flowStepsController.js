const Flow = require('../models/Flow');

// @desc    Add or update steps in a flow
// @route   PUT /api/flows/:id/steps
// @access  Private
exports.updateFlowSteps = async (req, res) => {
  try {
    const { id } = req.params;
    const { steps } = req.body;
    
    // Check if flow exists
    let flow = await Flow.findById(id);
    
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
    
    // Validate steps array
    if (!Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of steps'
      });
    }
    
    // Update flow steps
    flow = await Flow.findByIdAndUpdate(
      id,
      { steps },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: flow
    });
  } catch (error) {
    console.error('Update flow steps error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get flow analytics
// @route   GET /api/flows/:id/analytics
// @access  Private
exports.getFlowAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if flow exists
    const flow = await Flow.findById(id);
    
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
    
    // Get analytics data from flow stats
    const analytics = {
      totalContacts: flow.stats.totalContacts || 0,
      emailsSent: flow.stats.emailsSent || 0,
      opens: flow.stats.opens || 0,
      clicks: flow.stats.clicks || 0,
      openRate: flow.stats.emailsSent > 0 
        ? (flow.stats.opens / flow.stats.emailsSent * 100).toFixed(2) 
        : 0,
      clickRate: flow.stats.opens > 0 
        ? (flow.stats.clicks / flow.stats.opens * 100).toFixed(2) 
        : 0,
      status: flow.isActive ? 'active' : 'inactive',
      createdAt: flow.createdAt,
      updatedAt: flow.updatedAt
    };
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get flow analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
