/**
 * Candidate Routes Module
 * @module routes/candidateRoutes
 */

const express = require('express');
const router = express.Router();
const { validateCandidateInput, sanitizeUpdateData } = require('../utils/candidateValidator');
const {
  insertCandidateToDB,
  getCandidateList,
  getCandidateById,
  updateCandidateInDB,
  deleteCandidateById,
  candidateExistsByEmail,
} = require('../repository/candidateRepository');
const logger = require('../utils/logger');

/**
 * @swagger
 * /api/candidates:
 *   get:
 *     summary: Get all candidates with pagination
 *     tags: [Candidates]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of candidates per page
 *     responses:
 *       200:
 *         description: Paginated list of candidates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     page_size:
 *                       type: integer
 *                       example: 20
 *                     total_pages:
 *                       type: integer
 *                       example: 3
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    // Import pagination utilities
    const {
      parsePaginationParams,
      calculatePaginationMetadata,
      generatePaginationOptions,
    } = require('../utils/paginationUtils');

    // Parse and normalize pagination parameters
    const { page, pageSize } = parsePaginationParams(req.query);

    // Generate MongoDB pagination options
    const paginationOptions = generatePaginationOptions(page, pageSize);

    // Get paginated candidates and total count
    const { candidates, total } = await getCandidateList(paginationOptions);

    // Calculate pagination metadata
    const pagination = calculatePaginationMetadata(total, page, pageSize);

    // Return response with data and pagination info
    res.status(200).json({
      success: true,
      data: candidates,
      pagination,
    });
  } catch (error) {
    logger.error('Error in GET /candidates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve candidates',
    });
  }
});

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
router.get('/:id', async (req, res) => {
  try {
    const candidate = await getCandidateById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: 'Candidate not found',
      });
    }

    res.status(200).json({
      success: true,
      data: candidate,
    });
  } catch (error) {
    logger.error(`Error in GET /candidates/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve candidate',
    });
  }
});

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
router.post('/', async (req, res) => {
  try {
    // Validate input
    const validation = validateCandidateInput(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors,
      });
    }

    // Check if candidate with this email already exists
    const emailExists = await candidateExistsByEmail(req.body.email);
    if (emailExists) {
      return res.status(409).json({
        success: false,
        error: 'A candidate with this email already exists',
      });
    }

    // Insert candidate
    const newCandidate = await insertCandidateToDB(req.body);

    res.status(201).json({
      success: true,
      data: newCandidate,
      message: 'Candidate created successfully',
    });
  } catch (error) {
    logger.error('Error in POST /candidates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create candidate',
    });
  }
});

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
router.put('/:id', async (req, res) => {
  try {
    // Check if candidate exists
    const existingCandidate = await getCandidateById(req.params.id);

    if (!existingCandidate) {
      return res.status(404).json({
        success: false,
        error: 'Candidate not found',
      });
    }

    // Validate input
    const validation = validateCandidateInput({
      ...existingCandidate,
      ...req.body,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors,
      });
    }

    // Check if email is being changed and if it's already in use
    if (req.body.email && req.body.email !== existingCandidate.email) {
      const emailExists = await candidateExistsByEmail(req.body.email, req.params.id);
      if (emailExists) {
        return res.status(409).json({
          success: false,
          error: 'This email is already in use by another candidate',
        });
      }
    }

    // Sanitize update data
    const updateData = sanitizeUpdateData(req.body);

    // Update candidate
    const updatedCandidate = await updateCandidateInDB(req.params.id, updateData);

    res.status(200).json({
      success: true,
      data: updatedCandidate,
      message: 'Candidate updated successfully',
    });
  } catch (error) {
    logger.error(`Error in PUT /candidates/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to update candidate',
    });
  }
});

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
router.delete('/:id', async (req, res) => {
  try {
    // Check if candidate exists
    const existingCandidate = await getCandidateById(req.params.id);

    if (!existingCandidate) {
      return res.status(404).json({
        success: false,
        error: 'Candidate not found',
      });
    }

    // Delete candidate
    const deleted = await deleteCandidateById(req.params.id);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete candidate',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Candidate deleted successfully',
    });
  } catch (error) {
    logger.error(`Error in DELETE /candidates/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete candidate',
    });
  }
});

module.exports = router;
