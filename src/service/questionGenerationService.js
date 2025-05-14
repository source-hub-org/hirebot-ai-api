/**
 * Question Generation Service
 * @module service/questionGenerationService
 */

const { generateQuizQuestions } = require('./gemini/quizQuestionCreator');
const { insertMany } = require('../repository/baseRepository');
const { getPositionMetadata, formatPositionForDisplay } = require('../utils/positionUtils');
const logger = require('../utils/logger');
const { ObjectId } = require('mongodb');

/**
 * Generates questions using AI and prepares them for storage
 * @param {Object} params - Parameters for question generation
 * @param {string} params.topic - The topic for questions
 * @param {string} params.language - The programming language
 * @param {string} params.position - The position level
 * @returns {Promise<Array>} - Array of generated questions with metadata
 */
const generateQuestions = async ({ topic, language, position }) => {
  const positionLowerCase = position.toLowerCase();

  // Get position metadata (now async)
  const { difficultyText, positionInstruction, positionLevel } =
    await getPositionMetadata(positionLowerCase);

  // Call the AI question generation service
  const { questions } = await generateQuizQuestions({
    topic,
    language,
    position: positionLowerCase,
    difficultyText,
    positionInstruction,
    // You can adjust these parameters based on your needs
    temperature: 0.7,
    maxOutputTokens: 8192,
  });

  return questions;
};

/**
 * Prepares questions with metadata for storage
 * @param {Array} questions - Raw questions from AI
 * @param {Object} metadata - Metadata to add to questions
 * @returns {Array} - Questions with added metadata
 */
const prepareQuestionsWithMetadata = (
  questions,
  { topic, topic_id, language, language_id, position, position_id, positionLevel }
) => {
  const timestamp = new Date();
  const positionText = formatPositionForDisplay(position);

  // Convert IDs to ObjectId if they are valid
  let convertedTopicId = topic_id;
  let convertedLanguageId = language_id;
  let convertedPositionId = position_id;

  try {
    // Convert topic_id to ObjectId if it's valid
    if (topic_id) {
      if (ObjectId.isValid(topic_id)) {
        convertedTopicId = new ObjectId(topic_id);
      } else {
        logger.warn(`Invalid topic_id format: ${topic_id}. Using as-is.`);
      }
    }

    // Convert language_id to ObjectId if it's valid
    if (language_id) {
      if (ObjectId.isValid(language_id)) {
        convertedLanguageId = new ObjectId(language_id);
      } else {
        logger.warn(`Invalid language_id format: ${language_id}. Using as-is.`);
      }
    }

    // Convert position_id to ObjectId if it's valid
    if (position_id) {
      if (ObjectId.isValid(position_id)) {
        convertedPositionId = new ObjectId(position_id);
      } else {
        logger.warn(`Invalid position_id format: ${position_id}. Using as-is.`);
      }
    }
  } catch (error) {
    logger.error('Error converting IDs to ObjectId:', error);
    // Continue with original values if conversion fails
  }

  return questions.map(question => ({
    ...question,
    topic,
    topic_id: convertedTopicId,
    language,
    language_id: convertedLanguageId,
    position: positionText,
    position_id: convertedPositionId,
    positionLevel,
    createdAt: timestamp,
  }));
};

/**
 * Stores questions in the database
 * @param {Array} questions - Questions to store
 * @returns {Promise<Object>} - Database insertion result
 */
const storeQuestions = async questions => {
  try {
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      logger.warn('No questions to store');
      return { acknowledged: true, insertedCount: 0 };
    }

    return await insertMany('questions', questions);
  } catch (error) {
    logger.error('Error storing questions:', error);
    throw error;
  }
};

/**
 * Complete process to generate and store questions
 * @param {Object} params - Parameters for question generation
 * @returns {Promise<Array>} - Generated and stored questions with metadata
 */
const generateAndStoreQuestions = async params => {
  try {
    const {
      topic,
      topic_id = null,
      language,
      language_id = null,
      position,
      position_id = null,
    } = params;

    // Validate required parameters
    if (!topic || !language || !position) {
      throw new Error('Missing required parameters: topic, language, and position are required');
    }

    // Get position metadata (now async)
    const { positionLevel } = await getPositionMetadata(position.toLowerCase());

    // Generate questions
    const questions = await generateQuestions(params);

    if (!questions || questions.length === 0) {
      logger.warn('No questions were generated');
      return [];
    }

    // Prepare questions with metadata
    const questionsWithMetadata = prepareQuestionsWithMetadata(questions, {
      topic,
      topic_id,
      language,
      language_id,
      position,
      position_id,
      positionLevel,
    });

    // Store questions
    await storeQuestions(questionsWithMetadata);
    logger.info(`Successfully stored ${questionsWithMetadata.length} questions`);

    return questionsWithMetadata;
  } catch (error) {
    logger.error('Error in generateAndStoreQuestions:', error);
    throw error;
  }
};

module.exports = {
  generateQuestions,
  prepareQuestionsWithMetadata,
  storeQuestions,
  generateAndStoreQuestions,
};
