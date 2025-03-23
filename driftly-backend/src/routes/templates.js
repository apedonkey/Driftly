const express = require('express');
const router = express.Router();
const { 
  getTemplates, 
  getTemplate, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate,
  getTemplateCategories 
} = require('../controllers/templateController');
const { protect } = require('../middlewares/auth');

// Protect all routes
router.use(protect);

// Categories route - must be before /:id routes to avoid conflict
router.get('/categories', getTemplateCategories);

// Template routes
router.route('/')
  .get(getTemplates)
  .post(createTemplate);

router.route('/:id')
  .get(getTemplate)
  .put(updateTemplate)
  .delete(deleteTemplate);

// @desc    Get template categories
// @route   GET /api/templates/categories
// @access  Private
router.get('/categories', async (req, res) => {
  try {
    // Get all distinct categories
    const categories = await Template.distinct('category');
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Get template tags
// @route   GET /api/templates/tags
// @access  Private
router.get('/tags', async (req, res) => {
  try {
    // Get all distinct tags
    const tags = await Template.distinct('tags');
    
    // Flatten the array if needed
    const flattenedTags = tags.flat().filter(Boolean);
    
    // Remove duplicates
    const uniqueTags = [...new Set(flattenedTags)];
    
    res.status(200).json({
      success: true,
      data: uniqueTags
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;
