/**
 * Create Submission Controller
 * @module controllers/submissions/createSubmissionController
 */

const { validateSubmissionInput } = require('../../utils/submissionValidator');
const {
  insertSubmissionToDB,
  candidateExists,
  questionsExist,
} = require('../../repository/submissionRepository');
const logger = require('../../utils/logger');

/**
 * Validate submission input data
 * @param {Object} submissionData - Submission data to validate
 * @returns {Object} Validation result
 */
const validateSubmission = submissionData => {
  return validateSubmissionInput(submissionData);
};

/**
 * Check if candidate exists
 * @param {string} candidateId - Candidate ID
 * @returns {Promise<boolean>} True if candidate exists
 */
const checkCandidateExists = async candidateId => {
  return await candidateExists(candidateId);
};

/**
 * Extract question IDs from answers
 * @param {Array} answers - Array of answer objects
 * @returns {Array} Array of question IDs
 */
const extractQuestionIds = answers => {
  return answers && Array.isArray(answers) ? answers.map(answer => answer.question_id) : [];
};

/**
 * Check if all questions exist
 * @param {Array} questionIds - Array of question IDs
 * @returns {Promise<Object>} Object with exists flag and missing IDs
 */
const checkQuestionsExist = async questionIds => {
  return await questionsExist(questionIds);
};

/**
 * Create a new submission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Created submission
 */
const createSubmission = async (req, res) => {
  try {
    // Validate input
    const validation = validateSubmission(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors,
      });
    }

    // Check if candidate exists
    const candidateId = req.body.candidate_id;
    const candidateFound = await checkCandidateExists(candidateId);

    if (!candidateFound) {
      return res.status(404).json({
        success: false,
        error: 'Candidate not found',
        details: `Candidate with ID ${candidateId} does not exist`,
      });
    }

    // Extract question IDs from answers
    const questionIds = extractQuestionIds(req.body.answers);

    // Check if all questions exist
    if (questionIds.length > 0) {
      const { exists, missingIds } = await checkQuestionsExist(questionIds);

      if (!exists) {
        return res.status(404).json({
          success: false,
          error: 'Questions not found',
          details: `The following question IDs do not exist: ${missingIds.join(', ')}`,
        });
      }
    }

    // Insert submission
    const newSubmission = await insertSubmissionToDB(req.body);

    res.status(201).json({
      success: true,
      data: newSubmission,
      message: 'Submission created successfully',
    });
  } catch (error) {
    logger.error('Error in POST /submissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create submission',
    });
  }
};

module.exports = {
  createSubmission,
};
