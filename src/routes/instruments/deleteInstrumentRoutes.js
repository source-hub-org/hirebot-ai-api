/**
 * Delete Instrument Routes
 * @module routes/instruments/deleteInstrumentRoutes
 */

const express = require('express');
const {
  deleteInstrumentController,
} = require('../../controllers/instruments/deleteInstrumentController');

const router = express.Router();

/**
 * @swagger
 * /api/instruments/{id}:
 *   delete:
 *     summary: Delete an instrument
 *     description: Delete an instrument by its ID
 *     tags: [Instruments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the instrument to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Instrument deleted successfully
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
 *                   example: Instrument deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60b6e98e99f1c5a0b8b7f1c9"
 *                     questionId:
 *                       type: string
 *                       example: "q1"
 *                     questionText:
 *                       type: string
 *                       example: "I enjoy socializing with large groups of people."
 *                     type:
 *                       type: string
 *                       example: "scale"
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["60b6e98e99f1c5a0b8b7f1c8", "60b6e98e99f1c5a0b8b7f1c9"]
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
 *                   example: Failed to delete instrument.
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Invalid instrument ID format"]
 *       404:
 *         description: Instrument not found
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
 *                   example: Failed to delete instrument.
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Instrument not found"]
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
 *                   example: Failed to delete instrument.
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Internal server error"]
 */
router.delete('/:id', deleteInstrumentController);

module.exports = router;
