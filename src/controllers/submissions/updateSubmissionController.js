/**
 * Update Submission Controller
 * @module controllers/submissions/updateSubmissionController
 */

const { ObjectId } = require('mongodb');
const { validateSubmissionInput, sanitizeUpdateData } = require('../../utils/submissionValidator');
const {
  getSubmissionById,
  questionsExist,
  instrumentsExist,
  logicQuestionsExist,
} = require('../../repository/submissionRepository');
const baseRepository = require('../../repository/baseRepository');
const submissionModel = require('../../models/submissionModel');
const logger = require('../../utils/logger');

/**
 * Extract question IDs from answers
 * @param {Array} answers - Array of answer objects
 * @returns {Array} Array of question IDs
 */
const extractQuestionIds = answers => {
  return answers && Array.isArray(answers) ? answers.map(answer => answer.question_id) : [];
};

/**
 * Extract instrument IDs from instruments
 * @param {Array} instruments - Array of instrument objects
 * @returns {Array} Array of instrument IDs
 */
const extractInstrumentIds = instruments => {
  return instruments && Array.isArray(instruments)
    ? instruments.map(instrument => instrument.instrument_id)
    : [];
};

/**
 * Extract logic question IDs from logic questions
 * @param {Array} logicQuestions - Array of logic question objects
 * @returns {Array} Array of logic question IDs
 */
const extractLogicQuestionIds = logicQuestions => {
  return logicQuestions && Array.isArray(logicQuestions)
    ? logicQuestions.map(logicQuestion => logicQuestion.logic_question_id)
    : [];
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
 * Check if all instruments exist
 * @param {Array} instrumentIds - Array of instrument IDs
 * @returns {Promise<Object>} Object with exists flag and missing IDs
 */
const checkInstrumentsExist = async instrumentIds => {
  return await instrumentsExist(instrumentIds);
};

/**
 * Check if all logic questions exist
 * @param {Array} logicQuestionIds - Array of logic question IDs
 * @returns {Promise<Object>} Object with exists flag and missing IDs
 */
const checkLogicQuestionsExist = async logicQuestionIds => {
  return await logicQuestionsExist(logicQuestionIds);
};

/**
 * Update a submission by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Updated submission
 */
const updateSubmission = async (req, res) => {
  try {
    const submissionId = req.params.id;

    // Check if ID is valid
    if (!ObjectId.isValid(submissionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid submission ID format',
      });
    }

    // Check if submission exists
    const existingSubmission = await getSubmissionById(submissionId);
    if (!existingSubmission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found',
        details: `Submission with ID ${submissionId} does not exist`,
      });
    }

    // Validate update data
    const updateData = sanitizeUpdateData(req.body);
    const validation = validateSubmissionInput({
      ...existingSubmission,
      ...updateData,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors,
      });
    }

    // Check if all questions exist
    if (updateData.answers) {
      const questionIds = extractQuestionIds(updateData.answers);
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
    }

    // Check if all instruments exist
    if (updateData.instruments) {
      const instrumentIds = extractInstrumentIds(updateData.instruments);
      if (instrumentIds.length > 0) {
        const { exists, missingIds } = await checkInstrumentsExist(instrumentIds);
        if (!exists) {
          return res.status(404).json({
            success: false,
            error: 'Instruments not found',
            details: `The following instrument IDs do not exist: ${missingIds.join(', ')}`,
          });
        }
      }
    }

    // Check if all logic questions exist
    if (updateData.logic_questions) {
      const logicQuestionIds = extractLogicQuestionIds(updateData.logic_questions);
      if (logicQuestionIds.length > 0) {
        const { exists, missingIds } = await checkLogicQuestionsExist(logicQuestionIds);
        if (!exists) {
          return res.status(404).json({
            success: false,
            error: 'Logic questions not found',
            details: `The following logic question IDs do not exist: ${missingIds.join(', ')}`,
          });
        }
      }
    }

    // Update submission
    const result = await baseRepository.updateOne(
      submissionModel.collectionName,
      { _id: new ObjectId(submissionId) },
      { $set: updateData }
    );

    if (!result.acknowledged) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update submission',
      });
    }

    // Get updated submission
    const updatedSubmission = await getSubmissionById(submissionId);

    res.status(200).json({
      success: true,
      data: updatedSubmission,
      message: 'Submission updated successfully',
    });
  } catch (error) {
    logger.error(`Error in PUT /submissions/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to update submission',
    });
  }
};

module.exports = {
  updateSubmission,
};
