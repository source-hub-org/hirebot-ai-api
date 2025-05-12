/**
 * Get All Logic Tags Routes
 * @module routes/logic-tags/getAllLogicTagsRoutes
 */

const express = require('express');
const {
  getAllLogicTagsController,
} = require('../../controllers/logic-tags/getAllLogicTagsController');

const router = express.Router();

/**
 * @swagger
 * /api/logic-tags:
 *   get:
 *     summary: Get all logic tags
 *     description: Retrieve a list of all logic tags
 *     tags: [Logic Tags]
 *     responses:
 *       200:
 *         description: A list of logic tags
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LogicTag'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getAllLogicTagsController);

module.exports = router;
