/**
 * OAuth Authorization Controller
 * @module controllers/oauth/authorizeController
 */

const logger = require('../../utils/logger');

/**
 * Render the authorization form
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const renderAuthorizationForm = (req, res) => {
  // In a real application, you would render a form for the user to approve or deny
  // the authorization request. For simplicity, we'll just render a basic HTML form.

  const { client_id, redirect_uri, response_type, scope, state } = req.query;

  // Log the authorization request (without sensitive data)
  logger.debug('Authorization request received', {
    client_id,
    redirect_uri,
    response_type,
    scope,
    // Don't log state as it might contain sensitive data
  });

  // Render a simple authorization form
  res.send(`
    <html>
      <head>
        <title>Authorize Application</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .container { max-width: 600px; margin: 0 auto; }
          .btn { padding: 10px 15px; margin-right: 10px; cursor: pointer; }
          .btn-approve { background-color: #4CAF50; color: white; border: none; }
          .btn-deny { background-color: #f44336; color: white; border: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Authorize Application</h1>
          <p>An application is requesting access to your account.</p>
          <p>Client ID: ${client_id}</p>
          <p>Redirect URI: ${redirect_uri}</p>
          <p>Scope: ${scope || 'Not specified'}</p>
          
          <form method="post" action="/api/oauth/authorize">
            <input type="hidden" name="client_id" value="${client_id}" />
            <input type="hidden" name="redirect_uri" value="${redirect_uri}" />
            <input type="hidden" name="response_type" value="${response_type}" />
            <input type="hidden" name="scope" value="${scope || ''}" />
            <input type="hidden" name="state" value="${state || ''}" />
            
            <button type="submit" name="approved" value="true" class="btn btn-approve">Approve</button>
            <button type="submit" name="approved" value="false" class="btn btn-deny">Deny</button>
          </form>
        </div>
      </body>
    </html>
  `);
};

/**
 * Handle the authorization form submission
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleAuthorizationDecision = (req, res, next) => {
  // Set the user on the request if the user approved the authorization
  // This is required by the OAuth server middleware

  // In a real application, you would get the user from the session
  // For simplicity, we'll use a test user
  if (req.body.approved === 'true') {
    req.user = {
      id: '1',
      username: 'test',
    };
  }

  // Log the authorization decision
  logger.debug('Authorization decision received', {
    approved: req.body.approved === 'true',
    client_id: req.body.client_id,
    // Don't log other sensitive data
  });

  // The response will be handled by the OAuth server middleware
  next();
};

module.exports = {
  renderAuthorizationForm,
  handleAuthorizationDecision,
};
