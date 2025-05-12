/**
 * Create Logic Tag Routes
 * @module routes/logic-tags/createLogicTagRoutes
 */

const express = require('express');
const {
  createLogicTagController,
} = require('../../controllers/logic-tags/createLogicTagController');

const router = express.Router();

/**
 * @swagger
 * /api/logic-tags:
 *   post:
 *     summary: Create a new logic tag
 *     description: Create a new logic tag with the provided data
 *     tags: [Logic Tags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogicTagInput'
 *     responses:
 *       201:
 *         description: Logic tag created successfully
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
router.post('/', createLogicTagController);

module.exports = router;
