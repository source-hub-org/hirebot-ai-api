/**
 * Candidate Routes Index
 * @module routes/candidates
 */

const express = require('express');
const router = express.Router();
const listCandidatesRoutes = require('./listCandidatesRoutes');
const getCandidateRoutes = require('./getCandidateRoutes');
const createCandidateRoutes = require('./createCandidateRoutes');
const updateCandidateRoutes = require('./updateCandidateRoutes');
const deleteCandidateRoutes = require('./deleteCandidateRoutes');

/**
 * @swagger
 * tags:
 *   name: Candidates
 *   description: Candidate management endpoints
 */

// Mount the candidate routes
router.use('/', listCandidatesRoutes);
router.use('/', getCandidateRoutes);
router.use('/', createCandidateRoutes);
router.use('/', updateCandidateRoutes);
router.use('/', deleteCandidateRoutes);

module.exports = router;
