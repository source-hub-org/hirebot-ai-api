/**
 * Get All Instrument Tags Routes
 * @module routes/instrument-tags/getAllInstrumentTagsRoutes
 */

const express = require('express');
const {
  getAllInstrumentTagsController,
} = require('../../controllers/instrument-tags/getAllInstrumentTagsController');

const router = express.Router();

/**
 * @swagger
 * /api/instrument-tags:
 *   get:
 *     summary: Get all instrument tags
 *     description: Retrieve a list of all instrument tags
 *     tags: [Instrument Tags]
 *     responses:
 *       200:
 *         description: A list of instrument tags
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
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60b6e98e99f1c5a0b8b7f1c8"
 *                       name:
 *                         type: string
 *                         example: "Personality"
 *                       description:
 *                         type: string
 *                         example: "Tags related to personality tests and measurements."
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-05-08T10:00:00Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-05-08T10:00:00Z"
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
 *                   example: Failed to retrieve instrument tags.
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Internal server error"]
 */
router.get('/', getAllInstrumentTagsController);

module.exports = router;
