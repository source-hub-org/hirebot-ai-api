/**
 * Update Instrument Tag Routes
 * @module routes/instrument-tags/updateInstrumentTagRoutes
 */

const express = require('express');
const {
  updateInstrumentTagController,
} = require('../../controllers/instrument-tags/updateInstrumentTagController');

const router = express.Router();

/**
 * @swagger
 * /api/instrument-tags/{id}:
 *   put:
 *     summary: Update an instrument tag
 *     description: Update an existing instrument tag with the provided data
 *     tags: [Instrument Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the instrument tag to update
 *         schema:
 *           type: string
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
 *                 example: "Updated Personality"
 *               description:
 *                 type: string
 *                 description: A description of the tag
 *                 example: "Updated tags related to personality tests and measurements."
 *     responses:
 *       200:
 *         description: Instrument tag updated successfully
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
 *                       example: "Updated Personality"
 *                     description:
 *                       type: string
 *                       example: "Updated tags related to personality tests and measurements."
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-08T10:00:00Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-08T10:00:00Z"
 *       400:
 *         description: Bad request - Invalid input data or ID format
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
 *                   example: Failed to update instrument tag.
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Tag name is required", "Tag description is required"]
 *       404:
 *         description: Instrument tag not found
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
 *                   example: Failed to update instrument tag.
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Tag not found"]
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
 *                   example: Failed to update instrument tag.
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Internal server error"]
 */
router.put('/:id', updateInstrumentTagController);

module.exports = router;
