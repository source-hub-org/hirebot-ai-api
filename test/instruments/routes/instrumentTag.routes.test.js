/**
 * Instrument Tag Routes Tests
 * @module test/instruments/routes/instrumentTag.routes.test
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const instrumentTagRoutes = require('../../../src/routes/instrument-tags');
const InstrumentTag = require('../../../src/models/instrumentTagModel');

// Mock the logger
jest.mock('../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

/**
 * Test the instrument tag routes
 */
describe('Instrument Tag Routes', () => {
  let app;
  let mongoServer;

  // Setup Express app and MongoDB Memory Server before tests
  beforeAll(async () => {
    // Create Express app
    app = express();
    app.use(express.json());
    app.use('/api/instrument-tags', instrumentTagRoutes);

    // Setup MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  // Clean up after tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // Clear the database between tests
  afterEach(async () => {
    await InstrumentTag.deleteMany({});
  });

  /**
   * Test the POST /api/instrument-tags endpoint
   */
  const testCreateInstrumentTag = () => {
    describe('POST /api/instrument-tags', () => {
      it('should create a new instrument tag', async () => {
        // Arrange
        const tagData = {
          name: 'Personality',
          description: 'Tags related to personality tests and measurements.',
        };

        // Act
        const response = await request(app)
          .post('/api/instrument-tags')
          .send(tagData)
          .expect('Content-Type', /json/)
          .expect(201);

        // Assert
        expect(response.body.status).toBe('success');
        expect(response.body.data).toHaveProperty('_id');
        expect(response.body.data.name).toBe(tagData.name);
        expect(response.body.data.description).toBe(tagData.description);
        expect(response.body.data).toHaveProperty('createdAt');
        expect(response.body.data).toHaveProperty('updatedAt');

        // Verify the tag was saved to the database
        const savedTag = await InstrumentTag.findById(response.body.data._id);
        expect(savedTag).not.toBeNull();
        expect(savedTag.name).toBe(tagData.name);
      });

      it('should return 400 for missing required fields', async () => {
        // Arrange
        const tagData = {
          // Missing name
          description: 'Tags related to personality tests and measurements.',
        };

        // Act
        const response = await request(app)
          .post('/api/instrument-tags')
          .send(tagData)
          .expect('Content-Type', /json/)
          .expect(400);

        // Assert
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Failed to create instrument tag.');
        expect(response.body.errors).toContain('Tag name is required');
      });

      it('should return 400 for duplicate tag name', async () => {
        // Arrange
        const tagData = {
          name: 'Personality',
          description: 'Tags related to personality tests and measurements.',
        };

        // Create a tag first
        await InstrumentTag.create(tagData);

        // Act - Try to create another tag with the same name
        const response = await request(app)
          .post('/api/instrument-tags')
          .send(tagData)
          .expect('Content-Type', /json/)
          .expect(400);

        // Assert
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Failed to create instrument tag.');
        expect(response.body.errors).toContain('Tag with this name already exists');
      });
    });
  };

  /**
   * Test the GET /api/instrument-tags endpoint
   */
  const testGetAllInstrumentTags = () => {
    describe('GET /api/instrument-tags', () => {
      it('should return all instrument tags', async () => {
        // Arrange
        const tags = [
          {
            name: 'Personality',
            description: 'Tags related to personality tests and measurements.',
          },
          {
            name: 'Cognitive',
            description: 'Tags related to cognitive abilities.',
          },
        ];

        // Create tags in the database
        await InstrumentTag.insertMany(tags);

        // Act
        const response = await request(app)
          .get('/api/instrument-tags')
          .expect('Content-Type', /json/)
          .expect(200);

        // Assert
        expect(response.body.status).toBe('success');
        expect(response.body.data).toHaveLength(2);
        expect(response.body.data[0].name).toBe(tags[0].name);
        expect(response.body.data[1].name).toBe(tags[1].name);
      });

      it('should return an empty array when no tags exist', async () => {
        // Act
        const response = await request(app)
          .get('/api/instrument-tags')
          .expect('Content-Type', /json/)
          .expect(200);

        // Assert
        expect(response.body.status).toBe('success');
        expect(response.body.data).toHaveLength(0);
      });
    });
  };

  /**
   * Test the GET /api/instrument-tags/:id endpoint
   */
  const testGetInstrumentTagById = () => {
    describe('GET /api/instrument-tags/:id', () => {
      it('should return a specific instrument tag by ID', async () => {
        // Arrange
        const tagData = {
          name: 'Personality',
          description: 'Tags related to personality tests and measurements.',
        };

        // Create a tag in the database
        const createdTag = await InstrumentTag.create(tagData);

        // Act
        const response = await request(app)
          .get(`/api/instrument-tags/${createdTag._id}`)
          .expect('Content-Type', /json/)
          .expect(200);

        // Assert
        expect(response.body.status).toBe('success');
        expect(response.body.data._id).toBe(createdTag._id.toString());
        expect(response.body.data.name).toBe(tagData.name);
        expect(response.body.data.description).toBe(tagData.description);
      });

      it('should return 404 for non-existent tag ID', async () => {
        // Arrange
        const nonExistentId = new mongoose.Types.ObjectId();

        // Act
        const response = await request(app)
          .get(`/api/instrument-tags/${nonExistentId}`)
          .expect('Content-Type', /json/)
          .expect(404);

        // Assert
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Failed to retrieve instrument tag.');
        expect(response.body.errors).toContain('Tag not found');
      });

      it('should return 400 for invalid tag ID format', async () => {
        // Act
        const response = await request(app)
          .get('/api/instrument-tags/invalid-id')
          .expect('Content-Type', /json/)
          .expect(400);

        // Assert
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Failed to retrieve instrument tag.');
        expect(response.body.errors).toContain('Invalid tag ID format');
      });
    });
  };

  /**
   * Test the PUT /api/instrument-tags/:id endpoint
   */
  const testUpdateInstrumentTag = () => {
    describe('PUT /api/instrument-tags/:id', () => {
      it('should update an existing instrument tag', async () => {
        // Arrange
        const tagData = {
          name: 'Personality',
          description: 'Tags related to personality tests and measurements.',
        };

        // Create a tag in the database
        const createdTag = await InstrumentTag.create(tagData);

        const updateData = {
          name: 'Updated Personality',
          description: 'Updated description',
        };

        // Act
        const response = await request(app)
          .put(`/api/instrument-tags/${createdTag._id}`)
          .send(updateData)
          .expect('Content-Type', /json/)
          .expect(200);

        // Assert
        expect(response.body.status).toBe('success');
        expect(response.body.data._id).toBe(createdTag._id.toString());
        expect(response.body.data.name).toBe(updateData.name);
        expect(response.body.data.description).toBe(updateData.description);

        // Verify the tag was updated in the database
        const updatedTag = await InstrumentTag.findById(createdTag._id);
        expect(updatedTag.name).toBe(updateData.name);
        expect(updatedTag.description).toBe(updateData.description);
      });

      it('should return 404 for non-existent tag ID', async () => {
        // Arrange
        const nonExistentId = new mongoose.Types.ObjectId();
        const updateData = {
          name: 'Updated Personality',
          description: 'Updated description',
        };

        // Act
        const response = await request(app)
          .put(`/api/instrument-tags/${nonExistentId}`)
          .send(updateData)
          .expect('Content-Type', /json/)
          .expect(404);

        // Assert
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Failed to update instrument tag.');
        expect(response.body.errors).toContain('Tag not found');
      });

      it('should return 400 for missing required fields', async () => {
        // Arrange
        const tagData = {
          name: 'Personality',
          description: 'Tags related to personality tests and measurements.',
        };

        // Create a tag in the database
        const createdTag = await InstrumentTag.create(tagData);

        const updateData = {
          // Missing name
          description: 'Updated description',
        };

        // Act
        const response = await request(app)
          .put(`/api/instrument-tags/${createdTag._id}`)
          .send(updateData)
          .expect('Content-Type', /json/)
          .expect(400);

        // Assert
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Failed to update instrument tag.');
        expect(response.body.errors).toContain('Tag name is required');
      });

      it('should return 400 for duplicate tag name', async () => {
        // Arrange
        const tag2 = await InstrumentTag.create({
          name: 'Cognitive',
          description: 'Tags related to cognitive abilities.',
        });

        const updateData = {
          name: 'Personality', // Duplicate name (already used by tag1)
          description: 'Updated description',
        };

        // Act - Try to update tag2 with a name that already exists
        const response = await request(app)
          .put(`/api/instrument-tags/${tag2._id}`)
          .send(updateData)
          .expect('Content-Type', /json/)
          .expect(400);

        // Assert
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Failed to update instrument tag.');
        expect(response.body.errors).toContain('Tag with this name already exists');
      });
    });
  };

  /**
   * Test the DELETE /api/instrument-tags/:id endpoint
   */
  const testDeleteInstrumentTag = () => {
    describe('DELETE /api/instrument-tags/:id', () => {
      it('should delete an existing instrument tag', async () => {
        // Arrange
        const tagData = {
          name: 'Personality',
          description: 'Tags related to personality tests and measurements.',
        };

        // Create a tag in the database
        const createdTag = await InstrumentTag.create(tagData);

        // Act
        const response = await request(app)
          .delete(`/api/instrument-tags/${createdTag._id}`)
          .expect('Content-Type', /json/)
          .expect(200);

        // Assert
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBe('Instrument tag deleted successfully');
        expect(response.body.data._id).toBe(createdTag._id.toString());

        // Verify the tag was deleted from the database
        const deletedTag = await InstrumentTag.findById(createdTag._id);
        expect(deletedTag).toBeNull();
      });

      it('should return 404 for non-existent tag ID', async () => {
        // Arrange
        const nonExistentId = new mongoose.Types.ObjectId();

        // Act
        const response = await request(app)
          .delete(`/api/instrument-tags/${nonExistentId}`)
          .expect('Content-Type', /json/)
          .expect(404);

        // Assert
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Failed to delete instrument tag.');
        expect(response.body.errors).toContain('Tag not found');
      });

      it('should return 400 for invalid tag ID format', async () => {
        // Act
        const response = await request(app)
          .delete('/api/instrument-tags/invalid-id')
          .expect('Content-Type', /json/)
          .expect(400);

        // Assert
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Failed to delete instrument tag.');
        expect(response.body.errors).toContain('Invalid tag ID format');
      });
    });
  };

  // Run all test functions
  testCreateInstrumentTag();
  testGetAllInstrumentTags();
  testGetInstrumentTagById();
  testUpdateInstrumentTag();
  testDeleteInstrumentTag();
});
