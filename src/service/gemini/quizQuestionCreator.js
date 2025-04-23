/**
 * @fileoverview Service for generating quiz questions using Gemini AI.
 * This module handles loading prompt formats, reading existing questions,
 * constructing prompts, and saving generated questions.
 */

const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');
const { generateContent } = require('@service/gemini/geminiClient');

// Load environment variables
dotenv.config();

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
async function loadExistingQuestions(existingQuestionsPath) {
  try {
    // Check if file exists, if not return empty array
    try {
      await fs.access(existingQuestionsPath);
    } catch (error) {
      return [];
    }

    const questionsData = await fs.readFile(existingQuestionsPath, 'utf8');
    // Split by lines and filter out empty lines
    return questionsData.split('\n').filter(line => line.trim().length > 0);
  } catch (error) {
    throw new Error(`Failed to load existing questions: ${error.message}`);
  }
}

/**
 * Constructs a prompt for Gemini AI to generate quiz questions
 *
 * @param {Object} questionFormat - The question format configuration
 * @param {string[]} existingQuestions - Array of existing questions to avoid duplicates
 * @returns {string} The constructed prompt
 */
function constructPrompt(questionFormat, existingQuestions) {
  const prompt = `
Generate 10 unique multiple-choice technical interview questions for software developers.

IMPORTANT REQUIREMENTS:
1. Follow EXACTLY this JSON format: ${JSON.stringify(questionFormat.schema)}
2. Each question must have EXACTLY 4 options
3. The correctAnswer must be an integer between 0-3 (index of the correct option)
4. Include a detailed explanation for each correct answer
5. Assign an appropriate difficulty level (easy, medium, or hard)
6. Categorize each question appropriately (e.g., Algorithms, JavaScript, System Design, etc.)
7. DO NOT generate any of these existing questions:
${existingQuestions.map(q => `- ${q}`).join('\n')}

8. Return ONLY valid JSON that matches the schema, with no additional text or explanations.

Example of a properly formatted question:
${JSON.stringify(questionFormat.example, null, 2)}

Generate 10 questions following this format exactly.
`;

  return prompt;
}

/**
 * Validates that the generated content is valid JSON and matches the expected schema
 *
 * @param {string} content - The generated content from Gemini AI
 * @returns {Object[]} The parsed questions array
 * @throws {Error} If the content is invalid or doesn't match the schema
 */
function validateGeneratedContent(content) {
  try {
    // Try to parse the content as JSON
    const parsedContent = JSON.parse(content);

    // Validate that it's an array
    if (!Array.isArray(parsedContent)) {
      throw new Error('Generated content is not an array');
    }

    // Validate each question has the required fields
    parsedContent.forEach((question, index) => {
      if (!question.question) {
        throw new Error(`Question ${index + 1} is missing the 'question' field`);
      }
      if (!Array.isArray(question.options) || question.options.length !== 4) {
        throw new Error(`Question ${index + 1} must have exactly 4 options`);
      }
      if (
        typeof question.correctAnswer !== 'number' ||
        question.correctAnswer < 0 ||
        question.correctAnswer > 3
      ) {
        throw new Error(`Question ${index + 1} has an invalid 'correctAnswer' (must be 0-3)`);
      }
      if (!question.explanation) {
        throw new Error(`Question ${index + 1} is missing the 'explanation' field`);
      }
      if (!question.difficulty || !['easy', 'medium', 'hard'].includes(question.difficulty)) {
        throw new Error(
          `Question ${index + 1} has an invalid 'difficulty' (must be easy, medium, or hard)`
        );
      }
      if (!question.category) {
        throw new Error(`Question ${index + 1} is missing the 'category' field`);
      }
    });

    return parsedContent;
  } catch (error) {
    throw new Error(`Invalid generated content: ${error.message}`);
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
 * Generates quiz questions using Gemini AI
 *
 * @param {string} existingQuestionsPath - Path to the file containing existing questions
 * @param {Object} options - Additional options for generation
 * @param {number} [options.temperature] - Controls randomness (defaults to env var GEMINI_TEMPERATURE)
 * @param {number} [options.maxOutputTokens] - Maximum tokens in response (defaults to env var GEMINI_MAX_OUTPUT_TOKENS)
 * @param {string} [options.model] - The model to use (defaults to env var GEMINI_MODEL)
 * @returns {Promise<{filePath: string, questions: Object[]}>} The path to the saved file and the generated questions
 * @throws {Error} If generation fails at any step
 */
async function generateQuizQuestions(existingQuestionsPath, options = {}) {
  try {
    // Load question format and existing questions
    const questionFormat = await loadQuestionFormat();
    const existingQuestions = await loadExistingQuestions(existingQuestionsPath);

    // Construct the prompt
    const prompt = constructPrompt(questionFormat, existingQuestions);

    // Generate content using Gemini AI - all defaults come from environment variables
    const generatedContent = await generateContent(prompt, {
      temperature: options.temperature,
      maxOutputTokens: options.maxOutputTokens,
      model: options.model,
    });

    // Validate the generated content
    const questions = validateGeneratedContent(generatedContent);

    // Save the generated questions
    const filePath = await saveGeneratedQuestions(questions);

    return {
      filePath,
      questions,
    };
  } catch (error) {
    throw new Error(`Failed to generate quiz questions: ${error.message}`);
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
};
