/**
 * Response Utilities for Authentication
 * @module middlewares/auth-utils/responseUtils
 */

const { attemptLegacyAuth } = require('./legacyAuthUtils');

/**
 * Override response end method to intercept 401 responses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @param {Function} originalEnd - Original res.end method
 * @returns {Object} - Object with restore method and oauthFailed flag
 */
const overrideResponseEnd = (req, res, next, originalEnd) => {
  let oauthFailed = false;

  // Override res.end to detect OAuth authentication failure
  res.end = function (chunk, encoding) {
    // If OAuth middleware returned a 401, we'll try the old auth method
    if (res.statusCode === 401) {
      oauthFailed = true;

      // Restore the original end method
      res.end = originalEnd;

      // Reset response
      res.statusCode = 200;

      // Try the old authentication method
      attemptLegacyAuth(req, res).then(err => {
        next(err);
      });
    } else {
      // If not a 401, just proceed normally
      res.end = originalEnd;
      res.end(chunk, encoding);
    }
  };

  return {
    oauthFailed: () => oauthFailed,
    restore: () => {
      res.end = originalEnd;
    },
  };
};

module.exports = {
  overrideResponseEnd,
};
