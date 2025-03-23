const mongoose = require('mongoose');
const TrackingEvent = require('../models/TrackingEvent');
const Contact = require('../models/Contact');
const Flow = require('../models/Flow');
const deviceDetector = require('device-detector-js');
const geoip = require('geoip-lite');

// Initialize device detector
const detector = new deviceDetector();

// In memory cache to prevent duplicate events in quick succession
const eventCache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute cache TTL to prevent duplicate events

/**
 * Record an email open event
 * @param {Object} data Event data
 * @returns {Promise<Object>} The created tracking event
 */
const recordOpenEvent = async (data) => {
  try {
    const { flowId, stepId, contactId, ipAddress, userAgent } = data;
    
    // Create a cache key to deduplicate events
    const cacheKey = `open:${flowId}:${stepId}:${contactId}`;
    
    // Check if we've recorded this event recently
    if (isRecentlyTracked(cacheKey)) {
      console.log('Duplicate open event detected, skipping');
      return null;
    }
    
    // Detect device information
    const deviceInfo = detectDevice(userAgent);
    
    // Get geolocation data
    const geoData = getGeolocation(ipAddress);
    
    // Convert string IDs to ObjectIDs if necessary
    const event = new TrackingEvent({
      type: 'open',
      flowId: convertToObjectId(flowId),
      stepId,
      contactId: convertToObjectId(contactId),
      ipAddress,
      userAgent,
      device: deviceInfo.deviceType,
      clientInfo: deviceInfo.clientInfo,
      location: geoData,
      trackingMethod: 'pixel',
      timestamp: new Date()
    });
    
    // Save the event
    await event.save();
    
    // Update cache
    updateCache(cacheKey);
    
    // Update contact with interaction data
    try {
      const now = new Date();
      
      // First check if there's already an interaction record for this step
      const contact = await Contact.findById(contactId);
      
      if (contact) {
        // Check if we have an existing interaction for this step
        const existingInteractionIndex = contact.interactions ? 
          contact.interactions.findIndex(i => i.stepId === stepId) : -1;
          
        if (existingInteractionIndex >= 0) {
          // Update existing interaction
          await Contact.updateOne(
            { _id: contactId, "interactions.stepId": stepId },
            { 
              $set: { 
                "interactions.$.opened": true,
                "interactions.$.openedAt": now,
                "interactions.$.deviceInfo": deviceInfo.deviceType,
                "interactions.$.location": geoData ? `${geoData.city}, ${geoData.country}` : null
              },
              "events.lastOpen": now
            }
          );
        } else {
          // Add new interaction
          await Contact.findByIdAndUpdate(contactId, {
            $push: {
              interactions: {
                stepId,
                opened: true,
                openedAt: now,
                clicked: false,
                deviceInfo: deviceInfo.deviceType,
                location: geoData ? `${geoData.city}, ${geoData.country}` : null
              }
            },
            $set: { "events.lastOpen": now }
          });
        }
        
        // Increment open count in flow stats
        await Flow.findByIdAndUpdate(flowId, {
          $inc: { "stats.opens": 1 }
        });
        
        // Check if this opens any conditions for the contact
        await checkContactConditions(contactId, 'open', stepId);
      }
    } catch (err) {
      console.error('Error updating contact interaction data:', err);
      // Don't fail the overall operation if this update fails
    }
    
    return event;
  } catch (error) {
    console.error('Error recording open event:', error);
    throw error;
  }
};

/**
 * Record an email click event
 * @param {Object} data Event data
 * @returns {Promise<Object>} The created tracking event
 */
const recordClickEvent = async (data) => {
  try {
    const { flowId, stepId, contactId, url, ipAddress, userAgent } = data;
    
    // Create a cache key to deduplicate events
    const cacheKey = `click:${flowId}:${stepId}:${contactId}:${url}`;
    
    // Check if we've recorded this event recently
    if (isRecentlyTracked(cacheKey)) {
      console.log('Duplicate click event detected, skipping');
      return null;
    }
    
    // Detect device information
    const deviceInfo = detectDevice(userAgent);
    
    // Get geolocation data
    const geoData = getGeolocation(ipAddress);
    
    // Convert string IDs to ObjectIDs if necessary
    const event = new TrackingEvent({
      type: 'click',
      flowId: convertToObjectId(flowId),
      stepId,
      contactId: convertToObjectId(contactId),
      url,
      ipAddress,
      userAgent,
      device: deviceInfo.deviceType,
      clientInfo: deviceInfo.clientInfo,
      location: geoData,
      trackingMethod: 'redirect',
      timestamp: new Date()
    });
    
    // Save the event
    await event.save();
    
    // Update cache
    updateCache(cacheKey);
    
    // Update contact with interaction data
    try {
      const now = new Date();
      
      // First check if there's already an interaction record for this step
      const contact = await Contact.findById(contactId);
      
      if (contact) {
        // Check if we have an existing interaction for this step
        const existingInteractionIndex = contact.interactions ? 
          contact.interactions.findIndex(i => i.stepId === stepId) : -1;
          
        if (existingInteractionIndex >= 0) {
          // Update existing interaction
          const updateData = {
            $set: { 
              "interactions.$.clicked": true,
              "interactions.$.clickedAt": now,
              "interactions.$.deviceInfo": deviceInfo.deviceType,
              "interactions.$.location": geoData ? `${geoData.city}, ${geoData.country}` : null
            },
            $set: { "events.lastClick": now }
          };
          
          // Add URL to clicked links if not already there
          if (url) {
            const interaction = contact.interactions[existingInteractionIndex];
            if (!interaction.clickedLinks || !interaction.clickedLinks.includes(url)) {
              updateData.$push = { "interactions.$.clickedLinks": url };
            }
          }
          
          await Contact.updateOne(
            { _id: contactId, "interactions.stepId": stepId },
            updateData
          );
        } else {
          // Add new interaction
          await Contact.findByIdAndUpdate(contactId, {
            $push: {
              interactions: {
                stepId,
                opened: true, // Assume opened if clicked
                openedAt: now,
                clicked: true,
                clickedAt: now,
                clickedLinks: url ? [url] : [],
                deviceInfo: deviceInfo.deviceType,
                location: geoData ? `${geoData.city}, ${geoData.country}` : null
              }
            },
            $set: { 
              "events.lastOpen": now,
              "events.lastClick": now 
            }
          });
        }
        
        // Increment click count in flow stats
        await Flow.findByIdAndUpdate(flowId, {
          $inc: { "stats.clicks": 1 }
        });
        
        // Check if this clicks any conditions for the contact
        await checkContactConditions(contactId, 'click', stepId);
      }
    } catch (err) {
      console.error('Error updating contact interaction data:', err);
      // Don't fail the overall operation if this update fails
    }
    
    return event;
  } catch (error) {
    console.error('Error recording click event:', error);
    throw error;
  }
};

/**
 * Check if any conditions for this contact are triggered by this event
 * @param {String} contactId Contact ID
 * @param {String} eventType Event type ('open' or 'click')
 * @param {String} stepId Step ID that triggered the event
 */
const checkContactConditions = async (contactId, eventType, stepId) => {
  try {
    const contact = await Contact.findById(contactId).populate('flow');
    
    if (!contact || !contact.flow || !contact.flow.steps) {
      return;
    }
    
    // Check if this contact is waiting at a condition step
    if (!contact.currentStepId) {
      return;
    }
    
    const currentStep = contact.flow.steps.find(step => step.id === contact.currentStepId);
    
    if (!currentStep || currentStep.type !== 'condition') {
      return;
    }
    
    // Check if this condition is waiting for this event type
    if (currentStep.condition && currentStep.condition.type === eventType) {
      // For open/click conditions, check if the step matches
      if ((eventType === 'open' || eventType === 'click') && 
          currentStep.condition.value === stepId) {
        
        // Condition is satisfied, update contact to move to the 'yes' path
        if (currentStep.nextSteps && currentStep.nextSteps.yes) {
          await Contact.findByIdAndUpdate(contactId, {
            currentStepId: currentStep.nextSteps.yes,
            nextProcessingDate: new Date(), // Process immediately
            $push: {
              flowPath: {
                stepId: currentStep.id,
                action: 'condition_evaluated',
                result: true
              }
            }
          });
          
          console.log(`Contact ${contactId} satisfied condition, moving to step ${currentStep.nextSteps.yes}`);
        }
      }
    }
  } catch (error) {
    console.error('Error checking contact conditions:', error);
  }
};

/**
 * Get tracking events for a specific flow
 * @param {String} flowId Flow ID
 * @param {Object} options Query options
 * @returns {Promise<Array>} Array of tracking events
 */
const getFlowEvents = async (flowId, options = {}) => {
  try {
    const { 
      startDate, 
      endDate, 
      type, 
      limit = 1000, 
      page = 1 
    } = options;
    
    const query = { flowId: convertToObjectId(flowId) };
    
    // Add date range filter if provided
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    // Add type filter if provided
    if (type && ['open', 'click'].includes(type)) {
      query.type = type;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get events
    const events = await TrackingEvent.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count
    const total = await TrackingEvent.countDocuments(query);
    
    return {
      events,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error getting flow events:', error);
    throw error;
  }
};

/**
 * Get aggregated analytics for a flow
 * @param {String} flowId Flow ID
 * @param {Object} options Query options
 * @returns {Promise<Object>} Aggregated analytics data
 */
const getFlowAnalytics = async (flowId, options = {}) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = options;
    
    const matchStage = { flowId: convertToObjectId(flowId) };
    
    // Add date range filter if provided
    if (startDate || endDate) {
      matchStage.timestamp = {};
      if (startDate) matchStage.timestamp.$gte = new Date(startDate);
      if (endDate) matchStage.timestamp.$lte = new Date(endDate);
    }
    
    // Define time grouping format based on groupBy parameter
    let dateFormat;
    switch (groupBy) {
      case 'hour':
        dateFormat = { year: '$year', month: '$month', day: '$dayOfMonth', hour: '$hour' };
        break;
      case 'day':
        dateFormat = { year: '$year', month: '$month', day: '$dayOfMonth' };
        break;
      case 'week':
        dateFormat = { year: '$year', week: '$week' };
        break;
      case 'month':
        dateFormat = { year: '$year', month: '$month' };
        break;
      default:
        dateFormat = { year: '$year', month: '$month', day: '$dayOfMonth' };
    }
    
    // Aggregation pipeline
    const timeSeriesData = await TrackingEvent.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            date: dateFormat,
            type: '$type'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          events: {
            $push: {
              type: '$_id.type',
              count: '$count'
            }
          }
        }
      },
      { $sort: { '_id': 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          events: 1
        }
      }
    ]);
    
    // Format results to be more user-friendly
    const formattedTimeSeries = timeSeriesData.map(item => {
      const result = {
        date: formatDate(item.date, groupBy)
      };
      
      // Add counts for each event type
      item.events.forEach(event => {
        result[event.type] = event.count;
      });
      
      return result;
    });
    
    // Get total counts by event type
    const eventTypeCounts = await TrackingEvent.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Convert array to object for easier access
    const metrics = {};
    eventTypeCounts.forEach(item => {
      metrics[item._id] = item.count;
    });
    
    // Calculate rates if we have both opens and clicks
    if (metrics.open && metrics.click) {
      metrics.clickThroughRate = (metrics.click / metrics.open) * 100;
    }
    
    // Get event counts by step
    const stepAnalytics = await TrackingEvent.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            stepId: '$stepId',
            type: '$type'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.stepId',
          events: {
            $push: {
              type: '$_id.type',
              count: '$count'
            }
          }
        }
      }
    ]);
    
    // Format step analytics
    const formattedStepAnalytics = stepAnalytics.map(item => {
      const result = {
        stepId: item._id
      };
      
      // Add counts for each event type
      item.events.forEach(event => {
        result[event.type] = event.count;
      });
      
      // Calculate click through rate for the step
      if (result.open && result.click) {
        result.clickThroughRate = (result.click / result.open) * 100;
      }
      
      return result;
    });
    
    return {
      metrics,
      timeSeriesData: formattedTimeSeries,
      stepAnalytics: formattedStepAnalytics
    };
  } catch (error) {
    console.error('Error getting flow analytics:', error);
    throw error;
  }
};

// Helper function to check if an event was recently tracked
const isRecentlyTracked = (cacheKey) => {
  return eventCache.has(cacheKey);
};

// Helper function to update the cache with a new event
const updateCache = (cacheKey) => {
  eventCache.set(cacheKey, true);
  
  // Set expiration for cache entry
  setTimeout(() => {
    eventCache.delete(cacheKey);
  }, CACHE_TTL);
};

// Helper function to convert string IDs to ObjectIDs if needed
const convertToObjectId = (id) => {
  if (typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return id;
};

// Helper function to format date based on grouping
const formatDate = (dateObj, groupBy) => {
  const { year, month, day, hour, week } = dateObj;
  
  switch (groupBy) {
    case 'hour':
      return `${year}-${padZero(month)}-${padZero(day)} ${padZero(hour)}:00`;
    case 'day':
      return `${year}-${padZero(month)}-${padZero(day)}`;
    case 'week':
      return `${year}-W${padZero(week)}`;
    case 'month':
      return `${year}-${padZero(month)}`;
    default:
      return `${year}-${padZero(month)}-${padZero(day)}`;
  }
};

// Helper function to pad numbers with leading zeros
const padZero = (num) => {
  return num.toString().padStart(2, '0');
};

/**
 * Detect device type and email client from user agent
 * @param {String} userAgent User agent string
 * @returns {Object} Device and client information
 */
const detectDevice = (userAgent) => {
  if (!userAgent) {
    return { deviceType: 'unknown', clientInfo: null };
  }
  
  try {
    const device = detector.parse(userAgent);
    
    let deviceType = 'unknown';
    if (device.device && device.device.type) {
      if (device.device.type === 'smartphone') deviceType = 'mobile';
      else if (device.device.type === 'tablet') deviceType = 'tablet';
      else if (device.device.type === 'desktop') deviceType = 'desktop';
    }
    
    // Try to extract email client info
    let clientInfo = null;
    if (device.client && device.client.name) {
      clientInfo = device.client.name;
      if (device.client.version) {
        clientInfo += ` ${device.client.version}`;
      }
    }
    
    return { deviceType, clientInfo };
  } catch (error) {
    console.error('Error detecting device:', error);
    return { deviceType: 'unknown', clientInfo: null };
  }
};

/**
 * Get geolocation data from IP address
 * @param {String} ipAddress IP address
 * @returns {Object} Geolocation data
 */
const getGeolocation = (ipAddress) => {
  if (!ipAddress) return null;
  
  try {
    // Skip private/internal IP addresses
    if (ipAddress === '127.0.0.1' || ipAddress.startsWith('192.168.') || 
        ipAddress.startsWith('10.') || ipAddress.startsWith('172.')) {
      return null;
    }
    
    const geo = geoip.lookup(ipAddress);
    if (!geo) return null;
    
    return {
      country: geo.country,
      region: geo.region,
      city: geo.city
    };
  } catch (error) {
    console.error('Error getting geolocation:', error);
    return null;
  }
};

module.exports = {
  recordOpenEvent,
  recordClickEvent,
  getFlowEvents,
  getFlowAnalytics
}; 