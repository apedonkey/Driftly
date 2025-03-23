const mongoose = require('mongoose');
const Flow = require('../models/Flow');
const Contact = require('../models/Contact');
const logger = require('../utils/logger');

/**
 * Error Handling Service for Automation Workflows
 * This service provides methods for tracking, reporting, and handling errors 
 * that occur during automation workflow execution.
 */
class ErrorHandlingService {
  /**
   * Logs an error that occurred during automation execution
   * @param {string} flowId - The ID of the flow where the error occurred
   * @param {string} contactId - The ID of the contact being processed
   * @param {string} stepId - The ID of the step where the error occurred
   * @param {string} errorType - The type of error that occurred
   * @param {string} errorMessage - The error message
   * @param {Object} additionalData - Any additional data relevant to the error
   * @returns {Promise<Object>} The error record
   */
  async logError(flowId, contactId, stepId, errorType, errorMessage, additionalData = {}) {
    try {
      const flow = await Flow.findById(flowId);
      if (!flow) {
        logger.error(`Cannot log error: Flow with ID ${flowId} not found`);
        return null;
      }

      const step = flow.steps.find(s => s.id === stepId);
      const stepName = step ? step.name : 'Unknown Step';

      // Add error to flow's errors array
      const errorRecord = {
        date: new Date(),
        contactId,
        stepId,
        stepName,
        errorType,
        errorMessage,
        additionalData
      };

      flow.errors = flow.errors || [];
      flow.errors.push(errorRecord);
      
      // Update error statistics
      if (!flow.errorStats) {
        flow.errorStats = {
          totalErrors: 0,
          byStep: {},
          byType: {}
        };
      }
      
      flow.errorStats.totalErrors += 1;
      
      // By Step
      if (!flow.errorStats.byStep[stepId]) {
        flow.errorStats.byStep[stepId] = {
          count: 0,
          name: stepName
        };
      }
      flow.errorStats.byStep[stepId].count += 1;
      
      // By Error Type
      if (!flow.errorStats.byType[errorType]) {
        flow.errorStats.byType[errorType] = 0;
      }
      flow.errorStats.byType[errorType] += 1;
      
      // Update contact status if needed
      if (contactId) {
        const contact = await Contact.findById(contactId);
        if (contact) {
          contact.status = 'error';
          contact.lastError = {
            stepId,
            errorType,
            errorMessage,
            timestamp: new Date()
          };
          await contact.save();
        }
      }
      
      await flow.save();
      logger.warn(`Error in automation ${flow.name} (${flowId}), step ${stepName}: ${errorMessage}`);
      
      return errorRecord;
    } catch (error) {
      logger.error('Error in ErrorHandlingService.logError:', error);
      throw error;
    }
  }

  /**
   * Retrieves error statistics for a specific flow
   * @param {string} flowId - The ID of the flow
   * @returns {Promise<Object>} Error statistics
   */
  async getErrorStats(flowId) {
    try {
      const flow = await Flow.findById(flowId);
      if (!flow) {
        throw new Error(`Flow with ID ${flowId} not found`);
      }
      
      return flow.errorStats || { totalErrors: 0, byStep: {}, byType: {} };
    } catch (error) {
      logger.error('Error in ErrorHandlingService.getErrorStats:', error);
      throw error;
    }
  }

  /**
   * Gets all errors for a specific flow
   * @param {string} flowId - The ID of the flow
   * @param {Object} filters - Optional filters to apply
   * @returns {Promise<Array>} The list of errors
   */
  async getFlowErrors(flowId, filters = {}) {
    try {
      const flow = await Flow.findById(flowId);
      if (!flow) {
        throw new Error(`Flow with ID ${flowId} not found`);
      }
      
      let errors = flow.errors || [];
      
      // Apply filters if they exist
      if (filters.stepId) {
        errors = errors.filter(error => error.stepId === filters.stepId);
      }
      
      if (filters.errorType) {
        errors = errors.filter(error => error.errorType === filters.errorType);
      }
      
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        errors = errors.filter(error => new Date(error.date) >= startDate);
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        errors = errors.filter(error => new Date(error.date) <= endDate);
      }
      
      // Sort by date (newest first)
      errors.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      return errors;
    } catch (error) {
      logger.error('Error in ErrorHandlingService.getFlowErrors:', error);
      throw error;
    }
  }

  /**
   * Retrieves contacts in error state for a specific flow
   * @param {string} flowId - The ID of the flow
   * @returns {Promise<Array>} List of contacts in error state
   */
  async getContactsInError(flowId) {
    try {
      const contactsInError = await Contact.find({
        flow: flowId,
        status: 'error'
      }).select('_id email firstName lastName status lastError');
      
      return contactsInError;
    } catch (error) {
      logger.error('Error in ErrorHandlingService.getContactsInError:', error);
      throw error;
    }
  }

  /**
   * Attempts to retry processing a contact that had an error
   * @param {string} flowId - The ID of the flow
   * @param {string} contactId - The ID of the contact to retry
   * @returns {Promise<Object>} The updated contact
   */
  async retryContact(flowId, contactId) {
    try {
      const contact = await Contact.findOne({
        _id: contactId,
        flow: flowId,
        status: 'error'
      });
      
      if (!contact) {
        throw new Error(`Contact not found or not in error state`);
      }
      
      // Reset status to active
      contact.status = 'active';
      
      // Clear the error
      contact.lastError = null;
      
      // Set to retry from the step that had the error
      if (contact.currentStepId) {
        // Keep the current step, it will be retried
      } else {
        // If no current step, start from the beginning
        const flow = await Flow.findById(flowId);
        if (!flow || !flow.steps || flow.steps.length === 0) {
          throw new Error(`Flow has no steps`);
        }
        
        contact.currentStepId = flow.steps[0].id;
      }
      
      await contact.save();
      
      logger.info(`Contact ${contactId} set for retry in flow ${flowId}`);
      return contact;
    } catch (error) {
      logger.error('Error in ErrorHandlingService.retryContact:', error);
      throw error;
    }
  }

  /**
   * Attempts to retry all contacts in error state for a flow
   * @param {string} flowId - The ID of the flow
   * @returns {Promise<Object>} Stats about the retry operation
   */
  async retryAllContacts(flowId) {
    try {
      const result = await Contact.updateMany(
        { flow: flowId, status: 'error' },
        { 
          $set: { status: 'active' },
          $unset: { lastError: "" }
        }
      );
      
      logger.info(`Reset ${result.modifiedCount} contacts for retry in flow ${flowId}`);
      
      return {
        attempted: result.matchedCount,
        reset: result.modifiedCount
      };
    } catch (error) {
      logger.error('Error in ErrorHandlingService.retryAllContacts:', error);
      throw error;
    }
  }
}

module.exports = new ErrorHandlingService(); 