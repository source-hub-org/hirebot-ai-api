/**
 * Candidate Validator Module
 * @module utils/candidateValidator
 */

const candidateModel = require('../models/candidateModel');
const logger = require('./logger');

/**
 * Validates if an email is in the correct format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid, false otherwise
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates if a phone number is in the correct format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} True if phone number is valid, false otherwise
 */
function isValidPhoneNumber(phoneNumber) {
  // Basic phone number validation - can be enhanced based on requirements
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phoneNumber);
}

/**
 * Validates candidate input data
 * @param {Object} candidateData - Candidate data to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
function validateCandidateInput(candidateData) {
  const errors = [];
  const { requiredFields } = candidateModel;

  // Check required fields
  for (const field of requiredFields) {
    if (!candidateData[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate email format if provided
  if (candidateData.email && !isValidEmail(candidateData.email)) {
    errors.push('Invalid email format');
  }

  // Validate phone number format if provided
  if (candidateData.phone_number && !isValidPhoneNumber(candidateData.phone_number)) {
    errors.push('Invalid phone number format');
  }

  // Validate arrays are actually arrays
  const arrayFields = ['skills', 'programming_languages', 'assigned_topics'];
  for (const field of arrayFields) {
    if (candidateData[field] && !Array.isArray(candidateData[field])) {
      errors.push(`Field ${field} must be an array`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Formats candidate data with default values for missing fields
 * @param {Object} candidateData - Raw candidate data
 * @returns {Object} Formatted candidate data with defaults applied
 */
function formatCandidateDefaults(candidateData) {
  const { defaultValues } = candidateModel;
  const formattedCandidate = { ...candidateData };

  // Apply default values for missing fields
  for (const [key, defaultValue] of Object.entries(defaultValues)) {
    if (formattedCandidate[key] === undefined) {
      formattedCandidate[key] = defaultValue;
    }
  }

  // Set timestamps if not provided
  if (!formattedCandidate.created_at) {
    formattedCandidate.created_at = new Date().toISOString();
  }

  formattedCandidate.updated_at = new Date().toISOString();

  return formattedCandidate;
}

/**
 * Sanitizes candidate data for update operations
 * @param {Object} updateData - Data to be used for update
 * @returns {Object} Sanitized update data
 */
function sanitizeUpdateData(updateData) {
  const sanitized = { ...updateData };

  // Don't allow updating created_at
  delete sanitized.created_at;

  // Always update the updated_at timestamp
  sanitized.updated_at = new Date().toISOString();

  return sanitized;
}

module.exports = {
  validateCandidateInput,
  formatCandidateDefaults,
  sanitizeUpdateData,
  isValidEmail,
  isValidPhoneNumber,
};
