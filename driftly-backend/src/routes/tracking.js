const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');
const authMiddleware = require('../middlewares/auth');
const rateLimit = require('express-rate-limit');

// Apply stricter rate limiting to tracking endpoints to prevent abuse
const trackingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // limit each IP to 200 requests per minute
  message: 'Too many requests from this IP, please try again after a minute'
});

// Public tracking endpoints - these don't require authentication
// These endpoints are used in emails and must be publicly accessible

// Standard tracking pixel
router.get('/pixel.gif', trackingLimiter, trackingController.trackPixel);

// CSS-based tracking (backup for clients that block images)
router.get('/css', trackingLimiter, trackingController.trackCss);

// DNS-based tracking (if using a wildcard DNS record)
router.get('/dns/:contactId/open.gif', trackingLimiter, trackingController.trackDns);

// Link click tracking and redirect
router.get('/redirect', trackingLimiter, trackingController.trackRedirect);

// Protected API endpoints - require authentication
// These endpoints are used by the frontend application
router.get('/events/:flowId', authMiddleware.protect, trackingController.getEvents);
router.get('/analytics/:flowId', authMiddleware.protect, trackingController.getAnalytics);
router.get('/generate/:flowId/:stepId', authMiddleware.protect, trackingController.generateTrackingCode);

module.exports = router; 