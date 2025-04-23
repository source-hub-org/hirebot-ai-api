/**
 * @fileoverview Service for generating quiz questions using Gemini AI.
 * This module handles loading prompt formats, reading existing questions,
 * constructing prompts, and saving generated questions.
 */

const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');
const { generateContent } = require('@service/gemini/geminiClient');
const logger = require('@utils/logger');

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
 * @param {Object} [options] - Additional options for customizing the prompt
 * @param {string} [options.topic] - The topic for which questions should be generated
 * @param {string} [options.language] - The programming language for the questions
 * @param {string} [options.position] - The target position level
 * @param {number} [options.difficulty] - Difficulty level (1-6)
 * @returns {string} The constructed prompt
 */
function constructPrompt(questionFormat, existingQuestions, options = {}) {
  // Map numeric difficulty to text description
  let difficultyText = 'various difficulty levels';
  if (options.difficulty) {
    const difficultyMap = {
      1: 'Intern level (very basic concepts)',
      2: 'Fresher level (fundamental concepts)',
      3: 'Junior Developer level (basic practical concepts)',
      4: 'Middle Developer level (intermediate concepts)',
      5: 'Senior Developer level (advanced concepts)',
      6: 'Master/Expert level (expert concepts and system design)',
    };
    difficultyText = difficultyMap[options.difficulty] || difficultyText;
  }

  // Build topic and language specific instructions
  let topicInstruction = 'various software development topics';
  if (options.topic) {
    topicInstruction = `the topic of "${options.topic}"`;
  }

  let languageInstruction = '';
  if (options.language) {
    languageInstruction = `Focus on the "${options.language}" programming language. `;
  }

  let positionInstruction = '';
  if (options.position) {
    const positionMap = {
      1: 'Intern',
      2: 'Fresher',
      3: 'Junior Developer',
      4: 'Middle Developer',
      5: 'Senior Developer',
      6: 'Master/Expert Developer',
    };
    const positionText = positionMap[options.position] || 'Developer';
    positionInstruction = `Target these questions for a "${positionText}" position. `;
  }

  const prompt = `
Generate 10 unique multiple-choice technical interview questions for software developers on ${topicInstruction}.
${languageInstruction}${positionInstruction}The questions should be at ${difficultyText}.

IMPORTANT REQUIREMENTS:
1. Follow EXACTLY this JSON format: ${JSON.stringify(questionFormat.schema)}
2. Each question must have EXACTLY 4 options
3. The correctAnswer must be an integer between 0-3 (index of the correct option)
4. Include a detailed explanation for each correct answer
5. Assign an appropriate difficulty level (easy, medium, or hard) based on the overall difficulty requested
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
    // Check if the content is wrapped in a code block
    let contentToProcess = content;
    
    // Remove markdown code block if present
    if (content.includes('```json')) {
      logger.info('Detected JSON code block in response, extracting JSON content');
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        contentToProcess = jsonMatch[1].trim();
        logger.info('Successfully extracted JSON from code block');
      } else {
        logger.warn('Failed to extract JSON from code block, using original content');
      }
    }
    
    // Try to parse the content as JSON
    logger.info('Parsing content as JSON');
    const parsedContent = JSON.parse(contentToProcess);
    logger.info('Successfully parsed JSON content');

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
 * @param {string} [options.topic] - The topic for which questions should be generated
 * @param {string} [options.language] - The programming language for the questions
 * @param {string} [options.position] - The target position level
 * @param {number} [options.difficulty] - Difficulty level (1-6)
 * @returns {Promise<{filePath: string, questions: Object[]}>} The path to the saved file and the generated questions
 * @throws {Error} If generation fails at any step
 */
async function generateQuizQuestions(existingQuestionsPath, options = {}) {
  try {
    logger.info('Starting quiz question generation process');
    logger.info(
      `Options: Topic=${options.topic}, Language=${options.language}, Position=${options.position}, Difficulty=${options.difficulty}`
    );

    // Load question format and existing questions
    logger.info('Loading question format and existing questions');
    const questionFormat = await loadQuestionFormat();
    const existingQuestions = await loadExistingQuestions(existingQuestionsPath);
    logger.info(`Loaded ${existingQuestions.length} existing questions`);

    // Construct the prompt with all options
    logger.info('Constructing prompt for Gemini AI');
    const prompt = constructPrompt(questionFormat, existingQuestions, {
      topic: options.topic,
      language: options.language,
      position: options.position,
      difficulty: options.difficulty,
    });
    logger.info('Prompt constructed successfully');

    // Generate content using Gemini AI - all defaults come from environment variables
    logger.info('Sending request to Gemini AI');
    let generatedContent;
    
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
        difficulty: options.difficulty,
        temperature: options.temperature,
        maxOutputTokens: options.maxOutputTokens,
        model: options.model
      }
    };
    
    // Log the prompt to individual files
    await logger.logToFile('gemini-prompts.log', `REQUEST ID: ${requestId} - PROMPT:`, prompt);
    
    // Log to the combined conversation log file
    await logger.logToFile('gemini-conversations.log', `REQUEST ID: ${requestId} - METADATA:`, metadata);
    await logger.logToFile('gemini-conversations.log', `REQUEST ID: ${requestId} - PROMPT:`, prompt);
    
    try {
      generatedContent = await generateContent(prompt, {
        temperature: options.temperature,
        maxOutputTokens: options.maxOutputTokens,
        model: options.model,
        maxRetries: 3,
        retryDelay: 1000,
      });
      logger.info('Successfully received response from Gemini AI');
      
      // Log the response to individual files
      await logger.logToFile('gemini-responses.log', `REQUEST ID: ${requestId} - RESPONSE:`, generatedContent);
      
      // Log to the combined conversation log file
      await logger.logToFile('gemini-conversations.log', `REQUEST ID: ${requestId} - RESPONSE:`, generatedContent);
    } catch (error) {
      logger.error('Failed to generate content from Gemini AI:', error);
      
      // Log the error to individual files
      await logger.logToFile('gemini-errors.log', `REQUEST ID: ${requestId} - ERROR:`, error.message);
      
      // Log to the combined conversation log file
      await logger.logToFile('gemini-conversations.log', `REQUEST ID: ${requestId} - ERROR:`, error.message);
      
      throw new Error(`Failed to generate content from Gemini API: ${error.message}`);
    }

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
    logger.info('Saving generated questions');
    const filePath = await saveGeneratedQuestions(questions);
    logger.info(`Questions saved to ${filePath}`);

    return {
      filePath,
      questions,
    };
  } catch (error) {
    logger.error('Quiz question generation failed:', error);
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
