/**
 * Get Candidate Submissions Routes
 * @module routes/submissions/getCandidateSubmissionsRoutes
 */

const express = require('express');
const router = express.Router();
const {
  getCandidateSubmissions,
} = require('../../controllers/submissions/getCandidateSubmissionsController');

/**
 * @swagger
 * /api/submissions/candidate/{candidateId}:
 *   get:
 *     summary: Get submissions by candidate ID
 *     tags: [Submissions]
 *     parameters:
 *       - in: path
 *         name: candidateId
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
 *         description: List of submissions for the candidate
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Server error
 */
router.get('/candidate/:candidateId', getCandidateSubmissions);

module.exports = router;
