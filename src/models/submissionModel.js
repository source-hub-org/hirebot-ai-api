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
 * @property {number} [answers[].point=0] - Score given to the answer
 * @property {number} [answers[].is_skip=0] - Whether the question was skipped (0 or 1)
 * @property {Array<Object>} [instruments=[]] - Array of instrument responses
 * @property {string} instruments[].instrument_id - ID of the instrument (required)
 * @property {number|null} [instruments[].answer=null] - Selected answer (0-4 or null)
 * @property {string} [instruments[].other=''] - Additional text for the instrument response
 * @property {number} [instruments[].point=0] - Score given to the instrument response
 * @property {number} [instruments[].is_skip=0] - Whether the instrument was skipped (0 or 1)
 * @property {Array<Object>} [logic_questions=[]] - Array of logic question responses
 * @property {string} logic_questions[].logic_question_id - ID of the logic question (required)
 * @property {string} [logic_questions[].answer=''] - Answer to the logic question (e.g., 'true,false,true')
 * @property {string} [logic_questions[].other=''] - Additional text for the logic question response
 * @property {number} [logic_questions[].point=0] - Score given to the logic question response
 * @property {number} [logic_questions[].is_skip=0] - Whether the logic question was skipped (0 or 1)
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
  instruments: [],
  logic_questions: [],
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
 * Required fields for each instrument in the instruments array
 * @type {Array<string>}
 */
const requiredInstrumentFields = ['instrument_id'];

/**
 * Required fields for each logic question in the logic_questions array
 * @type {Array<string>}
 */
const requiredLogicQuestionFields = ['logic_question_id'];

/**
 * Submission model definition
 */
const submissionModel = {
  collectionName: 'submissions',
  requiredFields,
  requiredAnswerFields,
  requiredInstrumentFields,
  requiredLogicQuestionFields,
  defaultValues,
  answerValueRange: {
    min: 0,
    max: 3,
  },
  instrumentValueRange: {
    min: 0,
    max: 4,
  },
};

module.exports = submissionModel;
