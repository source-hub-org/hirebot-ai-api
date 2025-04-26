/**
 * Create Candidate Controller
 * @module controllers/candidates/createCandidateController
 */

const { validateCandidateInput } = require('../../utils/candidateValidator');
const {
  insertCandidateToDB,
  candidateExistsByEmail,
} = require('../../repository/candidateRepository');
const logger = require('../../utils/logger');

/**
 * Validate candidate input data
 * @param {Object} candidateData - Candidate data to validate
 * @returns {Object} Validation result
 */
const validateCandidate = candidateData => {
  return validateCandidateInput(candidateData);
};

/**
 * Check if candidate email already exists
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} True if email exists, false otherwise
 */
const checkEmailExists = async email => {
  return await candidateExistsByEmail(email);
};

/**
 * Create a new candidate
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Created candidate
 */
const createCandidate = async (req, res) => {
  try {
    // Validate input
    const validation = validateCandidate(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors,
      });
    }

    // Check if candidate with this email already exists
    const emailExists = await checkEmailExists(req.body.email);
    if (emailExists) {
      return res.status(409).json({
        success: false,
        error: 'A candidate with this email already exists',
      });
    }

    // Insert candidate
    const newCandidate = await insertCandidateToDB(req.body);

    res.status(201).json({
      success: true,
      data: newCandidate,
      message: 'Candidate created successfully',
    });
  } catch (error) {
    logger.error('Error in POST /candidates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create candidate',
    });
  }
};

module.exports = {
  createCandidate,
};
