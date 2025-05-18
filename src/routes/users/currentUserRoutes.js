/**
 * Current User Routes
 * @module routes/users/currentUserRoutes
 */

const express = require('express');
const router = express.Router();
const { getLoggedUser } = require('../../controllers/users/getLoggedUserController');

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get logged in user's profile
 *     description: Retrieves the profile of the currently authenticated user from req.loggedUser, including linked candidate information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User profile retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: User ID
 *                       example: 60d21b4667d0d8992e610c85
 *                     username:
 *                       type: string
 *                       description: Username
 *                       example: johndoe
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: Email address
 *                       example: john.doe@example.com
 *                     candidate_id:
 *                       type: string
 *                       description: Candidate ID reference
 *                       example: 60d21b4667d0d8992e610c86
 *                     candidate:
 *                       $ref: '#/components/schemas/Candidate'
 *                       description: Populated candidate information
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Creation timestamp
 *                       example: 2025-05-16T10:23:20.335Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Last update timestamp
 *                       example: 2025-05-16T10:23:20.335Z
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       404:
 *         description: User not found or invalid user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: User not found
 *                 data:
 *                   type: object
 *                   example: {}
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/me', getLoggedUser);

module.exports = router;
