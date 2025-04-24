/**
 * Tests for the question generation routes
 */

const request = require('supertest');
const { app, initializeApp } = require('../src/index');

describe('Question Routes', () => {
  let server;

  beforeAll(async () => {
    // This might take some time due to MongoDB connection
    jest.setTimeout(10000);
    const result = await initializeApp();
    server = result.server;
  });

  afterAll(async () => {
    // Close the server
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }

    // Close the MongoDB connection
    const { closeConnection } = require('../src/repository/baseRepository');
    await closeConnection();
  });

  describe('POST /api/questions/generate', () => {
    it('should validate required fields', async () => {
      const response = await request(app).post('/api/questions/generate').send({
        // Missing required fields
      });

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should validate position value', async () => {
      const response = await request(app).post('/api/questions/generate').send({
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'invalid_position', // Invalid: not in the allowed list
      });

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('error');
      expect(response.body.errors).toContain(
        'Position must be one of: intern, fresher, junior, middle, senior, expert'
      );
    });

    // This test is commented out because it would actually call the Gemini AI
    // Uncomment and run manually when needed
    /*
    it('should generate questions successfully', async () => {
      // This test might take some time due to AI generation
      jest.setTimeout(30000);
      
      const response = await request(app)
        .post('/api/questions/generate')
        .send({
          topic: 'JavaScript Arrays',
          language: 'JavaScript',
          position: 'junior'
        });

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Check the structure of the first question
      const firstQuestion = response.body.data[0];
      expect(firstQuestion).toHaveProperty('question');
      expect(firstQuestion).toHaveProperty('options');
      expect(firstQuestion.options).toBeInstanceOf(Array);
      expect(firstQuestion.options.length).toBe(4);
      expect(firstQuestion).toHaveProperty('correctAnswer');
      expect(firstQuestion).toHaveProperty('explanation');
      expect(firstQuestion).toHaveProperty('difficulty');
      expect(firstQuestion).toHaveProperty('category');
      expect(firstQuestion).toHaveProperty('topic');
      expect(firstQuestion).toHaveProperty('language');
      expect(firstQuestion).toHaveProperty('position');
      expect(firstQuestion).toHaveProperty('positionLevel');
      expect(firstQuestion).toHaveProperty('createdAt');
    });
    */
  });
});
