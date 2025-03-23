const Template = require('../models/Template');
const User = require('../models/User');

// @desc    Get all templates (both system and user templates)
// @route   GET /api/templates
// @access  Private
exports.getTemplates = async (req, res) => {
  try {
    // Get system templates
    const systemTemplates = await Template.find({ isSystem: true });
    
    // Get user templates
    const userTemplates = await Template.find({ user: req.user.id });
    
    // Combine templates
    const templates = [...systemTemplates, ...userTemplates];
    
    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get a single template
// @route   GET /api/templates/:id
// @access  Private
exports.getTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    // Make sure user has access to this template (either system or owned by user)
    if (!template.isSystem && template.user && template.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this template'
      });
    }
    
    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Create new template
// @route   POST /api/templates
// @access  Private
exports.createTemplate = async (req, res) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;
    req.body.isSystem = false; // Ensure user can't create system templates
    
    // Create template
    const template = await Template.create(req.body);
    
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

// @desc    Update template
// @route   PUT /api/templates/:id
// @access  Private
exports.updateTemplate = async (req, res) => {
  try {
    let template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    // Don't allow editing system templates
    if (template.isSystem) {
      return res.status(403).json({
        success: false,
        error: 'System templates cannot be modified'
      });
    }
    
    // Make sure user owns the template
    if (template.user && template.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this template'
      });
    }
    
    // Prevent changing isSystem status
    delete req.body.isSystem;
    delete req.body.user;
    
    // Update template
    template = await Template.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete template
// @route   DELETE /api/templates/:id
// @access  Private
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    // Don't allow deleting system templates
    if (template.isSystem) {
      return res.status(403).json({
        success: false,
        error: 'System templates cannot be deleted'
      });
    }
    
    // Make sure user owns the template
    if (template.user && template.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this template'
      });
    }
    
    await template.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get template categories
// @route   GET /api/templates/categories
// @access  Private
exports.getTemplateCategories = async (req, res) => {
  try {
    // Get all distinct categories
    const categories = await Template.distinct('category');
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get template categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}; 