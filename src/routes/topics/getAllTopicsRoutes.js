/**
 * Get All Topics Routes
 * @module routes/topics/getAllTopicsRoutes
 */

const express = require('express');
const { getAllTopicsController } = require('../../controllers/topics/getAllTopicsController');

const router = express.Router();

/**
 * @swagger
 * /api/topics:
 *   get:
 *     summary: Get all topics
 *     description: Retrieve a list of all available topics
 *     tags: [Topics]
 *     responses:
 *       200:
 *         description: A list of topics
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
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "Biến và kiểu dữ liệu"
 *                       difficulty:
 *                         type: number
 *                         example: 1
 *                       popularity:
 *                         type: string
 *                         example: "low"
 *                       suitable_level:
 *                         type: string
 *                         example: "intern"
 *                       description:
 *                         type: string
 *                         example: "Chủ đề liên quan đến biến và kiểu dữ liệu, thường gặp trong phỏng vấn lập trình viên."
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
 *                   example: Failed to retrieve topics.
 */
router.get('/', getAllTopicsController);

module.exports = router;
