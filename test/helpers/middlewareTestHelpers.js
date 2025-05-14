/**
 * Middleware Test Helpers
 * @module test/helpers/middlewareTestHelpers
 * @description Helper functions for testing middleware components
 */

const { ObjectId } = require('mongodb');

/**
 * Creates a mock Express request object
 * @param {string} method - HTTP method (GET or POST)
 * @param {Object} data - Request data (body for POST, query for GET)
 * @returns {Object} Mock request object
 */
function createMockRequest(method, data = {}) {
  return {
    method,
    body: method === 'POST' ? { ...data } : {},
    query: method === 'POST' ? {} : { ...data },
  };
}

/**
 * Creates a mock Express response object
 * @returns {Object} Mock response object with common Express response methods
 */
function createMockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
}

/**
 * Creates a valid MongoDB ObjectId string
 * @returns {string} Valid ObjectId string
 */
function createValidObjectId() {
  return new ObjectId().toString();
}

/**
 * Creates an invalid ObjectId string
 * @returns {string} Invalid ObjectId string
 */
function createInvalidObjectId() {
  return 'invalid-object-id';
}

/**
 * Creates a mock next function for Express middleware
 * @returns {Function} Mock next function
 */
function createMockNext() {
  return jest.fn();
}

module.exports = {
  createMockRequest,
  createMockResponse,
  createValidObjectId,
  createInvalidObjectId,
  createMockNext,
};
