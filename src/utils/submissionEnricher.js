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
 * Fetch instruments by array of IDs
 * @async
 * @param {Array<string>} instrumentIds - Array of instrument IDs
 * @returns {Promise<Object>} Map of instrument IDs to instrument data
 */
async function fetchInstrumentsByIds(instrumentIds) {
  try {
    if (!instrumentIds || !Array.isArray(instrumentIds) || instrumentIds.length === 0) {
      return {};
    }

    // Filter valid ObjectIds
    const validInstrumentIds = instrumentIds.filter(id => ObjectId.isValid(id));

    if (validInstrumentIds.length === 0) {
      return {};
    }

    const objectIds = validInstrumentIds.map(id => new ObjectId(id));

    // Select only necessary fields from instruments
    const instruments = await baseRepository.findMany(
      'instruments',
      { _id: { $in: objectIds } },
      {
        projection: {
          questionId: 1,
          questionText: 1,
          type: 1,
          options: 1,
          tags: 1,
        },
      }
    );

    // Convert array to map for easier lookup
    const instrumentMap = {};
    instruments.forEach(instrument => {
      instrumentMap[instrument._id.toString()] = instrument;
    });

    return instrumentMap;
  } catch (error) {
    logger.error('Error fetching instruments:', error);
    return {};
  }
}

/**
 * Fetch logic questions by array of IDs
 * @async
 * @param {Array<string>} logicQuestionIds - Array of logic question IDs
 * @returns {Promise<Object>} Map of logic question IDs to logic question data
 */
async function fetchLogicQuestionsByIds(logicQuestionIds) {
  try {
    if (!logicQuestionIds || !Array.isArray(logicQuestionIds) || logicQuestionIds.length === 0) {
      return {};
    }

    // Filter valid ObjectIds
    const validLogicQuestionIds = logicQuestionIds.filter(id => ObjectId.isValid(id));

    if (validLogicQuestionIds.length === 0) {
      return {};
    }

    const objectIds = validLogicQuestionIds.map(id => new ObjectId(id));

    // Select necessary fields from logic_questions
    const logicQuestions = await baseRepository.findMany(
      'logic_questions',
      { _id: { $in: objectIds } },
      {
        projection: {
          question: 1,
          description: 1,
          type: 1,
          level: 1,
          tag_ids: 1,
          tags: 1,
          choices: 1,
          answer_explanation: 1,
        },
      }
    );

    // Convert array to map for easier lookup
    const logicQuestionMap = {};
    logicQuestions.forEach(logicQuestion => {
      logicQuestionMap[logicQuestion._id.toString()] = logicQuestion;
    });

    return logicQuestionMap;
  } catch (error) {
    logger.error('Error fetching logic questions:', error);
    return {};
  }
}

/**
 * Enrich a single submission with candidate, question, instrument, and logic question data
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
      try {
        const candidate = await fetchCandidateById(submission.candidate_id);
        enrichedSubmission.candidate = candidate || null;
      } catch (candidateError) {
        logger.error(`Error enriching submission:`, candidateError);
        enrichedSubmission.candidate = null;
      }
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

    // Extract instrument IDs from instruments
    const instrumentIds =
      submission.instruments && Array.isArray(submission.instruments)
        ? submission.instruments.map(instrument => instrument.instrument_id)
        : [];

    // Fetch instruments data
    const instrumentMap = await fetchInstrumentsByIds(instrumentIds);

    // Enrich instruments with instrument data
    if (enrichedSubmission.instruments && Array.isArray(enrichedSubmission.instruments)) {
      enrichedSubmission.instruments = enrichedSubmission.instruments.map(instrument => {
        const instrumentId = instrument.instrument_id;
        return {
          ...instrument,
          instrument:
            instrumentId && instrumentMap[instrumentId] ? instrumentMap[instrumentId] : null,
        };
      });
    }

    // Extract logic question IDs from logic_questions
    const logicQuestionIds =
      submission.logic_questions && Array.isArray(submission.logic_questions)
        ? submission.logic_questions.map(logicQuestion => logicQuestion.logic_question_id)
        : [];

    // Fetch logic questions data
    const logicQuestionMap = await fetchLogicQuestionsByIds(logicQuestionIds);

    // Enrich logic_questions with logic question data
    if (enrichedSubmission.logic_questions && Array.isArray(enrichedSubmission.logic_questions)) {
      enrichedSubmission.logic_questions = enrichedSubmission.logic_questions.map(logicQuestion => {
        const logicQuestionId = logicQuestion.logic_question_id;
        return {
          ...logicQuestion,
          logic_question:
            logicQuestionId && logicQuestionMap[logicQuestionId]
              ? logicQuestionMap[logicQuestionId]
              : null,
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
      submissions.map(async submission => {
        try {
          return await enrichSubmission(submission);
        } catch (error) {
          logger.error(`Error enriching individual submission:`, error);
          return submission; // Return original submission if individual enrichment fails
        }
      })
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
  fetchInstrumentsByIds,
  fetchLogicQuestionsByIds,
  enrichSubmission,
  enrichSubmissions,
};
