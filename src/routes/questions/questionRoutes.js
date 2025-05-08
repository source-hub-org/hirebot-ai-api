/**
 * Question Routes Module
 * @module routes/questions/questionRoutes
 */

const express = require('express');
const {
  createQuestionController,
  getQuestionController,
  updateQuestionController,
  deleteQuestionController,
} = require('../../controllers/questions/questionController');

const router = express.Router();

/**
 * @swagger
 * /api/questions:
 *   post:
 *     summary: Create a new question
 *     description: Create a new question with the provided data
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - options
 *               - correctAnswer
 *               - explanation
 *               - difficulty
 *               - category
 *               - topic
 *               - language
 *               - position
 *               - positionLevel
 *             properties:
 *               question:
 *                 type: string
 *                 description: The text of the question
 *                 example: "What is a closure in JavaScript?"
 *               options:
 *                 type: array
 *                 description: An array of 4 possible answers
 *                 items:
 *                   type: string
 *                 example: ["A function that returns another function", "A variable that cannot be changed", "A function with access to its outer scope", "A method to close a connection"]
 *               correctAnswer:
 *                 type: integer
 *                 description: Index of the correct answer in the options array (0-based)
 *                 minimum: 0
 *                 maximum: 3
 *                 example: 2
 *               explanation:
 *                 type: string
 *                 description: Explanation of the correct answer
 *                 example: "A closure is a function that has access to variables from its outer scope."
 *               difficulty:
 *                 type: string
 *                 description: Difficulty level of the question
 *                 enum: [easy, medium, hard]
 *                 example: "medium"
 *               category:
 *                 type: string
 *                 description: General category of the question
 *                 example: "JavaScript Concepts"
 *               topic:
 *                 type: string
 *                 description: Specific topic of the question
 *                 example: "JavaScript"
 *               language:
 *                 type: string
 *                 description: Programming language context
 *                 example: "JavaScript"
 *               position:
 *                 type: string
 *                 description: Targeted job title
 *                 example: "Junior"
 *               positionLevel:
 *                 type: integer
 *                 description: Level (1 = Intern, 2 = Junior, etc.)
 *                 minimum: 1
 *                 example: 2
 *     responses:
 *       201:
 *         description: Question created successfully
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
 *                   example: Question created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     question:
 *                       type: string
 *                       example: "What is a closure in JavaScript?"
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["A function that returns another function", "A variable that cannot be changed", "A function with access to its outer scope", "A method to close a connection"]
 *                     correctAnswer:
 *                       type: integer
 *                       example: 2
 *                     explanation:
 *                       type: string
 *                       example: "A closure is a function that has access to variables from its outer scope."
 *                     difficulty:
 *                       type: string
 *                       example: "medium"
 *                     category:
 *                       type: string
 *                       example: "JavaScript Concepts"
 *                     topic:
 *                       type: string
 *                       example: "JavaScript"
 *                     language:
 *                       type: string
 *                       example: "JavaScript"
 *                     position:
 *                       type: string
 *                       example: "Junior"
 *                     positionLevel:
 *                       type: integer
 *                       example: 2
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-01-01T00:00:00.000Z"
 *       400:
 *         description: Validation error
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
 *                   example: ["Options must contain exactly 4 items", "Difficulty must be one of: easy, medium, hard"]
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
 *                   example: An error occurred while creating the question
 *                 error:
 *                   type: string
 *                   example: Database connection error
 */
router.post('/', createQuestionController);

/**
 * @swagger
 * /api/questions/{id}:
 *   get:
 *     summary: Get a question by ID
 *     description: Retrieve a question by its unique ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The question ID
 *     responses:
 *       200:
 *         description: Question retrieved successfully
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
 *                   example: Question retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     question:
 *                       type: string
 *                       example: "What is a closure in JavaScript?"
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["A function that returns another function", "A variable that cannot be changed", "A function with access to its outer scope", "A method to close a connection"]
 *                     correctAnswer:
 *                       type: integer
 *                       example: 2
 *                     explanation:
 *                       type: string
 *                       example: "A closure is a function that has access to variables from its outer scope."
 *                     difficulty:
 *                       type: string
 *                       example: "medium"
 *                     category:
 *                       type: string
 *                       example: "JavaScript Concepts"
 *                     topic:
 *                       type: string
 *                       example: "JavaScript"
 *                     language:
 *                       type: string
 *                       example: "JavaScript"
 *                     position:
 *                       type: string
 *                       example: "Junior"
 *                     positionLevel:
 *                       type: integer
 *                       example: 2
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-01-01T00:00:00.000Z"
 *       404:
 *         description: Question not found
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
 *                   example: Question with ID 60d21b4667d0d8992e610c85 not found
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
 *                   example: An error occurred while retrieving the question
 *                 error:
 *                   type: string
 *                   example: Database connection error
 */
router.get('/:id', getQuestionController);

/**
 * @swagger
 * /api/questions/{id}:
 *   put:
 *     summary: Update a question by ID
 *     description: Update an existing question with the provided data
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - options
 *               - correctAnswer
 *               - explanation
 *               - difficulty
 *               - category
 *               - topic
 *               - language
 *               - position
 *               - positionLevel
 *             properties:
 *               question:
 *                 type: string
 *                 description: The text of the question
 *                 example: "What is a closure in JavaScript?"
 *               options:
 *                 type: array
 *                 description: An array of 4 possible answers
 *                 items:
 *                   type: string
 *                 example: ["A function that returns another function", "A variable that cannot be changed", "A function with access to its outer scope", "A method to close a connection"]
 *               correctAnswer:
 *                 type: integer
 *                 description: Index of the correct answer in the options array (0-based)
 *                 minimum: 0
 *                 maximum: 3
 *                 example: 2
 *               explanation:
 *                 type: string
 *                 description: Explanation of the correct answer
 *                 example: "A closure is a function that has access to variables from its outer scope."
 *               difficulty:
 *                 type: string
 *                 description: Difficulty level of the question
 *                 enum: [easy, medium, hard]
 *                 example: "medium"
 *               category:
 *                 type: string
 *                 description: General category of the question
 *                 example: "JavaScript Concepts"
 *               topic:
 *                 type: string
 *                 description: Specific topic of the question
 *                 example: "JavaScript"
 *               language:
 *                 type: string
 *                 description: Programming language context
 *                 example: "JavaScript"
 *               position:
 *                 type: string
 *                 description: Targeted job title
 *                 example: "Junior"
 *               positionLevel:
 *                 type: integer
 *                 description: Level (1 = Intern, 2 = Junior, etc.)
 *                 minimum: 1
 *                 example: 2
 *     responses:
 *       200:
 *         description: Question updated successfully
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
 *                   example: Question updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     question:
 *                       type: string
 *                       example: "What is a closure in JavaScript?"
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["A function that returns another function", "A variable that cannot be changed", "A function with access to its outer scope", "A method to close a connection"]
 *                     correctAnswer:
 *                       type: integer
 *                       example: 2
 *                     explanation:
 *                       type: string
 *                       example: "A closure is a function that has access to variables from its outer scope."
 *                     difficulty:
 *                       type: string
 *                       example: "medium"
 *                     category:
 *                       type: string
 *                       example: "JavaScript Concepts"
 *                     topic:
 *                       type: string
 *                       example: "JavaScript"
 *                     language:
 *                       type: string
 *                       example: "JavaScript"
 *                     position:
 *                       type: string
 *                       example: "Junior"
 *                     positionLevel:
 *                       type: integer
 *                       example: 2
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-01-01T00:00:00.000Z"
 *       400:
 *         description: Validation error
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
 *                   example: ["Options must contain exactly 4 items", "Difficulty must be one of: easy, medium, hard"]
 *       404:
 *         description: Question not found
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
 *                   example: Question with ID 60d21b4667d0d8992e610c85 not found
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
 *                   example: An error occurred while updating the question
 *                 error:
 *                   type: string
 *                   example: Database connection error
 */
router.put('/:id', updateQuestionController);

/**
 * @swagger
 * /api/questions/{id}:
 *   delete:
 *     summary: Delete a question by ID
 *     description: Delete a question by its unique ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The question ID
 *     responses:
 *       200:
 *         description: Question deleted successfully
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
 *                   example: Question deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *       404:
 *         description: Question not found
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
 *                   example: Question with ID 60d21b4667d0d8992e610c85 not found
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
 *                   example: An error occurred while deleting the question
 *                 error:
 *                   type: string
 *                   example: Database connection error
 */
router.delete('/:id', deleteQuestionController);

module.exports = router;
