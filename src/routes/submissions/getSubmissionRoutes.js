/**
 * Get Submission Routes
 * @module routes/submissions/getSubmissionRoutes
 */

const express = require('express');
const router = express.Router();
const {
  getSubmissionByIdController,
} = require('../../controllers/submissions/getSubmissionController');

/**
 * @swagger
 * /api/submissions/{id}:
 *   get:
 *     summary: Get a submission by ID
 *     tags: [Submissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: enrich
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Whether to include candidate and question data
 *     responses:
 *       200:
 *         description: Submission details
 *       404:
 *         description: Submission not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getSubmissionByIdController);

module.exports = router;
