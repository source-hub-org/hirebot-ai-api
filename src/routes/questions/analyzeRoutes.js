/**
 * Question Analysis Routes
 * @module routes/questions/analyzeRoutes
 */

const express = require('express');
const { analyzeQuestionsController } = require('../../controllers/questions/analyzeController');

const router = express.Router();

/**
 * @swagger
 * /api/questions/analyze:
 *   get:
 *     summary: Analyze questions collection statistics
 *     description: |
 *       Performs statistical analysis on the questions collection.
 *       Returns counts by various dimensions (position, language, difficulty, etc.)
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: Questions analysis completed successfully
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
 *                   example: Question analysis completed successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                       example: 500
 *                     byPosition:
 *                       type: object
 *                       example: { "Intern": 120, "Junior": 90, "Unknown": 10 }
 *                     byLanguage:
 *                       type: object
 *                       example: { "PHP": 250, "Python": 80 }
 *                     byDifficulty:
 *                       type: object
 *                       example: { "easy": 300, "medium": 150, "hard": 30, "Unknown": 20 }
 *                     byCategory:
 *                       type: object
 *                       example: { "PHP Basics": 120, "OOP": 100 }
 *                     byTopic:
 *                       type: object
 *                       example: { "Biến và kiểu dữ liệu": 80, "Class và Object": 60 }
 *                     byDate:
 *                       type: object
 *                       example: { "2025-04-28": 10, "2025-04-27": 5 }
 *                     uniqueLanguages:
 *                       type: number
 *                       example: 5
 *                     uniqueCategories:
 *                       type: number
 *                       example: 12
 *                     averagePerPosition:
 *                       type: number
 *                       example: 83.33
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
 *                   example: An error occurred while analyzing questions.
 *                 error:
 *                   type: string
 */
router.get('/analyze', analyzeQuestionsController);

module.exports = router;
