/**
 * Create Instrument Tag Routes
 * @module routes/instrument-tags/createInstrumentTagRoutes
 */

const express = require('express');
const {
  createInstrumentTagController,
} = require('../../controllers/instrument-tags/createInstrumentTagController');

const router = express.Router();

/**
 * @swagger
 * /api/instrument-tags:
 *   post:
 *     summary: Create a new instrument tag
 *     description: Create a new instrument tag with the provided data
 *     tags: [Instrument Tags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the tag
 *                 example: "Personality"
 *               description:
 *                 type: string
 *                 description: A description of the tag
 *                 example: "Tags related to personality tests and measurements."
 *     responses:
 *       201:
 *         description: Instrument tag created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60b6e98e99f1c5a0b8b7f1c8"
 *                     name:
 *                       type: string
 *                       example: "Personality"
 *                     description:
 *                       type: string
 *                       example: "Tags related to personality tests and measurements."
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-08T10:00:00Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-08T10:00:00Z"
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Failed to create instrument tag.
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Tag name is required", "Tag description is required"]
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Failed to create instrument tag.
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Internal server error"]
 */
router.post('/', createInstrumentTagController);

module.exports = router;
