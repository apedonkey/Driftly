const path = require('path');
const fs = require('fs');
const trackingService = require('../services/trackingService');
const UAParser = require('ua-parser-js');

// 1x1 transparent GIF pixel in base64
const TRANSPARENT_GIF_BUFFER = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

/**
 * Track email open via transparent pixel
 * @route GET /tracking/pixel.gif
 */
const trackPixel = async (req, res) => {
  try {
    const { flowId, stepId, contactId, type } = req.query;
    
    // Validate required parameters
    if (!flowId || !stepId || !contactId) {
      console.warn('Missing required tracking parameters');
      // Still return the transparent pixel even if params are invalid
      return sendTransparentPixel(res);
    }
    
    // Extract IP and user agent information
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Record event asynchronously - don't wait for it to complete before responding
    trackingService.recordOpenEvent({
      flowId,
      stepId,
      contactId,
      ipAddress,
      userAgent,
      trackingMethod: 'pixel'
    }).catch(err => {
      console.error('Error recording open event:', err);
    });
    
    // Return a 1x1 transparent GIF
    return sendTransparentPixel(res);
  } catch (error) {
    console.error('Error tracking pixel:', error);
    return sendTransparentPixel(res);
  }
};

/**
 * Track email opens via CSS import (backup method for clients that block images)
 * @route GET /tracking/css
 */
const trackCss = async (req, res) => {
  try {
    const { flowId, stepId, contactId } = req.query;
    
    // Validate required parameters
    if (!flowId || !stepId || !contactId) {
      console.warn('Missing required tracking parameters');
      // Return empty CSS with long cache time
      return sendEmptyCss(res);
    }
    
    // Extract IP and user agent information
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Record event asynchronously - don't wait for it to complete before responding
    trackingService.recordOpenEvent({
      flowId,
      stepId,
      contactId,
      ipAddress,
      userAgent,
      trackingMethod: 'css'
    }).catch(err => {
      console.error('Error recording CSS open event:', err);
    });
    
    // Return empty CSS
    return sendEmptyCss(res);
  } catch (error) {
    console.error('Error tracking CSS open:', error);
    return sendEmptyCss(res);
  }
};

/**
 * Track email open through DNS subdomain request
 * @route GET /tracking/dns/:contactId/open.gif
 */
const trackDns = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { flowId, stepId } = req.query;
    
    // Validate required parameters
    if (!flowId || !stepId || !contactId) {
      console.warn('Missing required tracking parameters for DNS tracking');
      // Still return the transparent pixel even if params are invalid
      return sendTransparentPixel(res);
    }
    
    // Extract IP and user agent information
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Record event asynchronously - don't wait for it to complete before responding
    trackingService.recordOpenEvent({
      flowId,
      stepId,
      contactId,
      ipAddress,
      userAgent,
      trackingMethod: 'dns'
    }).catch(err => {
      console.error('Error recording DNS open event:', err);
    });
    
    // Return a 1x1 transparent GIF
    return sendTransparentPixel(res);
  } catch (error) {
    console.error('Error tracking DNS open:', error);
    return sendTransparentPixel(res);
  }
};

/**
 * Track email link click and redirect to destination URL
 * @route GET /tracking/redirect
 */
const trackRedirect = async (req, res) => {
  try {
    const { flowId, stepId, contactId, url, type } = req.query;
    
    // Validate required parameters
    if (!flowId || !stepId || !contactId || !url) {
      return res.status(400).json({
        success: false,
        message: 'Missing required tracking parameters'
      });
    }
    
    // Validate URL is properly formatted and safe
    if (!isValidUrl(url)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination URL'
      });
    }
    
    // Extract IP and user agent information
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Record event asynchronously - don't wait for it to complete
    trackingService.recordClickEvent({
      flowId,
      stepId,
      contactId,
      url,
      ipAddress,
      userAgent,
      trackingMethod: 'redirect'
    }).catch(err => {
      console.error('Error recording click event:', err);
    });
    
    // Redirect to the destination URL
    return res.redirect(url);
  } catch (error) {
    console.error('Error tracking redirect:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing redirect'
    });
  }
};

/**
 * Get tracking events for a specific flow
 * @route GET /api/tracking/events/:flowId
 */
const getEvents = async (req, res) => {
  try {
    const { flowId } = req.params;
    const { startDate, endDate, type, limit, page } = req.query;
    
    const events = await trackingService.getFlowEvents(flowId, {
      startDate,
      endDate,
      type,
      limit: parseInt(limit) || 1000,
      page: parseInt(page) || 1
    });
    
    return res.json({
      success: true,
      ...events
    });
  } catch (error) {
    console.error('Error getting tracking events:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving tracking events'
    });
  }
};

/**
 * Get analytics for a specific flow
 * @route GET /api/tracking/analytics/:flowId
 */
const getAnalytics = async (req, res) => {
  try {
    const { flowId } = req.params;
    const { startDate, endDate, groupBy } = req.query;
    
    const analytics = await trackingService.getFlowAnalytics(flowId, {
      startDate,
      endDate,
      groupBy
    });
    
    return res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting flow analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving flow analytics'
    });
  }
};

/**
 * Generate tracking code for an email template
 * @route GET /api/tracking/generate/:flowId/:stepId
 */
const generateTrackingCode = async (req, res) => {
  try {
    const { flowId, stepId } = req.params;
    
    // Validate required parameters
    if (!flowId || !stepId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }
    
    // Generate tracking code
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const trackingParams = `flowId=${flowId}&stepId=${stepId}&contactId={{contactId}}`;
    const cacheBuster = `&t={{timestamp}}`;
    
    // Pixel tracking
    const trackingPixelUrl = `${baseUrl}/tracking/pixel.gif?${trackingParams}${cacheBuster}`;
    const trackingPixelHtml = `<img src="${trackingPixelUrl}" alt="" width="1" height="1" style="display:none;" />`;
    
    // Link tracking
    const clickTrackingTemplate = `${baseUrl}/tracking/redirect?${trackingParams}&url={{YOUR_URL}}`;
    
    // CSS tracking (backup for image-blocking clients)
    const cssTrackingUrl = `${baseUrl}/tracking/css?${trackingParams}${cacheBuster}`;
    const cssTrackingHtml = `<style>@import url("${cssTrackingUrl}");</style>`;
    
    // Background tracking
    const backgroundTrackingHtml = `<div style="background-image:url('${trackingPixelUrl}')"></div>`;
    
    // DNS tracking (if enabled)
    const dnsHost = process.env.DNS_TRACKING_HOST || `track.${req.get('host').replace(/^[^.]+\./, '')}`;
    const dnsTrackingHtml = `<img src="https://{{contactId}}.${dnsHost}/open.gif?flowId=${flowId}&stepId=${stepId}" alt="" width="1" height="1" style="display:none;" />`;
    
    return res.json({
      success: true,
      data: {
        // Standard tracking
        trackingPixelUrl,
        trackingPixelHtml,
        clickTrackingTemplate,
        clickTrackingExample: `<a href="${clickTrackingTemplate.replace('{{YOUR_URL}}', 'https://example.com')}">Click here</a>`,
        
        // Backup tracking methods
        cssTrackingUrl,
        cssTrackingHtml,
        backgroundTrackingHtml,
        dnsTrackingHtml,
        
        // Combined method for maximum reliability
        combinedTrackingHtml: `${trackingPixelHtml}\n${cssTrackingHtml}`
      }
    });
  } catch (error) {
    console.error('Error generating tracking code:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating tracking code'
    });
  }
};

/**
 * Helper function to send a transparent GIF pixel
 */
const sendTransparentPixel = (res) => {
  res.set({
    'Content-Type': 'image/gif',
    'Content-Length': TRANSPARENT_GIF_BUFFER.length,
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  return res.end(TRANSPARENT_GIF_BUFFER);
};

/**
 * Helper function to send empty CSS
 */
const sendEmptyCss = (res) => {
  res.set({
    'Content-Type': 'text/css',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  return res.end('/* */');
};

/**
 * Helper function to validate URL
 */
const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
};

module.exports = {
  trackPixel,
  trackCss,
  trackDns,
  trackRedirect,
  getEvents,
  getAnalytics,
  generateTrackingCode
}; 