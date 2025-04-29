const request = require('supertest');
const { app, initializeApp } = require('../../src/index');
const { closeConnection } = require('../../src/repository/baseRepository');
const mongoose = require('mongoose');
const Position = require('../../src/models/positionModel');

describe('Position Routes', () => {
  let server;
  let testPosition;

  beforeAll(async () => {
    const result = await initializeApp();
    server = result.server;
  });

  afterAll(async () => {
    await Position.deleteMany({});
    await mongoose.disconnect();
    await closeConnection();
    server.close();
  });

  beforeEach(async () => {
    await Position.deleteMany({});

    // Create a test position
    testPosition = await Position.create({
      slug: 'test-position',
      title: 'Test Position',
      description: 'This is a test position',
      instruction: 'Test instruction',
      level: 3,
      is_active: true,
    });
  });

  describe('GET /api/positions', () => {
    it('should return all positions', async () => {
      const res = await request(app).get('/api/positions');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].slug).toBe('test-position');
    });

    it('should filter positions by query parameters', async () => {
      // Create another position
      await Position.create({
        slug: 'another-position',
        title: 'Another Position',
        description: 'This is another test position',
        instruction: 'Another test instruction',
        level: 4,
        is_active: false,
      });

      // Test filtering by level
      const res1 = await request(app).get('/api/positions?level=3');
      expect(res1.status).toBe(200);
      expect(res1.body.data.length).toBe(1);
      expect(res1.body.data[0].slug).toBe('test-position');

      // Test filtering by is_active
      const res2 = await request(app).get('/api/positions?is_active=false');
      expect(res2.status).toBe(200);
      expect(res2.body.data.length).toBe(1);
      expect(res2.body.data[0].slug).toBe('another-position');
    });
  });

  describe('GET /api/positions/:id', () => {
    it('should return a position by ID', async () => {
      const res = await request(app).get(`/api/positions/${testPosition._id}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.slug).toBe('test-position');
      expect(res.body.data.title).toBe('Test Position');
    });

    it('should return 404 if position not found', async () => {
      const res = await request(app).get('/api/positions/60d21b4667d0d8992e610c85');

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('not found');
    });
  });

  describe('POST /api/positions', () => {
    it('should create a new position', async () => {
      const newPosition = {
        slug: 'new-position',
        title: 'New Position',
        description: 'This is a new position',
        instruction: 'New instruction',
        level: 2,
        is_active: true,
      };

      const res = await request(app).post('/api/positions').send(newPosition);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.slug).toBe('new-position');
      expect(res.body.data.title).toBe('New Position');

      // Verify it was saved to the database
      const savedPosition = await Position.findOne({ slug: 'new-position' });
      expect(savedPosition).not.toBeNull();
      expect(savedPosition.level).toBe(2);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidPosition = {
        slug: 'invalid-position',
        // Missing required fields
      };

      const res = await request(app).post('/api/positions').send(invalidPosition);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
    });

    it('should return 409 if position with same slug already exists', async () => {
      const duplicatePosition = {
        slug: 'test-position', // Same as testPosition
        title: 'Duplicate Position',
        description: 'This is a duplicate position',
        instruction: 'Duplicate instruction',
        level: 1,
        is_active: true,
      };

      const res = await request(app).post('/api/positions').send(duplicatePosition);

      expect(res.status).toBe(409);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('already exists');
    });
  });

  describe('PUT /api/positions/:id', () => {
    it('should update a position by ID', async () => {
      const updateData = {
        title: 'Updated Position',
        level: 4,
      };

      const res = await request(app).put(`/api/positions/${testPosition._id}`).send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.title).toBe('Updated Position');
      expect(res.body.data.level).toBe(4);
      expect(res.body.data.slug).toBe('test-position'); // Unchanged

      // Verify it was updated in the database
      const updatedPosition = await Position.findById(testPosition._id);
      expect(updatedPosition.title).toBe('Updated Position');
      expect(updatedPosition.level).toBe(4);
    });

    it('should return 404 if position not found', async () => {
      const res = await request(app)
        .put('/api/positions/60d21b4667d0d8992e610c85')
        .send({ title: 'Not Found Position' });

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('not found');
    });

    it('should return 409 if updating to a slug that already exists', async () => {
      // Create another position
      await Position.create({
        slug: 'another-position',
        title: 'Another Position',
        description: 'This is another test position',
        instruction: 'Another test instruction',
        level: 4,
        is_active: true,
      });

      // Try to update testPosition to use the same slug as another position
      const res = await request(app)
        .put(`/api/positions/${testPosition._id}`)
        .send({ slug: 'another-position' });

      expect(res.status).toBe(409);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('already exists');
    });
  });

  describe('DELETE /api/positions/:id', () => {
    it('should delete a position by ID', async () => {
      const res = await request(app).delete(`/api/positions/${testPosition._id}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toContain('deleted successfully');

      // Verify it was deleted from the database
      const deletedPosition = await Position.findById(testPosition._id);
      expect(deletedPosition).toBeNull();
    });

    it('should return 404 if position not found', async () => {
      const res = await request(app).delete('/api/positions/60d21b4667d0d8992e610c85');

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('not found');
    });
  });
});
