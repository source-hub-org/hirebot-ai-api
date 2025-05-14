/**
 * Get All Logic Questions Routes
 * @module routes/logic-questions/getAllLogicQuestionsRoutes
 */

const express = require('express');
const {
  getAllLogicQuestionsController,
} = require('../../controllers/logic-questions/getAllLogicQuestionsController');

const router = express.Router();

/**
 * @swagger
 * /api/logic-questions:
 *   get:
 *     summary: Get all logic questions
 *     description: |
 *       Retrieves logic questions with filtering, sorting, and pagination.
 *       Supports random sorting with 'sort_by=random' query parameter.
 *       You can exclude specific questions with 'ignore_question_ids' parameter (comma-separated list of IDs).
 *     tags: [Logic Questions]
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 6
 *         description: Filter by difficulty level (1-6)
 *       - in: query
 *         name: tag_id
 *         schema:
 *           type: string
 *         description: Filter by tag ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [multiple_choice, open_question]
 *         description: Filter by question type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [createdAt, level, type, random]
 *           default: createdAt
 *         description: Field to sort by. Use 'random' for random sorting.
 *       - in: query
 *         name: sort_direction
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort direction (ascending or descending)
 *       - in: query
 *         name: ignore_question_ids
 *         schema:
 *           type: string
 *         description: Comma-separated list of question IDs to exclude from results
 *         example: "60d21b4667d0d8992e610c85,60d21b4667d0d8992e610c86"
 *     responses:
 *       200:
 *         description: Successfully retrieved logic questions
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
 *                     $ref: '#/components/schemas/LogicQuestion'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.get('/', getAllLogicQuestionsController);

module.exports = router;
