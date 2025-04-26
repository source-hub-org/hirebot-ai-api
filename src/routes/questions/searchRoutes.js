/**
 * Search Questions Routes
 * @module routes/questions/searchRoutes
 */

const express = require('express');
const { searchQuestionsController } = require('../../controllers/questions/searchController');

const router = express.Router();

/**
 * @swagger
 * /api/questions/search:
 *   get:
 *     summary: Search for questions based on various criteria
 *     description: |
 *       Search for questions by topic, language, position, with sorting and pagination.
 *       This endpoint allows you to filter questions based on multiple criteria and
 *       returns paginated results that can be sorted by different fields.
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: topic
 *         required: true
 *         schema:
 *           type: string
 *         description: The topic of the questions to search for (e.g., JavaScript, React, Node.js)
 *         example: JavaScript
 *       - in: query
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *         description: The programming or spoken language of the questions (e.g., JavaScript, Python, Java)
 *         example: JavaScript
 *       - in: query
 *         name: position
 *         required: true
 *         schema:
 *           type: string
 *           enum: [intern, fresher, junior, middle, senior, expert]
 *         description: The experience level for the questions
 *         example: junior
 *       - in: query
 *         name: sort_by
 *         required: false
 *         schema:
 *           type: string
 *           enum: [question, category, createdAt]
 *           default: createdAt
 *         description: Field to sort the results by
 *         example: createdAt
 *       - in: query
 *         name: sort_direction
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Direction to sort the results (ascending or descending)
 *         example: desc
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination (starts at 1)
 *         example: 1
 *       - in: query
 *         name: page_size
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of questions per page (max 100)
 *         example: 20
 *       - in: query
 *         name: mode
 *         required: false
 *         schema:
 *           type: string
 *           enum: [compact, full, minimalist]
 *           default: full
 *         description: Response mode - 'full' includes all fields, 'compact' excludes correctAnswer and explanation, 'minimalist' only includes _id and question
 *         example: full
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                   description: Status of the request
 *                 message:
 *                   type: string
 *                   example: Questions retrieved successfully.
 *                   description: Success message
 *                 data:
 *                   type: array
 *                   description: Array of questions matching the search criteria
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Unique identifier for the question
 *                         example: "60d21b4667d0d8992e610c85"
 *                       question:
 *                         type: string
 *                         description: The question text
 *                         example: "What is a closure in JavaScript?"
 *                       options:
 *                         type: array
 *                         description: Array of possible answers
 *                         items:
 *                           type: string
 *                         example: ["A function that returns another function", "A variable that cannot be changed", "A function with access to its outer scope", "A method to close a connection"]
 *                       correctAnswer:
 *                         type: integer
 *                         description: Index of the correct answer in the options array (0-based)
 *                         example: 2
 *                       explanation:
 *                         type: string
 *                         description: Explanation of the correct answer
 *                         example: "A closure is a function that has access to variables from its outer scope."
 *                       difficulty:
 *                         type: string
 *                         description: Difficulty level of the question
 *                         example: "medium"
 *                       category:
 *                         type: string
 *                         description: Category of the question
 *                         example: "JavaScript Concepts"
 *                       topic:
 *                         type: string
 *                         description: Topic of the question
 *                         example: "JavaScript"
 *                       language:
 *                         type: string
 *                         description: Programming language of the question
 *                         example: "JavaScript"
 *                       position:
 *                         type: string
 *                         description: Position level the question is targeted for
 *                         example: "Junior"
 *                       positionLevel:
 *                         type: integer
 *                         description: Numeric representation of the position level
 *                         example: 3
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Date and time when the question was created
 *                         example: "2023-01-01T00:00:00.000Z"
 *                 pagination:
 *                   type: object
 *                   description: Pagination information
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of questions matching the search criteria
 *                       example: 50
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                       example: 1
 *                     page_size:
 *                       type: integer
 *                       description: Number of questions per page
 *                       example: 20
 *                     total_pages:
 *                       type: integer
 *                       description: Total number of pages
 *                       example: 3
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
 *                   description: Status of the request
 *                 message:
 *                   type: string
 *                   example: An error occurred while searching for questions.
 *                   description: Error message
 *                 error:
 *                   type: string
 *                   example: Database connection error
 *                   description: Detailed error information
 */
router.get('/search', searchQuestionsController);

module.exports = router;
