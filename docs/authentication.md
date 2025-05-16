# Authentication Guide

This document explains how to authenticate with the API and access protected resources.

## OAuth 2.0 Authentication

The API uses OAuth 2.0 for authentication. The following grant types are supported:

- Password Grant (Resource Owner Password Credentials)
- Refresh Token Grant
- Authorization Code Grant

### Getting an Access Token

#### Password Grant

```bash
curl -X POST http://localhost:3000/api/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=test-client&client_secret=test-secret&username=test&password=password"
```

#### Refresh Token Grant

```bash
curl -X POST http://localhost:3000/api/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token&client_id=test-client&client_secret=test-secret&refresh_token=YOUR_REFRESH_TOKEN"
```

#### Authorization Code Grant

First, redirect the user to:

```
http://localhost:3000/api/oauth/authorize?response_type=code&client_id=test-client&redirect_uri=http://localhost:3000/oauth/callback
```

Then exchange the code for a token:

```bash
curl -X POST http://localhost:3000/api/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&client_id=test-client&client_secret=test-secret&code=AUTHORIZATION_CODE&redirect_uri=http://localhost:3000/oauth/callback"
```

### Using the Access Token

To access protected resources, include the access token in the Authorization header:

```bash
curl -X GET http://localhost:3000/api/questions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Protected Routes

All API routes except the following require authentication:

- `/api/health-check` - Health check endpoint
- `/api/oauth/*` - OAuth endpoints

## Example Routes

The API includes example routes to demonstrate different authentication scenarios:

### Protected Endpoint

Requires a valid access token:

```bash
curl -X GET http://localhost:3000/api/examples/protected \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Admin-Only Endpoint

Requires a valid access token with the 'admin' scope:

```bash
curl -X GET http://localhost:3000/api/examples/admin \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Optional Authentication Endpoint

Works with or without authentication:

```bash
# Without authentication
curl -X GET http://localhost:3000/api/examples/optional

# With authentication
curl -X GET http://localhost:3000/api/examples/optional \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Token Response Format

A successful token request will return a JSON response like this:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "def502003b1308..."
}
```

## Error Responses

### Unauthorized (401)

Returned when no token is provided or the token is invalid:

```json
{
  "error": "unauthorized",
  "error_description": "Access token is required"
}
```

### Forbidden (403)

Returned when the token doesn't have the required scope:

```json
{
  "error": "insufficient_scope",
  "error_description": "Scope 'admin' is required"
}
```

## Implementation Details

The authentication middleware is implemented in `src/middlewares/authMiddleware.js` and provides the following functions:

- `verifyAccessToken`: Middleware to verify access token for protected routes
- `verifyScope`: Middleware to verify access token with specific scope
- `optionalAuth`: Middleware to make authentication optional

These middlewares can be used in route definitions as follows:

```javascript
const { verifyAccessToken, verifyScope, optionalAuth } = require('../middlewares/authMiddleware');

// Route that requires authentication
router.get('/protected', verifyAccessToken, (req, res) => {
  res.json({ user: req.user });
});

// Route that requires a specific scope
router.get('/admin', verifyScope('admin'), (req, res) => {
  res.json({ user: req.user });
});

// Route with optional authentication
router.get('/optional', optionalAuth, (req, res) => {
  res.json({ authenticated: !!req.user, user: req.user || null });
});
```
