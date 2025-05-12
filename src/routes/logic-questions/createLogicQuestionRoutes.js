/**
 * Create Logic Question Routes
 * @module routes/logic-questions/createLogicQuestionRoutes
 */

const express = require('express');
const {
  createLogicQuestionController,
} = require('../../controllers/logic-questions/createLogicQuestionController');

const router = express.Router();

/**
 * @swagger
 * /api/logic-questions:
 *   post:
 *     summary: Create a new logic question
 *     description: Create a new logic question with the provided data
 *     tags: [Logic Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogicQuestionInput'
 *     responses:
 *       201:
 *         description: Logic question created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/LogicQuestion'
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', createLogicQuestionController);

module.exports = router;
