/**
 * Authentication Utilities Index
 * @module middlewares/auth-utils
 */

const tokenUtils = require('./tokenUtils');
const legacyAuthUtils = require('./legacyAuthUtils');
const responseUtils = require('./responseUtils');

module.exports = {
  ...tokenUtils,
  ...legacyAuthUtils,
  ...responseUtils,
};
