/**
 * Candidate Model Module
 * @module models/candidateModel
 */

/**
 * Candidate schema definition
 * @typedef {Object} CandidateSchema
 * @property {string} [full_name=''] - Full name of the candidate
 * @property {string} email - Email address of the candidate (required)
 * @property {string} [phone_number=''] - Phone number of the candidate
 * @property {string} [gender=''] - Gender of the candidate
 * @property {string} [birthday=''] - Birthday of the candidate
 * @property {string} [location=''] - Location of the candidate
 * @property {string} [education_level=''] - Education level of the candidate
 * @property {string} [major=''] - Major of the candidate
 * @property {number} [years_of_experience=0] - Years of experience
 * @property {string} [current_position=''] - Current position of the candidate
 * @property {Array<string>} [skills=[]] - Skills of the candidate
 * @property {Array<string>} [programming_languages=[]] - Programming languages known by the candidate
 * @property {string} [preferred_stack=''] - Preferred technology stack
 * @property {string} [interview_level=''] - Interview level
 * @property {Array<string>} [assigned_topics=[]] - Topics assigned for the interview
 * @property {number} [interview_score=0] - Score from the interview
 * @property {string} [interview_feedback=''] - Feedback from the interview
 * @property {string} [interview_date=''] - Date of the interview
 * @property {string} [interviewer_name=''] - Name of the interviewer
 * @property {string} [cv_url=''] - URL to the candidate's CV
 * @property {string} [portfolio_url=''] - URL to the candidate's portfolio
 * @property {string} [linkedin_url=''] - URL to the candidate's LinkedIn profile
 * @property {string} [status=''] - Current status of the candidate
 * @property {string} [createdAt=''] - Creation timestamp
 * @property {string} [updatedAt=''] - Last update timestamp
 */

/**
 * Default values for candidate fields
 * @type {Object}
 */
const defaultValues = {
  full_name: '',
  phone_number: '',
  interview_level: '',
  gender: '',
  birthday: '',
  location: '',
  education_level: '',
  major: '',
  years_of_experience: 0,
  current_position: '',
  skills: [],
  programming_languages: [],
  preferred_stack: '',
  assigned_topics: [],
  interview_score: 0,
  interview_feedback: '',
  interview_date: '',
  interviewer_name: '',
  cv_url: '',
  portfolio_url: '',
  linkedin_url: '',
  status: '',
  createdAt: '',
  updatedAt: '',
};

/**
 * Required fields for a candidate
 * @type {Array<string>}
 */
const requiredFields = ['email'];

/**
 * Candidate model definition
 */
const candidateModel = {
  collectionName: 'candidates',
  requiredFields,
  defaultValues,
};

module.exports = candidateModel;
