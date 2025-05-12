/**
 * Delete Logic Question Routes
 * @module routes/logic-questions/deleteLogicQuestionRoutes
 */

const express = require('express');
const {
  deleteLogicQuestionController,
} = require('../../controllers/logic-questions/deleteLogicQuestionController');

const router = express.Router();

/**
 * @swagger
 * /api/logic-questions/{id}:
 *   delete:
 *     summary: Delete a logic question
 *     description: Delete a logic question by its ID
 *     tags: [Logic Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The logic question ID
 *     responses:
 *       200:
 *         description: Logic question deleted successfully
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
 *         description: Bad request - Invalid ID format
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
router.delete('/:id', deleteLogicQuestionController);

module.exports = router;
