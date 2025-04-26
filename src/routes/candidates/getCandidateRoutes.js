/**
 * Get Candidate Routes
 * @module routes/candidates/getCandidateRoutes
 */

const express = require('express');
const router = express.Router();
const {
  getCandidateByIdController,
} = require('../../controllers/candidates/getCandidateController');

/**
 * @swagger
 * /api/candidates/{id}:
 *   get:
 *     summary: Get a candidate by ID
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Candidate details
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getCandidateByIdController);

module.exports = router;
