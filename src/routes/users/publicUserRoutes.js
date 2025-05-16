/**
 * Public User Routes
 * @module routes/users/publicUserRoutes
 */

const express = require('express');
const router = express.Router();
const userController = require('../../controllers/users/userController');

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Create a new user (public endpoint)
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
 *         description: User created
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', userController.createUser);

module.exports = router;
