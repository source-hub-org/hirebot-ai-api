/**
 * Question Request Routes
 * @module routes/questionRequestRoutes
 */

const express = require('express');
const { processQuestionRequest } = require('../service/questionRequestService');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * /api/question/request:
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
router.post('/request', async (req, res) => {
  try {
    const { topics, limit } = req.body;

    // Validate limit if provided
    if (limit !== undefined && (!Number.isInteger(limit) || limit <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be a positive integer',
      });
    }

    // Validate topics if provided
    if (topics !== undefined && !Array.isArray(topics)) {
      return res.status(400).json({
        success: false,
        message: 'Topics must be an array',
      });
    }

    const jobs = await processQuestionRequest({ topics, limit });

    return res.status(200).json({
      success: true,
      message: `Created ${jobs.length} question request jobs`,
      data: {
        jobCount: jobs.length,
        jobs: jobs.map(job => ({
          _id: job._id,
          type: job.type,
          status: job.status,
          created_at: job.created_at,
        })),
      },
    });
  } catch (error) {
    logger.error('Error in question request route:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process question request',
      error: error.message,
    });
  }
});

module.exports = router;
