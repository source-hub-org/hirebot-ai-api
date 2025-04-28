/**
 * Create Position Routes
 * @module routes/positions/createPositionRoutes
 */

const express = require('express');
const { createPositionController } = require('../../controllers/positions');

const router = express.Router();

/**
 * @swagger
 * /api/positions:
 *   post:
 *     summary: Create a new position
 *     tags: [Positions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slug
 *               - title
 *               - description
 *               - instruction
 *               - level
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
 *                 default: true
 *     responses:
 *       201:
 *         description: Position created successfully
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
 *                   example: Position created successfully.
 *                 data:
 *                   $ref: '#/components/schemas/Position'
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Position with the same slug already exists
 *       500:
 *         description: Server error
 */
router.post('/', createPositionController);

module.exports = router;