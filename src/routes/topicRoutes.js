/**
 * Topic Routes Module
 * @module routes/topicRoutes
 */

const express = require('express');
const { getAllTopics } = require('../repository/topicRepository');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Topics
 *   description: API endpoints for managing topics
 */

/**
 * @swagger
 * /api/topics:
 *   get:
 *     summary: Get all topics
 *     description: Retrieve a list of all available topics
 *     tags: [Topics]
 *     responses:
 *       200:
 *         description: A list of topics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "Biến và kiểu dữ liệu"
 *                       difficulty:
 *                         type: number
 *                         example: 1
 *                       popularity:
 *                         type: string
 *                         example: "low"
 *                       suitable_level:
 *                         type: string
 *                         example: "intern"
 *                       description:
 *                         type: string
 *                         example: "Chủ đề liên quan đến biến và kiểu dữ liệu, thường gặp trong phỏng vấn lập trình viên."
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
 *                   example: Failed to retrieve topics.
 */
router.get('/', async (req, res) => {
  try {
    const topics = await getAllTopics();

    return res.status(200).json({
      status: 'success',
      data: topics,
    });
  } catch (error) {
    logger.error('Error retrieving topics:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve topics.',
      error: error.message,
    });
  }
});

module.exports = router;
