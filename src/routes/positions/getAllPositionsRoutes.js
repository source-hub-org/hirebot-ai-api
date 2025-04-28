/**
 * Get All Positions Routes
 * @module routes/positions/getAllPositionsRoutes
 */

const express = require('express');
const { getAllPositionsController } = require('../../controllers/positions');

const router = express.Router();

/**
 * @swagger
 * /api/positions:
 *   get:
 *     summary: Retrieve a list of all positions
 *     tags: [Positions]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filter positions by title (case-insensitive)
 *       - in: query
 *         name: slug
 *         schema:
 *           type: string
 *         description: Filter positions by slug (case-insensitive)
 *       - in: query
 *         name: level
 *         schema:
 *           type: integer
 *         description: Filter positions by level
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter positions by active status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: level
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: A list of positions
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
 *                     $ref: '#/components/schemas/Position'
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get('/', getAllPositionsController);

module.exports = router;