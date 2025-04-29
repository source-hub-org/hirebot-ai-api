/**
 * Get Language By ID Routes
 * @module routes/languages/getLanguageByIdRoutes
 */

const express = require('express');
const { getLanguageByIdController } = require('../../controllers/languages');

const router = express.Router();

/**
 * @swagger
 * /api/languages/{id}:
 *   get:
 *     summary: Get a programming language by ID
 *     tags: [Languages]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The language ID
 *     responses:
 *       200:
 *         description: A programming language object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Language'
 *       404:
 *         description: Language not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getLanguageByIdController);

module.exports = router;
