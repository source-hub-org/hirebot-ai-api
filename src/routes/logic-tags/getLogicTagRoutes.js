/**
 * Get Logic Tag Routes
 * @module routes/logic-tags/getLogicTagRoutes
 */

const express = require('express');
const { getLogicTagController } = require('../../controllers/logic-tags/getLogicTagController');

const router = express.Router();

/**
 * @swagger
 * /api/logic-tags/{id}:
 *   get:
 *     summary: Get a logic tag by ID
 *     description: Retrieve a logic tag by its ID
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
 *         description: Logic tag retrieved successfully
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
router.get('/:id', getLogicTagController);

module.exports = router;
