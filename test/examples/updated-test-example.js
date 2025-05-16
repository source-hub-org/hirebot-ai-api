/**
 * Example of an updated test file that works with OAuth middleware
 */

const request = require('supertest');
const { app, initializeApp } = require('../../src/index');
const { addAuthorizationHeader } = require('../helpers/oauthTestHelper');

describe('Example Test with OAuth', () => {
  let server;

  beforeAll(async () => {
    // Initialize the app
    const result = await initializeApp();
    server = result.server;
  });

  afterAll(async () => {
    // Close the server
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  });

  it('should access a protected route with OAuth token', async () => {
    // Create a request with the authorization header
    const response = await addAuthorizationHeader(request(app).get('/api/some-protected-route'));

    // Assert the response
    expect(response.status).toBe(200);
    // Add more assertions as needed
  });
});
