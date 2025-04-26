/**
 * Question Generation Service
 * @module service/questionGenerationService
 */

const { generateQuizQuestions } = require('./gemini/quizQuestionCreator');
const { insertMany } = require('../repository/baseRepository');
const { getPositionMetadata, formatPositionForDisplay } = require('../utils/positionUtils');
const logger = require('../utils/logger');

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

  // Get position metadata
  const { difficultyText, positionInstruction, positionLevel } =
    getPositionMetadata(positionLowerCase);

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
const prepareQuestionsWithMetadata = (questions, { topic, language, position, positionLevel }) => {
  const timestamp = new Date();
  const positionText = formatPositionForDisplay(position);

  return questions.map(question => ({
    ...question,
    topic,
    language,
    position: positionText,
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
  return await insertMany('questions', questions);
};

/**
 * Complete process to generate and store questions
 * @param {Object} params - Parameters for question generation
 * @returns {Promise<Array>} - Generated and stored questions with metadata
 */
const generateAndStoreQuestions = async params => {
  const { topic, language, position } = params;

  // Get position metadata
  const { positionLevel } = getPositionMetadata(position.toLowerCase());

  // Generate questions
  const questions = await generateQuestions(params);

  // Prepare questions with metadata
  const questionsWithMetadata = prepareQuestionsWithMetadata(questions, {
    topic,
    language,
    position,
    positionLevel,
  });

  // Store questions
  await storeQuestions(questionsWithMetadata);

  return questionsWithMetadata;
};

module.exports = {
  generateQuestions,
  prepareQuestionsWithMetadata,
  storeQuestions,
  generateAndStoreQuestions,
};
