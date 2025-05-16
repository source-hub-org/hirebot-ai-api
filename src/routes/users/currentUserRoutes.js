/**
 * Current User Routes
 * @module routes/users/currentUserRoutes
 */

const express = require('express');
const router = express.Router();
const { getCurrentUser } = require('../../controllers/users/getCurrentUserController');

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get logged in user's profile
 *     description: Retrieves the profile of the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/me', getCurrentUser);

module.exports = router;
