/**
 * Generate Questions Routes
 * @module routes/questions/generateRoutes
 */

const express = require('express');
const { generateQuestionsController } = require('../../controllers/questions/generateController');

const router = express.Router();

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
router.post('/generate', generateQuestionsController);

module.exports = router;
