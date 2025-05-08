/**
 * Get Instrument Routes
 * @module routes/instruments/getInstrumentRoutes
 */

const express = require('express');
const {
  getInstrumentController,
} = require('../../controllers/instruments/getInstrumentController');

const router = express.Router();

/**
 * @swagger
 * /api/instruments/{id}:
 *   get:
 *     summary: Get an instrument by ID
 *     description: Retrieve a specific instrument by its ID
 *     tags: [Instruments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the instrument to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Instrument retrieved successfully
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
 *                   example: Failed to retrieve instrument.
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
 *                   example: Failed to retrieve instrument.
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
 *                   example: Failed to retrieve instrument.
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Internal server error"]
 */
router.get('/:id', getInstrumentController);

module.exports = router;
