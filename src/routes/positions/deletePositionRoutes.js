/**
 * Delete Position Routes
 * @module routes/positions/deletePositionRoutes
 */

const express = require('express');
const { deletePositionController } = require('../../controllers/positions');

const router = express.Router();

/**
 * @swagger
 * /api/positions/{id}:
 *   delete:
 *     summary: Delete a position by ID
 *     tags: [Positions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Position ID
 *     responses:
 *       200:
 *         description: Position deleted successfully
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
 *                   example: Position deleted successfully.
 *       404:
 *         description: Position not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deletePositionController);

module.exports = router;