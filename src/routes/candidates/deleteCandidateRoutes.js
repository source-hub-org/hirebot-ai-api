/**
 * Delete Candidate Routes
 * @module routes/candidates/deleteCandidateRoutes
 */

const express = require('express');
const router = express.Router();
const { deleteCandidate } = require('../../controllers/candidates/deleteCandidateController');

/**
 * @swagger
 * /api/candidates/{id}:
 *   delete:
 *     summary: Delete a candidate
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Candidate deleted successfully
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteCandidate);

module.exports = router;
