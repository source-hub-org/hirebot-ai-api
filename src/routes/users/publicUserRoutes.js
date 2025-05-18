/**
 * Public User Routes
 * @module routes/users/publicUserRoutes
 */

const express = require('express');
const router = express.Router();
const { createUserController } = require('../../controllers/users/createUserController');

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Create a new user (public endpoint)
 *     description: Creates a new user and automatically links them to a candidate with the same email. If no candidate exists, a new one is created.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User created and linked to candidate
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
 *                   example: User created successfully and linked to candidate
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
 *       400:
 *         description: Invalid input
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
 *                   example: Email already in use
 *                 data:
 *                   type: object
 *       500:
 *         description: Server error
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
 *                   example: Internal server error
 *                 data:
 *                   type: object
 */
router.post('/', createUserController);

module.exports = router;
