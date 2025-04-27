/**
 * Question Request Routes
 * @module routes/questions/requestRoutes
 */

const express = require('express');
const {
  processQuestionRequestController,
} = require('../../controllers/questions/requestController');

const router = express.Router();

/**
 * @swagger
 * /api/questions/request:
 *   post:
 *     summary: Create question request jobs for topics
 *     description: Creates jobs to generate questions for specified topics or all topics if none provided
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - position
 *               - language
 *             properties:
 *               topics:
 *                 type: array
 *                 description: Array of topic IDs (if empty, all topics will be processed)
 *                 items:
 *                   type: string
 *               limit:
 *                 type: number
 *                 description: Maximum number of questions to generate per topic
 *                 default: 10
 *               position:
 *                 type: string
 *                 description: Experience level for the questions
 *                 enum: [intern, fresher, junior, middle, senior, expert]
 *                 required: true
 *               language:
 *                 type: string
 *                 description: Programming language for the questions
 *                 required: true
 *     responses:
 *       200:
 *         description: Question request jobs created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobCount:
 *                       type: number
 *                     jobs:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */
router.post('/request', processQuestionRequestController);

module.exports = router;
