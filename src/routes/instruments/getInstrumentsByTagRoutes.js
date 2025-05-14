/**
 * Get Instruments By Tag Routes
 * @module routes/instruments/getInstrumentsByTagRoutes
 */

const express = require('express');
const {
  getInstrumentsByTagController,
} = require('../../controllers/instruments/getInstrumentsByTagController');

const router = express.Router();

/**
 * @swagger
 * /api/instruments/tag/{tagId}:
 *   get:
 *     summary: Get instruments by tag ID
 *     description: Retrieve instruments associated with a specific tag ID with pagination
 *     tags: [Instruments]
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         description: ID of the tag to filter instruments by
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, questionId, questionText]
 *         description: Field to sort by
 *       - in: query
 *         name: sort_direction
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort direction (ascending or descending)
 *     responses:
 *       200:
 *         description: A list of instruments with pagination info
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
 *                       _id:
 *                         type: string
 *                         example: "60b6e98e99f1c5a0b8b7f1c9"
 *                       questionId:
 *                         type: string
 *                         example: "q1"
 *                       questionText:
 *                         type: string
 *                         example: "I enjoy socializing with large groups of people."
 *                       type:
 *                         type: string
 *                         example: "scale"
 *                       options:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: "60b6e98e99f1c5a0b8b7f1c8"
 *                             name:
 *                               type: string
 *                               example: "Personality"
 *                             description:
 *                               type: string
 *                               example: "Tags related to personality tests and measurements."
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-05-08T10:00:00Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-05-08T10:00:00Z"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 15
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     page_size:
 *                       type: integer
 *                       example: 10
 *                     total_pages:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Bad request - Invalid tag ID format
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
 *                   example: Failed to retrieve instruments by tag.
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Invalid tag ID format"]
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
 *                   example: Failed to retrieve instruments by tag.
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Internal server error"]
 */
router.get('/tag/:tagId', getInstrumentsByTagController);

module.exports = router;
