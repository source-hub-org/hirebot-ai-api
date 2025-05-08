/**
 * Update Instrument Routes
 * @module routes/instruments/updateInstrumentRoutes
 */

const express = require('express');
const {
  updateInstrumentController,
} = require('../../controllers/instruments/updateInstrumentController');

const router = express.Router();

/**
 * @swagger
 * /api/instruments/{id}:
 *   put:
 *     summary: Update an instrument
 *     description: Update an existing instrument with the provided data
 *     tags: [Instruments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the instrument to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: string
 *                 description: Unique identifier for the question
 *                 example: "q1-updated"
 *               questionText:
 *                 type: string
 *                 description: The text of the question
 *                 example: "I enjoy socializing with large groups of people (updated)."
 *               type:
 *                 type: string
 *                 description: The type of question
 *                 enum: [scale, multiple-choice, open-ended, boolean]
 *                 example: "scale"
 *               options:
 *                 type: array
 *                 description: Options for scale and multiple-choice questions
 *                 items:
 *                   type: string
 *                 example: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"]
 *               tags:
 *                 type: array
 *                 description: Array of tag IDs associated with this instrument
 *                 items:
 *                   type: string
 *                 example: ["60b6e98e99f1c5a0b8b7f1c8", "60b6e98e99f1c5a0b8b7f1c9"]
 *     responses:
 *       200:
 *         description: Instrument updated successfully
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
 *                       example: "60b6e98e99f1c5a0b8b7f1c9"
 *                     questionId:
 *                       type: string
 *                       example: "q1-updated"
 *                     questionText:
 *                       type: string
 *                       example: "I enjoy socializing with large groups of people (updated)."
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
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60b6e98e99f1c5a0b8b7f1c8"
 *                           name:
 *                             type: string
 *                             example: "Personality"
 *                           description:
 *                             type: string
 *                             example: "Tags related to personality tests and measurements."
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
 *                   example: Failed to update instrument.
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Question ID is required", "Question text is required", "At least one tag is required"]
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
 *                   example: Failed to update instrument.
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
 *                   example: Failed to update instrument.
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Internal server error"]
 */
router.put('/:id', updateInstrumentController);

module.exports = router;
