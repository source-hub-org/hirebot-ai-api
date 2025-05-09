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

    // Build filter object from query parameters
    const filter = {};

    // Add name filter if provided (case-insensitive partial match)
    if (req.query.name) {
      filter.full_name = { $regex: new RegExp(req.query.name, 'i') };
    }

    // Add email filter if provided (case-insensitive partial match)
    if (req.query.email) {
      filter.email = { $regex: new RegExp(req.query.email, 'i') };
    }

    // Add status filter if provided (exact match)
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Build sort options
    let sort = { createdAt: -1 }; // Default sort by creation date, newest first

    if (req.query.sort_by) {
      const sortField = req.query.sort_by;
      const sortDirection = req.query.sort_direction === 'asc' ? 1 : -1;
      sort = { [sortField]: sortDirection };
    }

    // Generate MongoDB pagination options
    const paginationOptions = {
      ...generatePaginationOptions(page, pageSize),
      filter,
      sort,
    };

    // Get paginated candidates and total count
    const { candidates, total } = await getCandidateList(paginationOptions);

    // Calculate pagination pagination
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
