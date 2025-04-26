/**
 * Submission Routes Index
 * @module routes/submissions
 */

const express = require('express');
const router = express.Router();
const createSubmissionRoutes = require('./createSubmissionRoutes');
const getSubmissionRoutes = require('./getSubmissionRoutes');
const getCandidateSubmissionsRoutes = require('./getCandidateSubmissionsRoutes');

/**
 * @swagger
 * tags:
 *   name: Submissions
 *   description: Submission management endpoints
 */

// Mount the submission routes
router.use('/', createSubmissionRoutes);
router.use('/', getSubmissionRoutes);
router.use('/', getCandidateSubmissionsRoutes);

module.exports = router;
