/**
 * OAuth Test Helper
 * Provides utility functions for OAuth authentication in tests
 */

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Mock OAuth token generation
const generateTestAccessToken = (options = {}) => {
  const {
    userId = 'test-user-id',
    clientId = 'test-client-id',
    scope = 'read write',
    expiresIn = '1h',
  } = options;

  // Create a JWT token (you can use a simple string if you prefer)
  const token = jwt.sign(
    {
      sub: userId,
      client_id: clientId,
      scope,
      jti: uuidv4(),
      iat: Math.floor(Date.now() / 1000),
    },
    'test-secret-key',
    { expiresIn }
  );

  return token;
};

// Add this token to request headers
const addAuthorizationHeader = (request, options = {}) => {
  const token = generateTestAccessToken(options);
  return request.set('Authorization', `Bearer ${token}`);
};

module.exports = {
  generateTestAccessToken,
  addAuthorizationHeader,
};
