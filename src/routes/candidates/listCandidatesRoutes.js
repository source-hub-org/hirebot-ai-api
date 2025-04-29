/**
 * List Candidates Routes
 * @module routes/candidates/listCandidatesRoutes
 */

const express = require('express');
const router = express.Router();
const { getAllCandidates } = require('../../controllers/candidates/listCandidatesController');

/**
 * @swagger
 * /api/candidates:
 *   get:
 *     summary: Get all candidates with pagination, filtering, and sorting
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
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter candidates by name (case-insensitive partial match)
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter candidates by email (case-insensitive partial match)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter candidates by status (exact match)
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [full_name, email, createdAt, updatedAt]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order (ascending or descending)
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
router.get('/', getAllCandidates);

module.exports = router;
