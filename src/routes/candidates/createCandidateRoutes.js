/**
 * Create Candidate Routes
 * @module routes/candidates/createCandidateRoutes
 */

const express = require('express');
const router = express.Router();
const { createCandidate } = require('../../controllers/candidates/createCandidateController');

/**
 * @swagger
 * /api/candidates:
 *   post:
 *     summary: Create a new candidate
 *     tags: [Candidates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email
 *               - phone_number
 *               - interview_level
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "nguyenvana@example.com"
 *               phone_number:
 *                 type: string
 *                 example: "+84901234567"
 *               interview_level:
 *                 type: string
 *                 example: "junior"
 *               gender:
 *                 type: string
 *                 example: "male"
 *               birthday:
 *                 type: string
 *                 example: "1998-03-15"
 *               location:
 *                 type: string
 *                 example: "Hà Nội, Việt Nam"
 *               education_level:
 *                 type: string
 *                 example: "Bachelor"
 *               major:
 *                 type: string
 *                 example: "Computer Science"
 *               years_of_experience:
 *                 type: number
 *                 example: 2
 *               current_position:
 *                 type: string
 *                 example: "Frontend Developer"
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["JavaScript", "React", "HTML", "CSS", "Git"]
 *               programming_languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["JavaScript", "TypeScript"]
 *               preferred_stack:
 *                 type: string
 *                 example: "frontend"
 *               assigned_topics:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Variables and Data Types", "Loops", "Functions and Parameters"]
 *               cv_url:
 *                 type: string
 *                 example: "https://example.com/cv/nguyenvana.pdf"
 *               portfolio_url:
 *                 type: string
 *                 example: "https://github.com/nguyenvana"
 *               linkedin_url:
 *                 type: string
 *                 example: "https://linkedin.com/in/nguyenvana"
 *               status:
 *                 type: string
 *                 example: "pending"
 *           example:
 *             full_name: "Nguyễn Văn A"
 *             email: "nguyenvana@example.com"
 *             phone_number: "+84901234567"
 *             interview_level: "junior"
 *             gender: "male"
 *             skills: ["JavaScript", "React", "HTML", "CSS"]
 *             programming_languages: ["JavaScript", "TypeScript"]
 *             preferred_stack: "frontend"
 *     responses:
 *       201:
 *         description: Candidate created successfully
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Candidate with this email already exists
 *       500:
 *         description: Server error
 */
router.post('/', createCandidate);

module.exports = router;
