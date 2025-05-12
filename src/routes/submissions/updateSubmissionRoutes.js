/**
 * Update Submission Routes
 * @module routes/submissions/updateSubmissionRoutes
 */

const express = require('express');
const router = express.Router();
const { updateSubmission } = require('../../controllers/submissions/updateSubmissionController');

/**
 * @swagger
 * /api/submissions/{id}:
 *   put:
 *     summary: Update a submission by ID
 *     tags: [Submissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the submission to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *                     point:
 *                       type: number
 *                       minimum: 0
 *                       default: 0
 *                       description: Score given to the answer
 *                     is_skip:
 *                       type: integer
 *                       enum: [0, 1]
 *                       description: Whether the question was skipped (0 or 1)
 *               instruments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - instrument_id
 *                   properties:
 *                     instrument_id:
 *                       type: string
 *                       description: ID of the instrument
 *                     answer:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 4
 *                       nullable: true
 *                       description: Selected answer (0-4 or null)
 *                     other:
 *                       type: string
 *                       description: Additional text for the instrument response
 *                     point:
 *                       type: number
 *                       minimum: 0
 *                       default: 0
 *                       description: Score given to the instrument response
 *                     is_skip:
 *                       type: integer
 *                       enum: [0, 1]
 *                       description: Whether the instrument was skipped (0 or 1)
 *               logic_questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - logic_question_id
 *                   properties:
 *                     logic_question_id:
 *                       type: string
 *                       description: ID of the logic question
 *                     answer:
 *                       type: string
 *                       description: Answer to the logic question (e.g., 'true,false,true')
 *                     other:
 *                       type: string
 *                       description: Additional text for the logic question response
 *                     point:
 *                       type: number
 *                       minimum: 0
 *                       default: 0
 *                       description: Score given to the logic question response
 *                     is_skip:
 *                       type: integer
 *                       enum: [0, 1]
 *                       description: Whether the logic question was skipped (0 or 1)
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
 *       200:
 *         description: Submission updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Submission, question, instrument, or logic question not found
 *       500:
 *         description: Server error
 */
router.put('/:id', updateSubmission);

module.exports = router;
