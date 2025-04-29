/**
 * Get Position By ID Routes
 * @module routes/positions/getPositionByIdRoutes
 */

const express = require('express');
const { getPositionByIdController } = require('../../controllers/positions');

const router = express.Router();

/**
 * @swagger
 * /api/positions/{id}:
 *   get:
 *     summary: Retrieve a specific position by ID
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
 *         description: A position object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Position'
 *       404:
 *         description: Position not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getPositionByIdController);

module.exports = router;
