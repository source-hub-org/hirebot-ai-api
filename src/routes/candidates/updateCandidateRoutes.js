/**
 * Update Candidate Routes
 * @module routes/candidates/updateCandidateRoutes
 */

const express = require('express');
const router = express.Router();
const { updateCandidate } = require('../../controllers/candidates/updateCandidateController');

/**
 * @swagger
 * /api/candidates/{id}:
 *   put:
 *     summary: Update a candidate
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The candidate ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: "Nguyễn Văn A (Updated)"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "nguyenvana.updated@example.com"
 *               phone_number:
 *                 type: string
 *                 example: "+84901234567"
 *               interview_level:
 *                 type: string
 *                 example: "mid"
 *               gender:
 *                 type: string
 *                 example: "male"
 *               birthday:
 *                 type: string
 *                 example: "1998-03-15"
 *               location:
 *                 type: string
 *                 example: "Hồ Chí Minh, Việt Nam"
 *               education_level:
 *                 type: string
 *                 example: "Master"
 *               major:
 *                 type: string
 *                 example: "Computer Science"
 *               years_of_experience:
 *                 type: number
 *                 example: 3
 *               current_position:
 *                 type: string
 *                 example: "Senior Frontend Developer"
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["JavaScript", "React", "Redux", "HTML", "CSS", "Git"]
 *               programming_languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["JavaScript", "TypeScript", "Python"]
 *               preferred_stack:
 *                 type: string
 *                 example: "fullstack"
 *               assigned_topics:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Advanced JavaScript", "React Hooks", "State Management"]
 *               interview_score:
 *                 type: number
 *                 example: 8.5
 *               interview_feedback:
 *                 type: string
 *                 example: "Excellent candidate with strong frontend skills"
 *               interview_date:
 *                 type: string
 *                 example: "2025-05-15T10:00:00"
 *               interviewer_name:
 *                 type: string
 *                 example: "Trần Thị B"
 *               cv_url:
 *                 type: string
 *                 example: "https://example.com/cv/nguyenvana-updated.pdf"
 *               portfolio_url:
 *                 type: string
 *                 example: "https://github.com/nguyenvana"
 *               linkedin_url:
 *                 type: string
 *                 example: "https://linkedin.com/in/nguyenvana"
 *               status:
 *                 type: string
 *                 example: "interviewed"
 *           example:
 *             full_name: "Nguyễn Văn A (Updated)"
 *             email: "nguyenvana.updated@example.com"
 *             skills: ["JavaScript", "React", "Redux", "Node.js"]
 *             interview_level: "mid"
 *             status: "interviewed"
 *             interview_score: 8.5
 *             interview_feedback: "Excellent candidate with strong frontend skills"
 *     responses:
 *       200:
 *         description: Candidate updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Candidate not found
 *       409:
 *         description: Email already in use by another candidate
 *       500:
 *         description: Server error
 */
router.put('/:id', updateCandidate);

module.exports = router;
