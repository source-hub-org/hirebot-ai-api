/**
 * Compatibility Authentication Middleware
 * @module middlewares/compatAuthMiddleware
 *
 * This middleware provides compatibility between the old authentication system
 * and the new OAuth system, allowing both to work during the transition period.
 */

const { authenticate } = require('./oauthMiddleware');
const { verifyAccessToken } = require('./authMiddleware');
const logger = require('../utils/logger');
const userService = require('../services/userService');
const { getAccessToken } = require('../services/oauthTokenService');

/**
 * Middleware that tries OAuth authentication first, then falls back to the old method
 * @returns {Function} Express middleware function
 */
const compatAuthenticate = (options = {}) => {
  const oauthMiddleware = authenticate(options);

  return async (req, res, next) => {
    // Store the original end method to intercept 401 responses
    const originalEnd = res.end;
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
        verifyAccessToken(req, res, err => {
          if (!err && req.user) {
            // If a token is valid and a user is found, attach it as loggedUser
            req.loggedUser = req.user;
          }
          next(err);
        });
      } else {
        // If not a 401, just proceed normally
        res.end = originalEnd;
        res.end(chunk, encoding);
      }
    };

    try {
      // Try OAuth authentication first
      oauthMiddleware(req, res, async err => {
        if (err) {
          // If there's an error, try the old auth method
          logger.debug('OAuth authentication failed, trying legacy auth:', err.message);
          // Restore the original end method
          res.end = originalEnd;
          // Try the old authentication method
          verifyAccessToken(req, res, err => {
            if (!err && req.user) {
              // If token is valid and user is found, attach it as loggedUser
              req.loggedUser = req.user;
            }
            next(err);
          });
        } else if (!oauthFailed) {
          // If OAuth succeeded, and we didn't already handle a failure
          // Restore original end method
          res.end = originalEnd;

          // If a user is found from OAuth, attach it as loggedUser
          if (req.user) {
            req.loggedUser = req.user;
            next();
          } else {
            // If req.user is undefined, try to get user from the token
            try {
              // Get the authorization header
              const authHeader = req.headers.authorization;

              if (authHeader) {
                const parts = authHeader.split(' ');
                if (parts.length === 2 && parts[0] === 'Bearer') {
                  const accessToken = parts[1];

                  // Get token data from the repository
                  const token = await getAccessToken(accessToken);

                  if (token && token.user) {
                    // If token has user ID, get the full user object
                    const userId = token.user._id || token.user.id;
                    if (userId) {
                      const user = await userService.getUserById(userId);
                      if (user) {
                        req.loggedUser = user;
                      }
                    }
                  }
                }
              }
            } catch (error) {
              logger.error('Error getting user from token:', error);
            }

            // Continue to the next middleware regardless of whether we found a user
            next();
          }
        }
      });
    } catch (error) {
      // If OAuth throws an exception, try the old auth method
      logger.error('Error in OAuth authentication, trying legacy auth:', error);
      // Restore the original end method
      res.end = originalEnd;
      // Try the old authentication method
      verifyAccessToken(req, res, err => {
        if (!err && req.user) {
          // If a token is valid and a user is found, attach it as loggedUser
          req.loggedUser = req.user;
        }
        next(err);
      });
    }
  };
};

module.exports = {
  compatAuthenticate,
};
