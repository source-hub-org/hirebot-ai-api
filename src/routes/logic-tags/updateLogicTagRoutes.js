/**
 * Update Logic Tag Routes
 * @module routes/logic-tags/updateLogicTagRoutes
 */

const express = require('express');
const {
  updateLogicTagController,
} = require('../../controllers/logic-tags/updateLogicTagController');

const router = express.Router();

/**
 * @swagger
 * /api/logic-tags/{id}:
 *   put:
 *     summary: Update a logic tag
 *     description: Update a logic tag with the provided data
 *     tags: [Logic Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The logic tag ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogicTagInput'
 *     responses:
 *       200:
 *         description: Logic tag updated successfully
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
router.put('/:id', updateLogicTagController);

module.exports = router;
