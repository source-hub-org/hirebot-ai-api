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
 *               - difficulty
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
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 6
 *                 description: Position level (1=Intern, 2=Fresher, 3=Junior, 4=Middle, 5=Senior, 6=Master)
 *                 example: 3
 *               difficulty:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 6
 *                 description: Difficulty level (1=Intern, 2=Fresher, 3=Junior, 4=Middle, 5=Senior, 6=Master)
 *                 example: 3
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
    const { topic, language, position, difficulty } = req.body;
    const validationErrors = [];

    if (!topic || typeof topic !== 'string') {
      validationErrors.push('Topic is required and must be a string');
    }

    if (!language || typeof language !== 'string') {
      validationErrors.push('Language is required and must be a string');
    }

    if (
      !position ||
      typeof position !== 'number' ||
      !Number.isInteger(position) ||
      position < 1 ||
      position > 6
    ) {
      validationErrors.push('Position is required and must be an integer between 1 and 6');
    }

    if (
      !difficulty ||
      typeof difficulty !== 'number' ||
      !Number.isInteger(difficulty) ||
      difficulty < 1 ||
      difficulty > 6
    ) {
      validationErrors.push('Difficulty is required and must be an integer between 1 and 6');
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

    // 3. Call the AI question generation service with the provided parameters
    const { questions } = await generateQuizQuestions(existingQuestionsPath, {
      topic,
      language,
      position,
      difficulty,
      // You can adjust these parameters based on your needs
      temperature: 0.7,
      maxOutputTokens: 8192,
    });

    // 4. Prepare questions for database storage with metadata
    const timestamp = new Date();

    // Map position number to text for better readability in the database
    const positionMap = {
      1: 'Intern',
      2: 'Fresher',
      3: 'Junior Developer',
      4: 'Middle Developer',
      5: 'Senior Developer',
      6: 'Master/Expert Developer',
    };
    const positionText = positionMap[position] || 'Developer';

    const questionsWithMetadata = questions.map(question => ({
      ...question,
      topic,
      language,
      position: positionText,
      positionLevel: position, // Store the numeric value as well
      difficultyLevel: difficulty,
      createdAt: timestamp,
    }));

    // 5. Store the questions in MongoDB
    const result = await insertMany('questions', questionsWithMetadata);

    // 6. Append the new questions to the existing questions file to avoid duplicates in future
    try {
      const fs = require('fs').promises;
      const newQuestionTexts = questions.map(q => q.question);
      await fs.appendFile(existingQuestionsPath, '\n' + newQuestionTexts.join('\n'), 'utf8');
    } catch (appendError) {
      logger.warn('Failed to update existing questions file:', appendError);
      // Continue execution even if this fails
    }

    // 7. Respond to the client
    return res.status(200).json({
      status: 'success',
      message: 'Questions generated successfully.',
      data: questionsWithMetadata,
    });
  } catch (error) {
    logger.error('Error generating questions:', error);

    // Handle specific error types
    if (error.message.includes('Failed to generate quiz questions')) {
      return res.status(502).json({
        status: 'error',
        message: 'Failed to generate questions from AI.',
        error: error.message,
      });
    }

    if (error.message.includes('Database') || error.message.includes('MongoDB')) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to save questions.',
        error: error.message,
      });
    }

    // Generic error response
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred.',
      error: error.message,
    });
  }
});

module.exports = router;
