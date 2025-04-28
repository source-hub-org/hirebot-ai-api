/**
 * Update Position Routes
 * @module routes/positions/updatePositionRoutes
 */

const express = require('express');
const { updatePositionController } = require('../../controllers/positions');

const router = express.Router();

/**
 * @swagger
 * /api/positions/{id}:
 *   put:
 *     summary: Update a position by ID
 *     tags: [Positions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Position ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slug:
 *                 type: string
 *                 description: Unique identifier for the position
 *               title:
 *                 type: string
 *                 description: Position title
 *               description:
 *                 type: string
 *                 description: Position description
 *               instruction:
 *                 type: string
 *                 description: Position instruction
 *               level:
 *                 type: integer
 *                 description: Position level
 *               is_active:
 *                 type: boolean
 *                 description: Position active status
 *     responses:
 *       200:
 *         description: Position updated successfully
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
 *                   example: Position updated successfully.
 *                 data:
 *                   $ref: '#/components/schemas/Position'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Position not found
 *       409:
 *         description: Position with the same slug already exists
 *       500:
 *         description: Server error
 */
router.put('/:id', updatePositionController);

module.exports = router;