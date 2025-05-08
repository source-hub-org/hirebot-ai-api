/**
 * Delete Instrument Tag Routes
 * @module routes/instrument-tags/deleteInstrumentTagRoutes
 */

const express = require('express');
const {
  deleteInstrumentTagController,
} = require('../../controllers/instrument-tags/deleteInstrumentTagController');

const router = express.Router();

/**
 * @swagger
 * /api/instrument-tags/{id}:
 *   delete:
 *     summary: Delete an instrument tag
 *     description: Delete an instrument tag by its ID
 *     tags: [Instrument Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the instrument tag to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Instrument tag deleted successfully
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
 *                   example: Instrument tag deleted successfully
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
 *         description: Bad request - Invalid ID format
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
 *                   example: Failed to delete instrument tag.
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Invalid tag ID format"]
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
 *                   example: Failed to delete instrument tag.
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
 *                   example: Failed to delete instrument tag.
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Internal server error"]
 */
router.delete('/:id', deleteInstrumentTagController);

module.exports = router;
