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
 *         description: Whether to include candidate, question, and instrument data
 *     responses:
 *       200:
 *         description: List of submissions for the candidate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       candidate_id:
 *                         type: string
 *                       answers:
 *                         type: array
 *                         items:
 *                           type: object
 *                       instruments:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             instrument_id:
 *                               type: string
 *                             answer:
 *                               type: integer
 *                             other:
 *                               type: string
 *                             is_skip:
 *                               type: integer
 *                             instrument:
 *                               type: object
 *                               description: Populated instrument data (when enrich=true)
 *                       essay:
 *                         type: object
 *                       review:
 *                         type: object
 *                       candidate:
 *                         type: object
 *                         description: Candidate data (when enrich=true)
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Server error
 */
router.get('/candidate/:candidateId', getCandidateSubmissions);

module.exports = router;
