/**
 * Create Language Routes
 * @module routes/languages/createLanguageRoutes
 */

const express = require('express');
const { createLanguageController } = require('../../controllers/languages');

const router = express.Router();

/**
 * @swagger
 * /api/languages:
 *   post:
 *     summary: Create a new programming language
 *     tags: [Languages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - designed_by
 *               - first_appeared
 *               - paradigm
 *               - usage
 *               - popularity_rank
 *               - type_system
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the programming language
 *               designed_by:
 *                 type: string
 *                 description: The designer(s) of the language
 *               first_appeared:
 *                 type: integer
 *                 description: The year the language first appeared
 *               paradigm:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Programming paradigms supported by the language
 *               usage:
 *                 type: string
 *                 description: Common usage areas for the language
 *               popularity_rank:
 *                 type: integer
 *                 description: Popularity ranking of the language
 *               type_system:
 *                 type: string
 *                 description: Type system characteristics
 *               slug:
 *                 type: string
 *                 description: URL-friendly identifier (optional, generated from name if not provided)
 *     responses:
 *       201:
 *         description: Language created successfully
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
 *                   example: Language created successfully.
 *                 data:
 *                   $ref: '#/components/schemas/Language'
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Language with the same name or slug already exists
 *       500:
 *         description: Server error
 */
router.post('/', createLanguageController);

module.exports = router;
