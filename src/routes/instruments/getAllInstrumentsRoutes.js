/**
 * Get All Instruments Routes
 * @module routes/instruments/getAllInstrumentsRoutes
 */

const express = require('express');
const {
  getAllInstrumentsController,
} = require('../../controllers/instruments/getAllInstrumentsController');

const router = express.Router();

/**
 * @swagger
 * /api/instruments:
 *   get:
 *     summary: Get all instruments
 *     description: Retrieve a list of all instruments with pagination and filtering options
 *     tags: [Instruments]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [scale, multiple-choice, open-ended, boolean]
 *         description: Filter by instrument type
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, questionId, questionText, random]
 *         description: Field to sort by. Use 'random' for random sorting.
 *       - in: query
 *         name: sort_direction
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort direction (ascending or descending)
 *       - in: query
 *         name: instrument_tags
 *         schema:
 *           type: string
 *         description: Comma-separated list of tag IDs to filter instruments by. Only instruments associated with any of these tags will be returned.
 *         example: "681ac4cd6e5dc98b8d660917,c98b8d660917681ac4cd6e5d"
 *       - in: query
 *         name: ignore_instrument_ids
 *         schema:
 *           type: string
 *         description: Comma-separated list of instrument IDs to exclude from the results
 *         example: "681ac4cd6e5dc98b8d660917,c98b8d660917681ac4cd6e5d"
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
 *                       example: 25
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     page_size:
 *                       type: integer
 *                       example: 10
 *                     total_pages:
 *                       type: integer
 *                       example: 3
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
 *                   example: Failed to retrieve instruments.
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Internal server error"]
 */
router.get('/', getAllInstrumentsController);

module.exports = router;
