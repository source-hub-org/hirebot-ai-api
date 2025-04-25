/**
 * Submission Model Module
 * @module models/submissionModel
 */

/**
 * Submission schema definition
 * @typedef {Object} SubmissionSchema
 * @property {string} candidate_id - ID of the candidate (required)
 * @property {Array<Object>} [answers=[]] - Array of answers to questions
 * @property {string} answers[].question_id - ID of the question (required)
 * @property {number|null} [answers[].answer=null] - Selected answer (0-3 or null)
 * @property {string} [answers[].other=''] - Additional text for the answer
 * @property {number} [answers[].is_skip=0] - Whether the question was skipped (0 or 1)
 * @property {Object} [essay={}] - Essay information
 * @property {string} [essay.question=''] - Essay question
 * @property {string} [essay.answer=''] - Essay answer
 * @property {number} [essay.is_skip=0] - Whether the essay was skipped (0 or 1)
 * @property {Object} [review={}] - Review information
 * @property {string} [review.comment=''] - Review comment
 * @property {string} [review.status='submitted'] - Review status
 */

/**
 * Default values for submission fields
 * @type {Object}
 */
const defaultValues = {
  answers: [],
  essay: {
    question: null,
    answer: null,
    is_skip: 0,
  },
  review: {
    comment: '',
    status: 'submitted',
  },
};

/**
 * Required fields for a submission
 * @type {Array<string>}
 */
const requiredFields = ['candidate_id'];

/**
 * Required fields for each answer in the answers array
 * @type {Array<string>}
 */
const requiredAnswerFields = ['question_id'];

/**
 * Submission model definition
 */
const submissionModel = {
  collectionName: 'submissions',
  requiredFields,
  requiredAnswerFields,
  defaultValues,
  answerValueRange: {
    min: 0,
    max: 3,
  },
};

module.exports = submissionModel;
