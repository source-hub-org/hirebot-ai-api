/**
 * Update Logic Question Routes
 * @module routes/logic-questions/updateLogicQuestionRoutes
 */

const express = require('express');
const {
  updateLogicQuestionController,
} = require('../../controllers/logic-questions/updateLogicQuestionController');

const router = express.Router();

/**
 * @swagger
 * /api/logic-questions/{id}:
 *   put:
 *     summary: Update a logic question
 *     description: Update a logic question with the provided data
 *     tags: [Logic Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The logic question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogicQuestionInput'
 *     responses:
 *       200:
 *         description: Logic question updated successfully
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
 *       404:
 *         description: Logic question not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Bad request - Invalid input data or ID format
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
router.put('/:id', updateLogicQuestionController);

module.exports = router;
