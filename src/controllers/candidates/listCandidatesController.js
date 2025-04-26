/**
 * List Candidates Controller
 * @module controllers/candidates/listCandidatesController
 */

const { getCandidateList } = require('../../repository/candidateRepository');
const logger = require('../../utils/logger');

/**
 * Load pagination utilities
 * @returns {Object} Pagination utility functions
 */
const loadPaginationUtils = () => {
  return require('../../utils/paginationUtils');
};

/**
 * Get all candidates with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Paginated list of candidates
 */
const getAllCandidates = async (req, res) => {
  try {
    // Import pagination utilities
    const { parsePaginationParams, calculatePaginationMetadata, generatePaginationOptions } =
      loadPaginationUtils();

    // Parse and normalize pagination parameters
    const { page, pageSize } = parsePaginationParams(req.query);

    // Generate MongoDB pagination options
    const paginationOptions = generatePaginationOptions(page, pageSize);

    // Get paginated candidates and total count
    const { candidates, total } = await getCandidateList(paginationOptions);

    // Calculate pagination metadata
    const pagination = calculatePaginationMetadata(total, page, pageSize);

    // Return response with data and pagination info
    res.status(200).json({
      success: true,
      data: candidates,
      pagination,
    });
  } catch (error) {
    logger.error('Error in GET /candidates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve candidates',
    });
  }
};

module.exports = {
  getAllCandidates,
};
