/**
 * Submission Enricher Module
 * @module utils/submissionEnricher
 */

const { ObjectId } = require('mongodb');
const baseRepository = require('../repository/baseRepository');
const logger = require('./logger');

/**
 * Fetch candidate data by ID
 * @async
 * @param {string} candidateId - Candidate ID
 * @returns {Promise<Object|null>} Candidate data or null if not found
 */
async function fetchCandidateById(candidateId) {
  try {
    if (!ObjectId.isValid(candidateId)) {
      return null;
    }

    // Select only necessary fields from candidate
    return await baseRepository.findOne(
      'candidates',
      { _id: new ObjectId(candidateId) },
      {
        projection: {
          full_name: 1,
          email: 1,
          phone_number: 1,
          interview_level: 1,
          skills: 1,
          programming_languages: 1,
          status: 1,
        },
      }
    );
  } catch (error) {
    logger.error(`Error fetching candidate with ID ${candidateId}:`, error);
    return null;
  }
}

/**
 * Fetch questions by array of IDs
 * @async
 * @param {Array<string>} questionIds - Array of question IDs
 * @returns {Promise<Object>} Map of question IDs to question data
 */
async function fetchQuestionsByIds(questionIds) {
  try {
    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return {};
    }

    // Filter valid ObjectIds
    const validQuestionIds = questionIds.filter(id => ObjectId.isValid(id));

    if (validQuestionIds.length === 0) {
      return {};
    }

    const objectIds = validQuestionIds.map(id => new ObjectId(id));

    // Select only necessary fields from questions
    const questions = await baseRepository.findMany(
      'questions',
      { _id: { $in: objectIds } },
      {
        projection: {
          question: 1,
          text: 1,
          type: 1,
          difficulty: 1,
          options: 1,
          topic_id: 1,
          correctAnswer: 1,
          category: 1,
          topic: 1,
        },
      }
    );

    // Convert array to map for easier lookup
    const questionMap = {};
    questions.forEach(question => {
      questionMap[question._id.toString()] = question;
    });

    return questionMap;
  } catch (error) {
    logger.error('Error fetching questions:', error);
    return {};
  }
}

/**
 * Enrich a single submission with candidate and question data
 * @async
 * @param {Object} submission - Submission to enrich
 * @returns {Promise<Object>} Enriched submission
 */
async function enrichSubmission(submission) {
  if (!submission) {
    return null;
  }

  try {
    // Create a copy of the submission to avoid modifying the original
    const enrichedSubmission = { ...submission };

    // Fetch candidate data
    if (submission.candidate_id) {
      const candidate = await fetchCandidateById(submission.candidate_id);
      enrichedSubmission.candidate = candidate || null;
    } else {
      enrichedSubmission.candidate = null;
    }

    // Extract question IDs from answers
    const questionIds =
      submission.answers && Array.isArray(submission.answers)
        ? submission.answers.map(answer => answer.question_id)
        : [];

    // Fetch questions data
    const questionMap = await fetchQuestionsByIds(questionIds);

    // Enrich answers with question data
    if (enrichedSubmission.answers && Array.isArray(enrichedSubmission.answers)) {
      enrichedSubmission.answers = enrichedSubmission.answers.map(answer => {
        const questionId = answer.question_id;
        return {
          ...answer,
          question: questionId && questionMap[questionId] ? questionMap[questionId] : null,
        };
      });
    }

    return enrichedSubmission;
  } catch (error) {
    logger.error(`Error enriching submission:`, error);
    return submission; // Return original submission if enrichment fails
  }
}

/**
 * Enrich multiple submissions with candidate and question data
 * @async
 * @param {Array<Object>} submissions - Array of submissions to enrich
 * @returns {Promise<Array<Object>>} Array of enriched submissions
 */
async function enrichSubmissions(submissions) {
  if (!submissions || !Array.isArray(submissions) || submissions.length === 0) {
    return [];
  }

  try {
    // Process all submissions in parallel for better performance
    const enrichedSubmissions = await Promise.all(
      submissions.map(submission => enrichSubmission(submission))
    );

    return enrichedSubmissions.filter(Boolean); // Filter out null values
  } catch (error) {
    logger.error('Error enriching submissions:', error);
    return submissions; // Return original submissions if enrichment fails
  }
}

module.exports = {
  fetchCandidateById,
  fetchQuestionsByIds,
  enrichSubmission,
  enrichSubmissions,
};
