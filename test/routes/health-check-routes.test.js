/**
 * Automated tests for health check routes
 * @module test/health-check-routes.test
 */

const request = require('supertest');
const express = require('express');
const { getConnectionInfo } = require('../../src/repository/baseRepository');

// Mock the baseRepository module
jest.mock('../../src/repository/baseRepository');

// Create an Express app for testing
const app = express();
const healthCheckRoutes = require('../../src/routes/health-check');
app.use('/api/health-check', healthCheckRoutes);

describe('Health Check Routes Tests', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();
  });

  describe('GET /api/health-check/database', () => {
    test('should return 200 and connection info when database is connected', async () => {
      // Mock the getConnectionInfo function to return a successful connection
      getConnectionInfo.mockReturnValue({
        isConnected: true,
        serverAddress: 'mongodb://localhost:27017',
        dbName: 'hirebot_db_test',
      });

      // Make a request to the endpoint
      const response = await request(app).get('/api/health-check/database');

      // Assert the response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        data: {
          isConnected: true,
          serverAddress: 'mongodb://localhost:27017',
          dbName: 'hirebot_db_test',
        },
      });

      // Verify that getConnectionInfo was called
      expect(getConnectionInfo).toHaveBeenCalled();
    });

    test('should return 200 and connection info when database is disconnected', async () => {
      // Mock the getConnectionInfo function to return a disconnected state
      getConnectionInfo.mockReturnValue({
        isConnected: false,
        serverAddress: null,
        dbName: null,
      });

      // Make a request to the endpoint
      const response = await request(app).get('/api/health-check/database');

      // Assert the response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        data: {
          isConnected: false,
          serverAddress: null,
          dbName: null,
        },
      });

      // Verify that getConnectionInfo was called
      expect(getConnectionInfo).toHaveBeenCalled();
    });

    test('should return 500 when an error occurs', async () => {
      // Mock the getConnectionInfo function to throw an error
      const errorMessage = 'Database connection error';
      getConnectionInfo.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      // Make a request to the endpoint
      const response = await request(app).get('/api/health-check/database');

      // Assert the response
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        status: 'error',
        message: 'Failed to check database connection',
        error: errorMessage,
      });

      // Verify that getConnectionInfo was called
      expect(getConnectionInfo).toHaveBeenCalled();
    });
  });
});
