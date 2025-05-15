/**
 * Example Routes
 * @module routes/exampleRoutes
 */

const express = require('express');
const router = express.Router();
const { verifyScope, optionalAuth } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/examples/protected:
 *   get:
 *     summary: Protected example endpoint
 *     description: An example of a protected endpoint that requires authentication
 *     tags: [Examples]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This is a protected endpoint
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/protected', (req, res) => {
  // The verifyAccessToken middleware has already verified the token
  // and added the user info to the request object
  res.json({
    message: 'This is a protected endpoint',
    user: req.user,
  });
});

/**
 * @swagger
 * /api/examples/admin:
 *   get:
 *     summary: Admin-only endpoint
 *     description: An example of an endpoint that requires the 'admin' scope
 *     tags: [Examples]
 *     security:
 *       - bearerAuth: [admin]
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This is an admin-only endpoint
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient scope
 */
router.get('/admin', verifyScope('admin'), (req, res) => {
  res.json({
    message: 'This is an admin-only endpoint',
    user: req.user,
  });
});

/**
 * @swagger
 * /api/examples/optional:
 *   get:
 *     summary: Optional authentication endpoint
 *     description: An example of an endpoint with optional authentication
 *     tags: [Examples]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This endpoint works with or without authentication
 *                 authenticated:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   nullable: true
 */
router.get('/optional', optionalAuth, (req, res) => {
  res.json({
    message: 'This endpoint works with or without authentication',
    authenticated: !!req.user,
    user: req.user || null,
  });
});

module.exports = router;
