/**
 * Mock OAuth Middleware for Testing
 *
 * This mock middleware is used in test environments to bypass authentication.
 * It simply passes the request through without any actual authentication checks.
 */

// Mock authentication middleware that does nothing
const authenticate = () => {
  return (req, res, next) => {
    // Add a mock user to the request
    req.user = {
      _id: '60d21b4667d0d8992e610c85',
      username: 'johndoe',
      email: 'test@example.com',
    };
    req.loggedUser = {
      _id: '60d21b4667d0d8992e610c85',
      username: 'johndoe',
      email: 'test@example.com',
    };
    next();
  };
};

module.exports = {
  authenticate,
};
