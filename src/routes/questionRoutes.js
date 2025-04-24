/**
 * Question Generation Routes
 * @module routes/questionRoutes
 */

const express = require('express');
const path = require('path');
const { generateQuizQuestions } = require('@service/gemini/quizQuestionCreator');
const { insertMany } = require('@repository/baseRepository');
const logger = require('@utils/logger');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Questions
 *   description: API endpoints for generating and managing questions
 */

/**
 * @swagger
 * /api/questions/generate:
 *   post:
 *     summary: Generate multiple-choice questions using Gemini AI
 *     description: Generates technical interview questions based on provided parameters
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topic
 *               - language
 *               - position
 *             properties:
 *               topic:
 *                 type: string
 *                 description: The topic for which questions should be generated
 *                 example: "Data Structures"
 *               language:
 *                 type: string
 *                 description: The programming language for the questions
 *                 example: "JavaScript"
 *               position:
 *                 type: string
 *                 description: Position level (intern, fresher, junior, middle, senior, expert)
 *                 example: "junior"
 *     responses:
 *       200:
 *         description: Questions generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Questions generated successfully.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       question:
 *                         type: string
 *                       options:
 *                         type: array
 *                         items:
 *                           type: string
 *                       correctAnswer:
 *                         type: integer
 *                       explanation:
 *                         type: string
 *                       difficulty:
 *                         type: string
 *                       category:
 *                         type: string
 *                       topic:
 *                         type: string
 *                       language:
 *                         type: string
 *                       position:
 *                         type: string
 *                         description: Text representation of the position level
 *                         example: "Junior Developer"
 *                       positionLevel:
 *                         type: integer
 *                         description: Numeric position level (1-6)
 *                         example: 3
 *                       difficultyLevel:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Validation failed
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Failed to save questions.
 *       502:
 *         description: AI service error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Failed to generate questions from AI.
 */
router.post('/generate', async (req, res) => {
  try {
    // 1. Validate the request body
    const { topic, language, position } = req.body;
    const validationErrors = [];

    if (!topic || typeof topic !== 'string') {
      validationErrors.push('Topic is required and must be a string');
    }

    if (!language || typeof language !== 'string') {
      validationErrors.push('Language is required and must be a string');
    }

    if (!position || typeof position !== 'string') {
      validationErrors.push('Position is required and must be a string');
    }

    // Validate position is one of the allowed values
    const validPositions = ['intern', 'fresher', 'junior', 'middle', 'senior', 'expert'];
    if (position && !validPositions.includes(position.toLowerCase())) {
      validationErrors.push(`Position must be one of: ${validPositions.join(', ')}`);
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    // 2. Path to existing questions file
    const existingQuestionsPath = path.resolve(process.cwd(), 'data/existing-questions.txt');

    // 3. Define difficultyText and positionInstruction based on position
    const positionLowerCase = position.toLowerCase();

    // Map position to difficultyText and positionInstruction
    let difficultyText, positionInstruction, positionLevel;

    switch (positionLowerCase) {
      case 'intern':
        difficultyText = 'basic understanding of programming concepts';
        positionInstruction = 'suitable for an intern-level candidate';
        positionLevel = 1;
        break;
      case 'fresher':
        difficultyText = 'fundamental programming knowledge';
        positionInstruction = 'appropriate for a fresher with limited experience';
        positionLevel = 2;
        break;
      case 'junior':
        difficultyText = 'practical application of programming concepts';
        positionInstruction = 'targeted at a junior developer with some experience';
        positionLevel = 3;
        break;
      case 'middle':
        difficultyText = 'intermediate understanding of software development';
        positionInstruction = 'designed for a mid-level developer with solid experience';
        positionLevel = 4;
        break;
      case 'senior':
        difficultyText = 'deep understanding of scalable systems and best practices';
        positionInstruction = 'targeted at a senior developer with extensive experience';
        positionLevel = 5;
        break;
      case 'expert':
        difficultyText = 'advanced architectural thinking and system design expertise';
        positionInstruction = 'challenging for expert-level developers and architects';
        positionLevel = 6;
        break;
      default:
        difficultyText = 'various difficulty levels';
        positionInstruction = 'suitable for developers of different experience levels';
        positionLevel = 3; // Default to junior level
    }

    // 4. Call the AI question generation service with the provided parameters
    const { questions } = await generateQuizQuestions(existingQuestionsPath, {
      topic,
      language,
      position: positionLowerCase,
      difficultyText,
      positionInstruction,
      // You can adjust these parameters based on your needs
      temperature: 0.7,
      maxOutputTokens: 8192,
    });

    // 5. Prepare questions for database storage with metadata
    const timestamp = new Date();

    // Format position for display (capitalize first letter)
    const positionText = position.charAt(0).toUpperCase() + position.slice(1);

    const questionsWithMetadata = questions.map(question => ({
      ...question,
      topic,
      language,
      position: positionText,
      positionLevel, // Store the numeric equivalent
      createdAt: timestamp,
    }));

    // 6. Store the questions in MongoDB
    const result = await insertMany('questions', questionsWithMetadata);

    // 7. Append the new questions to the existing questions file to avoid duplicates in future
    try {
      const fs = require('fs').promises;
      const newQuestionTexts = questions.map(q => q.question);
      await fs.appendFile(existingQuestionsPath, '\n' + newQuestionTexts.join('\n'), 'utf8');
    } catch (appendError) {
      logger.warn('Failed to update existing questions file:', appendError);
      // Continue execution even if this fails
    }

    // 8. Respond to the client
    return res.status(200).json({
      status: 'success',
      message: 'Questions generated and saved.',
      data: questionsWithMetadata,
    });
  } catch (error) {
    logger.error('Error generating questions:', error);

    // Log request metadata for easier debugging
    const requestMetadata = {
      topic: req.body.topic,
      language: req.body.language,
      position: req.body.position,
      timestamp: new Date().toISOString(),
    };
    logger.error('Request metadata:', requestMetadata);

    // Handle specific error types
    if (error.message.includes('Invalid generated content')) {
      // This is likely a JSON parsing or validation error
      return res.status(422).json({
        status: 'error',
        message: 'Failed to generate quiz questions.',
        details:
          'The AI generated a response that could not be properly parsed as valid questions.',
        error: error.message,
      });
    }

    if (error.message.includes('Failed to generate content from Gemini API')) {
      return res.status(502).json({
        status: 'error',
        message: 'Failed to generate questions from AI.',
        details: 'The AI service encountered an error while processing your request.',
        error: error.message,
      });
    }

    if (error.message.includes('Database') || error.message.includes('MongoDB')) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to save questions.',
        details:
          'The questions were generated successfully but could not be saved to the database.',
        error: error.message,
      });
    }

    // Generic error response
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred.',
      details: 'The server encountered an unexpected error while processing your request.',
      error: error.message,
    });
  }
});

module.exports = router;
