/**
 * @fileoverview File operations for quiz question generation.
 * This module handles loading question formats, reading existing questions,
 * and saving generated questions.
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('../../../utils/logger');
const { searchQuestions } = require('../../questionSearchService');

/**
 * Reads and parses the question format JSON file
 *
 * @returns {Promise<Object>} The parsed question format configuration
 * @throws {Error} If the file cannot be read or parsed
 */
async function loadQuestionFormat() {
  try {
    const formatPath = path.resolve(process.cwd(), 'src/config/question-format.json');
    const formatData = await fs.readFile(formatPath, 'utf8');
    return JSON.parse(formatData);
  } catch (error) {
    throw new Error(`Failed to load question format: ${error.message}`);
  }
}

/**
 * Reads existing questions from a file to avoid duplicates
 *
 * @param {string} existingQuestionsPath - Path to the file containing existing questions
 * @returns {Promise<string[]>} Array of existing questions
 * @throws {Error} If the file cannot be read
 */
async function loadExistingQuestions(existingQuestionsPath, options = {}) {
  try {
    // Check if file exists, if not return empty array
    try {
      const result = await searchQuestions({
        ...options,
        sort_by: 'createdAt',
        sort_direction: 'asc',
        page: 1,
        page_size: 1000,
        mode: 'minimalist',
      });
      return result?.questions?.map(q => q.question);
    } catch (error) {
      return [];
    }
  } catch (error) {
    throw new Error(`Failed to load existing questions: ${error.message}`);
  }
}

/**
 * Ensures the temporary directory exists for saving generated questions
 *
 * @returns {Promise<string>} The path to the temporary directory
 * @throws {Error} If the directory cannot be created
 */
async function ensureTmpDirectoryExists() {
  try {
    const tmpDir = process.env.GEMINI_TMP_DIR || '/tmp';
    try {
      await fs.access(tmpDir);
    } catch (error) {
      await fs.mkdir(tmpDir, { recursive: true });
    }
    return tmpDir;
  } catch (error) {
    throw new Error(`Failed to ensure temporary directory exists: ${error.message}`);
  }
}

/**
 * Saves generated questions to a JSON file in the temporary directory
 *
 * @param {Object[]} questions - The generated questions
 * @returns {Promise<string>} The path to the saved file
 * @throws {Error} If the file cannot be saved
 */
async function saveGeneratedQuestions(questions) {
  try {
    const tmpDir = await ensureTmpDirectoryExists();

    const timestamp = Date.now();
    const filePath = path.join(tmpDir, `${timestamp}.json`);

    await fs.writeFile(filePath, JSON.stringify(questions, null, 2), 'utf8');

    return filePath;
  } catch (error) {
    throw new Error(`Failed to save generated questions: ${error.message}`);
  }
}

/**
 * Logs content to a file for debugging purposes
 *
 * @param {string} content - The content to log
 * @returns {void}
 */
function logContentToFile(content) {
  try {
    // Use synchronous file writing for logging in this non-async function
    const fs = require('fs');
    const path = require('path');
    const logDir = path.resolve(process.cwd(), 'logs');
    const logPath = path.join(logDir, 'gemini-content-debug.log');
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] FULL CONTENT:\n${content}\n\n`;

    // Append to the log file
    fs.appendFileSync(logPath, logEntry, 'utf8');
  } catch (logError) {
    logger.warn('Failed to log full content for debugging:', logError.message);
  }
}

module.exports = {
  loadQuestionFormat,
  loadExistingQuestions,
  saveGeneratedQuestions,
  ensureTmpDirectoryExists,
  logContentToFile,
};
