/**
 * Delete Language Routes
 * @module routes/languages/deleteLanguageRoutes
 */

const express = require('express');
const { deleteLanguageController } = require('../../controllers/languages');

const router = express.Router();

/**
 * @swagger
 * /api/languages/{id}:
 *   delete:
 *     summary: Delete a programming language by ID
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
 *         description: Language deleted successfully
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
 *                   example: Language deleted successfully.
 *       404:
 *         description: Language not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteLanguageController);

module.exports = router;
