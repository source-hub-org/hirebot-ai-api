/**
 * Delete Submission Routes
 * @module routes/submissions/deleteSubmissionRoutes
 */

const express = require('express');
const router = express.Router();
const { deleteSubmission } = require('../../controllers/submissions/deleteSubmissionController');

/**
 * @swagger
 * /api/submissions/{id}:
 *   delete:
 *     summary: Delete a submission by ID
 *     tags: [Submissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the submission to delete
 *     responses:
 *       200:
 *         description: Submission deleted successfully
 *       400:
 *         description: Invalid submission ID format
 *       404:
 *         description: Submission not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteSubmission);

module.exports = router;
