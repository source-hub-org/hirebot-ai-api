/**
 * Get All Languages Routes
 * @module routes/languages/getAllLanguagesRoutes
 */

const express = require('express');
const { getAllLanguagesController } = require('../../controllers/languages');

const router = express.Router();

/**
 * @swagger
 * /api/languages:
 *   get:
 *     summary: Retrieve a list of all programming languages
 *     tags: [Languages]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter languages by name (case-insensitive)
 *       - in: query
 *         name: designed_by
 *         schema:
 *           type: string
 *         description: Filter languages by designer (case-insensitive)
 *       - in: query
 *         name: first_appeared
 *         schema:
 *           type: integer
 *         description: Filter languages by first appearance year
 *       - in: query
 *         name: paradigm
 *         schema:
 *           type: string
 *         description: Filter languages by paradigm
 *       - in: query
 *         name: popularity_rank
 *         schema:
 *           type: integer
 *         description: Filter languages by popularity rank
 *       - in: query
 *         name: type_system
 *         schema:
 *           type: string
 *         description: Filter languages by type system (case-insensitive)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: popularity_rank
 *         description: Field to sort by
 *       - in: query
 *         name: sort_direction
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort direction (ascending or descending)
 *     responses:
 *       200:
 *         description: A list of programming languages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Language'
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
router.get('/', getAllLanguagesController);

module.exports = router;
