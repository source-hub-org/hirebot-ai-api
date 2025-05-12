/**
 * Delete Logic Tag Routes
 * @module routes/logic-tags/deleteLogicTagRoutes
 */

const express = require('express');
const {
  deleteLogicTagController,
} = require('../../controllers/logic-tags/deleteLogicTagController');

const router = express.Router();

/**
 * @swagger
 * /api/logic-tags/{id}:
 *   delete:
 *     summary: Delete a logic tag
 *     description: Delete a logic tag by its ID
 *     tags: [Logic Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The logic tag ID
 *     responses:
 *       200:
 *         description: Logic tag deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/LogicTag'
 *       404:
 *         description: Logic tag not found
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
router.delete('/:id', deleteLogicTagController);

module.exports = router;
