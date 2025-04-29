/**
 * Update Language Routes
 * @module routes/languages/updateLanguageRoutes
 */

const express = require('express');
const { updateLanguageController } = require('../../controllers/languages');

const router = express.Router();

/**
 * @swagger
 * /api/languages/{id}:
 *   put:
 *     summary: Update a programming language by ID
 *     tags: [Languages]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The language ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *                 description: URL-friendly identifier
 *     responses:
 *       200:
 *         description: Language updated successfully
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
 *                   example: Language updated successfully.
 *                 data:
 *                   $ref: '#/components/schemas/Language'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Language not found
 *       409:
 *         description: Language with the same name or slug already exists
 *       500:
 *         description: Server error
 */
router.put('/:id', updateLanguageController);

module.exports = router;
