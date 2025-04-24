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
/**
 * Default prompt template to use if environment variable is not set
 */
const DEFAULT_PROMPT_TEMPLATE = `
Generate 10 unique multiple-choice technical interview questions for software developers on {topic}.
{language}{positionInstruction}The questions should demonstrate {difficultyText}.`;

/**
 * Constructs a prompt for Gemini AI to generate quiz questions
 *
 * @param {Object} questionFormat - The question format configuration
 * @param {string[]} existingQuestions - Array of existing questions to avoid duplicates
 * @param {Object} [options] - Additional options for customizing the prompt
 * @param {string} [options.topic] - The topic for which questions should be generated
 * @param {string} [options.language] - The programming language for the questions
 * @param {string} [options.position] - The position level (intern, junior, senior, etc.)
 * @param {string} [options.difficultyText] - Description of the difficulty level
 * @param {string} [options.positionInstruction] - Instruction related to the position
 * @returns {string} The constructed prompt
 */
function constructPrompt(questionFormat, existingQuestions, options = {}) {
  // Get topic instruction
  const topicInstruction = options.topic
    ? `the topic of "${options.topic}"`
    : 'various software development topics';

  // Get language instruction
  const languageInstruction = options.language
    ? `Focus on the "${options.language}" programming language. `
    : '';

  // Get difficulty text and position instruction
  const difficultyText = options.difficultyText || 'various difficulty levels';
  const positionInstruction = options.positionInstruction ? `${options.positionInstruction}. ` : '';

  // Format existing questions as bullet points
  const formattedExistingQuestions = existingQuestions.map(q => `- ${q}`).join('\n');

  // Get the prompt template from environment variable or use default
  const promptTemplate = process.env.AI_QUIZ_PROMPT_TEMPLATE || DEFAULT_PROMPT_TEMPLATE;

  // Replace placeholders in the template
  const prompt = promptTemplate
    .replace('{topic}', topicInstruction)
    .replace('{language}', languageInstruction)
    .replace('{difficultyText}', difficultyText)
    .replace('{positionInstruction}', positionInstruction)
    .replace('{schema}', JSON.stringify(questionFormat.schema))
    .replace('{existingQuestions}', formattedExistingQuestions)
    .replace('{example}', JSON.stringify(questionFormat.example, null, 2));

  return prompt;
}

/**
 * Validates that the generated content is valid JSON and matches the expected schema
 *
 * @param {string} content - The generated content from Gemini AI
 * @param {boolean} [strictMode=false] - If true, throw errors instead of trying to fix issues (used for tests)
 * @returns {Object[]} The parsed questions array
 * @throws {Error} If the content is invalid or doesn't match the schema
 */
function validateGeneratedContent(content, strictMode = false) {
  try {
    if (!content || typeof content !== 'string') {
      throw new Error('Content is empty or not a string');
    }

    // Log the original content for debugging (truncated)
    logger.info('Original content (first 200 chars):', content.substring(0, 200));

    // Log the full content to a separate log file for detailed debugging
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

    // Step 1: Clean the response string to extract JSON
    let contentToProcess = content.trim();
    let originalContent = contentToProcess;

    // Step 2: Handle various markdown code block formats
    // Check for ```json, ``` or other code block markers
    if (contentToProcess.includes('```')) {
      logger.info('Detected code block in response, attempting to extract JSON content');

      // Try to match JSON code block with language specifier
      let jsonMatch = contentToProcess.match(/```(?:json|javascript|js)\s*([\s\S]*?)\s*```/);

      // If that fails, try to match any code block
      if (!jsonMatch) {
        jsonMatch = contentToProcess.match(/```\s*([\s\S]*?)\s*```/);
      }

      if (jsonMatch && jsonMatch[1]) {
        contentToProcess = jsonMatch[1].trim();
        logger.info('Successfully extracted content from code block');
      } else {
        logger.warn(
          'Failed to extract content from code block using regex, trying alternative approach'
        );

        // Alternative approach: split by ``` and take the middle part if it exists
        const parts = contentToProcess.split('```');
        if (parts.length >= 3) {
          // If we have at least 3 parts, the middle part is our content
          contentToProcess = parts[1].trim();
          // Remove potential language identifier from the first line
          const lines = contentToProcess.split('\n');
          if (
            lines[0] &&
            (lines[0].trim() === 'json' ||
              lines[0].trim() === 'javascript' ||
              lines[0].trim() === 'js')
          ) {
            lines.shift();
          }
          contentToProcess = lines.join('\n').trim();
          logger.info('Extracted content using split method');
        }
      }
    }

    // Step 3: Look for array brackets if we still don't have valid JSON
    // This helps when the AI includes explanatory text before/after the JSON
    if (
      !contentToProcess.startsWith('[') &&
      contentToProcess.includes('[') &&
      contentToProcess.includes(']')
    ) {
      logger.info('Content does not start with [, attempting to extract array');
      const arrayStartIndex = contentToProcess.indexOf('[');
      const arrayEndIndex = contentToProcess.lastIndexOf(']') + 1;

      if (arrayStartIndex < arrayEndIndex) {
        contentToProcess = contentToProcess.substring(arrayStartIndex, arrayEndIndex);
        logger.info('Extracted array portion of content');
      }
    }

    // Log the cleaned content
    logger.info('Cleaned content (first 200 chars):', contentToProcess.substring(0, 200));

    // Step 4: Try to parse the content as JSON
    let parsedContent;
    try {
      parsedContent = JSON.parse(contentToProcess);
      logger.info('Successfully parsed JSON content');
    } catch (parseError) {
      logger.error('JSON parsing failed:', parseError.message);
      logger.error('Cleaned content that failed to parse:', contentToProcess);

      // If parsing fails, try one more approach - look for valid JSON by finding matching brackets
      logger.info('Attempting to find valid JSON by bracket matching');

      // This is a simple approach to find the first complete JSON object or array
      let bracketCount = 0;
      let inQuotes = false;
      let escapeNext = false;
      let startPos = -1;
      let endPos = -1;

      for (let i = 0; i < originalContent.length; i++) {
        const char = originalContent[i];

        if (escapeNext) {
          escapeNext = false;
          continue;
        }

        if (char === '\\') {
          escapeNext = true;
          continue;
        }

        if (char === '"' && !escapeNext) {
          inQuotes = !inQuotes;
          continue;
        }

        if (inQuotes) continue;

        if (char === '[' || char === '{') {
          if (bracketCount === 0) {
            startPos = i;
          }
          bracketCount++;
        } else if (char === ']' || char === '}') {
          bracketCount--;
          if (bracketCount === 0) {
            endPos = i + 1;
            break;
          }
        }
      }

      if (startPos !== -1 && endPos !== -1) {
        const potentialJson = originalContent.substring(startPos, endPos);
        logger.info('Found potential JSON by bracket matching:', potentialJson.substring(0, 100));

        try {
          parsedContent = JSON.parse(potentialJson);
          logger.info('Successfully parsed JSON using bracket matching approach');
        } catch (secondParseError) {
          logger.error('Second parsing attempt failed:', secondParseError.message);
          // Re-throw the original error since both attempts failed
          throw parseError;
        }
      } else {
        // If we couldn't find matching brackets, re-throw the original error
        throw parseError;
      }
    }

    // Step 5: Validate that it's an array
    if (!Array.isArray(parsedContent)) {
      logger.error('Parsed content is not an array:', typeof parsedContent);

      // If it's an object with a questions property that is an array, use that
      if (
        parsedContent &&
        typeof parsedContent === 'object' &&
        Array.isArray(parsedContent.questions)
      ) {
        logger.info('Found questions array property in parsed content');
        parsedContent = parsedContent.questions;
      } else if (
        parsedContent &&
        typeof parsedContent === 'object' &&
        parsedContent.question &&
        !strictMode
      ) {
        // If it's a single question object, wrap it in an array (only in non-strict mode)
        logger.info('Found single question object, wrapping in array');
        parsedContent = [parsedContent];
      } else if (
        parsedContent &&
        typeof parsedContent === 'object' &&
        Array.isArray(parsedContent.items)
      ) {
        // Check if items is an array of objects with question property
        if (
          parsedContent.items.length > 0 &&
          typeof parsedContent.items[0] === 'object' &&
          parsedContent.items[0].question
        ) {
          // Handle case where the AI returns an object with both schema and items array
          logger.info('Found items array property with questions in parsed content');
          parsedContent = parsedContent.items;
        }
      } else if (
        parsedContent &&
        typeof parsedContent === 'object' &&
        parsedContent.type === 'array' &&
        typeof parsedContent.items === 'object'
      ) {
        // This is likely a schema definition
        logger.info('Found schema definition, looking for actual questions');

        // Look for an array property that might contain the actual questions
        for (const key in parsedContent) {
          if (
            key !== 'type' &&
            Array.isArray(parsedContent[key]) &&
            parsedContent[key].length > 0 &&
            typeof parsedContent[key][0] === 'object' &&
            parsedContent[key][0].question
          ) {
            logger.info(`Found questions in property "${key}"`);
            parsedContent = parsedContent[key];
            break;
          }
        }

        // Special case: if we have both a schema definition and an "items" array with actual questions
        // This matches the pattern we're seeing in the logs
        if (
          Array.isArray(parsedContent.items) &&
          parsedContent.items.length > 0 &&
          typeof parsedContent.items[0] === 'object' &&
          parsedContent.items[0].question
        ) {
          logger.info('Found questions in items array (special case)');
          parsedContent = parsedContent.items;
        }
      } else {
        throw new Error('Generated content is not an array or valid questions object');
      }
    }

    // Step 6: Validate each question has the required fields
    logger.info(`Validating ${parsedContent.length} questions`);
    parsedContent.forEach((question, index) => {
      if (!question.question) {
        throw new Error(`Question ${index + 1} is missing the 'question' field`);
      }

      if (!Array.isArray(question.options)) {
        throw new Error(`Question ${index + 1} has invalid or missing 'options' array`);
      }

      // Ensure we have exactly 4 options
      if (question.options.length !== 4) {
        if (strictMode) {
          throw new Error(`Question ${index + 1} must have exactly 4 options`);
        } else {
          logger.warn(`Question ${index + 1} has ${question.options.length} options instead of 4`);

          // If we have fewer than 4 options, add placeholder options
          while (question.options.length < 4) {
            question.options.push(`Option ${question.options.length + 1} (placeholder)`);
          }

          // If we have more than 4 options, truncate
          if (question.options.length > 4) {
            question.options = question.options.slice(0, 4);
          }
        }
      }

      // Validate correctAnswer is a number between 0-3
      if (
        typeof question.correctAnswer !== 'number' ||
        question.correctAnswer < 0 ||
        question.correctAnswer > 3 ||
        !Number.isInteger(question.correctAnswer)
      ) {
        if (strictMode) {
          throw new Error(`Question ${index + 1} has an invalid 'correctAnswer' (must be 0-3)`);
        } else {
          logger.warn(
            `Question ${index + 1} has invalid 'correctAnswer': ${question.correctAnswer}`
          );

          // Try to convert string to number if possible
          if (typeof question.correctAnswer === 'string') {
            const parsed = parseInt(question.correctAnswer, 10);
            if (!isNaN(parsed) && parsed >= 0 && parsed <= 3) {
              question.correctAnswer = parsed;
              logger.info(`Converted string correctAnswer to number: ${parsed}`);
            } else {
              // Default to first option
              question.correctAnswer = 0;
              logger.warn(`Set default correctAnswer to 0 for question ${index + 1}`);
            }
          } else {
            // Default to first option
            question.correctAnswer = 0;
            logger.warn(`Set default correctAnswer to 0 for question ${index + 1}`);
          }
        }
      }

      // Ensure explanation exists
      if (!question.explanation) {
        if (strictMode) {
          throw new Error(`Question ${index + 1} is missing the 'explanation' field`);
        } else {
          logger.warn(`Question ${index + 1} is missing the 'explanation' field`);
          question.explanation = `The correct answer is option ${question.correctAnswer + 1}.`;
        }
      }

      // Validate difficulty
      if (
        !question.difficulty ||
        !['easy', 'medium', 'hard'].includes(question.difficulty.toLowerCase())
      ) {
        if (strictMode) {
          throw new Error(
            `Question ${index + 1} has an invalid 'difficulty' (must be easy, medium, or hard)`
          );
        } else {
          logger.warn(`Question ${index + 1} has invalid 'difficulty': ${question.difficulty}`);
          question.difficulty = 'medium'; // Default to medium
        }
      }

      // Ensure difficulty is lowercase
      question.difficulty = question.difficulty.toLowerCase();

      // Ensure category exists
      if (!question.category) {
        if (strictMode) {
          throw new Error(`Question ${index + 1} is missing the 'category' field`);
        } else {
          logger.warn(`Question ${index + 1} is missing the 'category' field`);
          question.category = 'General';
        }
      }
    });

    logger.info(`Successfully validated ${parsedContent.length} questions`);
    return parsedContent;
  } catch (error) {
    // Log the full error with stack trace
    logger.error('Content validation failed with error:', error);

    // Throw a more descriptive error
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
      `Options: Topic=${options.topic}, Language=${options.language}, Position=${options.position}, DifficultyText=${options.difficultyText}, PositionInstruction=${options.positionInstruction}`
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
      difficultyText: options.difficultyText,
      positionInstruction: options.positionInstruction,
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
    await logger.logToFile(
      'gemini-conversations.log',
      `REQUEST ID: ${requestId} - PROMPT:`,
      prompt
    );

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
    } catch (error) {
      logger.error('Failed to generate content from Gemini AI:', error);

      // Log the error to individual files
      await logger.logToFile(
        'gemini-errors.log',
        `REQUEST ID: ${requestId} - ERROR:`,
        error.message
      );

      // Log to the combined conversation log file
      await logger.logToFile(
        'gemini-conversations.log',
        `REQUEST ID: ${requestId} - ERROR:`,
        error.message
      );

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
