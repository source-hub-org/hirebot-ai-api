/**
 * Submission Routes Module
 * @module routes/submissionRoutes
 */

const express = require('express');
const router = express.Router();
const { validateSubmissionInput } = require('../utils/submissionValidator');
const {
  insertSubmissionToDB,
  getSubmissionById,
  getSubmissionsByCandidateId,
  candidateExists,
  questionsExist,
} = require('../repository/submissionRepository');
const logger = require('../utils/logger');

/**
 * @swagger
 * /api/submissions:
 *   post:
 *     summary: Create a new submission
 *     tags: [Submissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - candidate_id
 *             properties:
 *               candidate_id:
 *                 type: string
 *                 description: ID of the candidate
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - question_id
 *                   properties:
 *                     question_id:
 *                       type: string
 *                       description: ID of the question
 *                     answer:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 3
 *                       nullable: true
 *                       description: Selected answer (0-3 or null)
 *                     other:
 *                       type: string
 *                       description: Additional text for the answer
 *                     is_skip:
 *                       type: integer
 *                       enum: [0, 1]
 *                       description: Whether the question was skipped (0 or 1)
 *               essay:
 *                 type: object
 *                 properties:
 *                   question:
 *                     type: string
 *                     description: Essay question
 *                   answer:
 *                     type: string
 *                     description: Essay answer
 *                   is_skip:
 *                     type: integer
 *                     enum: [0, 1]
 *                     description: Whether the essay was skipped (0 or 1)
 *               review:
 *                 type: object
 *                 properties:
 *                   comment:
 *                     type: string
 *                     description: Review comment
 *                   status:
 *                     type: string
 *                     description: Review status
 *     responses:
 *       201:
 *         description: Submission created successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Candidate or question not found
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    // Validate input
    const validation = validateSubmissionInput(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors,
      });
    }

    // Check if candidate exists
    const candidateId = req.body.candidate_id;
    const candidateFound = await candidateExists(candidateId);

    if (!candidateFound) {
      return res.status(404).json({
        success: false,
        error: 'Candidate not found',
        details: `Candidate with ID ${candidateId} does not exist`,
      });
    }

    // Extract question IDs from answers
    const questionIds =
      req.body.answers && Array.isArray(req.body.answers)
        ? req.body.answers.map(answer => answer.question_id)
        : [];

    // Check if all questions exist
    if (questionIds.length > 0) {
      const { exists, missingIds } = await questionsExist(questionIds);

      if (!exists) {
        return res.status(404).json({
          success: false,
          error: 'Questions not found',
          details: `The following question IDs do not exist: ${missingIds.join(', ')}`,
        });
      }
    }

    // Insert submission
    const newSubmission = await insertSubmissionToDB(req.body);

    res.status(201).json({
      success: true,
      data: newSubmission,
      message: 'Submission created successfully',
    });
  } catch (error) {
    logger.error('Error in POST /submissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create submission',
    });
  }
});

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
router.get('/:id', async (req, res) => {
  try {
    // Check if enrichment is requested
    const enrich = req.query.enrich === 'true';

    const submission = await getSubmissionById(req.params.id, enrich);

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found',
      });
    }

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    logger.error(`Error in GET /submissions/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve submission',
    });
  }
});

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
router.get('/candidate/:candidateId', async (req, res) => {
  try {
    const candidateId = req.params.candidateId;

    // Check if candidate exists
    const candidateFound = await candidateExists(candidateId);

    if (!candidateFound) {
      return res.status(404).json({
        success: false,
        error: 'Candidate not found',
      });
    }

    // Check if enrichment is requested
    const enrich = req.query.enrich === 'true';

    const submissions = await getSubmissionsByCandidateId(candidateId, enrich);

    res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    logger.error(`Error in GET /submissions/candidate/${req.params.candidateId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve submissions',
    });
  }
});

module.exports = router;
