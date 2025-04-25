/**
 * @fileoverview Main entry point for quiz question generation.
 * This module exports the public API for generating quiz questions.
 */

const dotenv = require('dotenv');
const { generateContent } = require('../geminiClient');
const logger = require('../../../utils/logger');
const {
  loadQuestionFormat,
  loadExistingQuestions,
  saveGeneratedQuestions,
} = require('./fileOperations');
const { constructPrompt } = require('./promptBuilder');
const { validateGeneratedContent } = require('./contentValidator');

// Re-export all modules for testing purposes
const extractors = require('./extractors');
const parsers = require('./parsers');
const validators = require('./validators');

// Load environment variables
dotenv.config();

/**
 * Generates quiz questions using Gemini AI
 *
 * @param {string} existingQuestionsPath - Path to the file containing existing questions
 * @param {Object} options - Additional options for generation
 * @param {number} [options.temperature] - Controls randomness (defaults to env var GEMINI_TEMPERATURE)
 * @param {number} [options.maxOutputTokens] - Maximum tokens in response (defaults to env var GEMINI_MAX_OUTPUT_TOKENS)
 * @param {string} [options.model] - The model to use (defaults to env var GEMINI_MODEL)
 * @param {string} [options.topic] - The topic for which questions should be generated
 * @param {string} [options.language] - The programming language for the questions
 * @param {string} [options.position] - The target position level
 * @param {string} [options.difficultyText] - Description of the difficulty level
 * @param {string} [options.positionInstruction] - Instruction related to the position
 * @returns {Promise<{filePath: string, questions: Object[]}>} The path to the saved file and the generated questions
 * @throws {Error} If generation fails at any step
 */
async function generateQuizQuestions(existingQuestionsPath, options = {}) {
  try {
    logger.info('Starting quiz question generation process');
    logger.info(
      `Options: Topic=${options.topic}, Language=${options.language}, Position=${options.position}, DifficultyText=${options.difficultyText}, PositionInstruction=${options.positionInstruction}`
    );

    // Load question format and existing questions
    logger.info('Loading question format and existing questions');
    const questionFormat = await loadQuestionFormat();
    const existingQuestions = await loadExistingQuestions(existingQuestionsPath, options);
    logger.info(`Loaded ${existingQuestions.length} existing questions`);

    // Construct the prompt with all options
    logger.info('Constructing prompt for Gemini AI');
    const prompt = constructPrompt(questionFormat, existingQuestions, {
      topic: options.topic,
      language: options.language,
      position: options.position,
      difficultyText: options.difficultyText,
      positionInstruction: options.positionInstruction,
    });
    logger.info('Prompt constructed successfully');

    // Generate content using Gemini AI
    const generatedContent = await sendRequestToGemini(prompt, options);

    // Validate the generated content
    logger.info('Validating generated content');
    let questions;
    try {
      questions = validateGeneratedContent(generatedContent);
      logger.info(`Successfully validated ${questions.length} questions`);
    } catch (error) {
      logger.error('Content validation failed:', error);
      // Log a portion of the content for debugging
      logger.error('Content preview:', generatedContent.substring(0, 500));
      throw new Error(
        `Failed to validate generated content: ${error.message}. Content: ${generatedContent.substring(0, 200)}...`
      );
    }

    // Save the generated questions
    // logger.info('Saving generated questions');
    // const filePath = await saveGeneratedQuestions(questions);
    // logger.info(`Questions saved to ${filePath}`);

    return {
      //filePath,
      questions,
    };
  } catch (error) {
    logger.error('Quiz question generation failed:', error);
    throw new Error(`Failed to generate quiz questions: ${error.message}`);
  }
}

/**
 * Sends a request to Gemini AI and handles logging
 *
 * @param {string} prompt - The prompt to send to Gemini
 * @param {Object} options - Options for the request
 * @returns {Promise<string>} The generated content
 * @throws {Error} If the request fails
 */
async function sendRequestToGemini(prompt, options) {
  logger.info('Sending request to Gemini AI');

  // Create a unique request ID for tracking
  const requestId = Date.now().toString();

  // Create metadata for the request
  const metadata = {
    timestamp: new Date().toISOString(),
    requestId,
    options: {
      topic: options.topic,
      language: options.language,
      position: options.position,
      difficultyText: options.difficultyText,
      positionInstruction: options.positionInstruction,
      temperature: options.temperature,
      maxOutputTokens: options.maxOutputTokens,
      model: options.model,
    },
  };

  // Log the prompt to individual files
  await logger.logToFile('gemini-prompts.log', `REQUEST ID: ${requestId} - PROMPT:`, prompt);

  // Log to the combined conversation log file
  await logger.logToFile(
    'gemini-conversations.log',
    `REQUEST ID: ${requestId} - METADATA:`,
    metadata
  );
  await logger.logToFile('gemini-conversations.log', `REQUEST ID: ${requestId} - PROMPT:`, prompt);

  try {
    const generatedContent = await generateContent(prompt, {
      temperature: options.temperature,
      maxOutputTokens: options.maxOutputTokens,
      model: options.model,
      maxRetries: 3,
      retryDelay: 1000,
    });
    logger.info('Successfully received response from Gemini AI');

    // Log the response to individual files
    await logger.logToFile(
      'gemini-responses.log',
      `REQUEST ID: ${requestId} - RESPONSE:`,
      generatedContent
    );

    // Log to the combined conversation log file
    await logger.logToFile(
      'gemini-conversations.log',
      `REQUEST ID: ${requestId} - RESPONSE:`,
      generatedContent
    );

    return generatedContent;
  } catch (error) {
    logger.error('Failed to generate content from Gemini AI:', error);

    // Log the error to individual files
    await logger.logToFile('gemini-errors.log', `REQUEST ID: ${requestId} - ERROR:`, error.message);

    // Log to the combined conversation log file
    await logger.logToFile(
      'gemini-conversations.log',
      `REQUEST ID: ${requestId} - ERROR:`,
      error.message
    );

    throw new Error(`Failed to generate content from Gemini API: ${error.message}`);
  }
}

module.exports = {
  generateQuizQuestions,
  // Export these for testing purposes
  _loadQuestionFormat: loadQuestionFormat,
  _loadExistingQuestions: loadExistingQuestions,
  _constructPrompt: constructPrompt,
  _validateGeneratedContent: validateGeneratedContent,
  _saveGeneratedQuestions: saveGeneratedQuestions,
  // Export the modules for advanced usage and testing
  extractors,
  parsers,
  validators,
};
