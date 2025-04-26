/**
 * Automated tests for baseRepository.js MongoDB operations
 * @module test/automation-test
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const {
  initializeDb,
  getConnectionInfo,
  closeConnection,
  insertOne,
  insertMany,
  findOne,
  findMany,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany,
} = require('../../src/repository/baseRepository');

// Test collection name
const TEST_COLLECTION = 'test_collection';

// Sample test documents
const sampleDoc = { name: 'Test User', email: 'test@example.com', active: true };
const sampleDocs = [
  { name: 'User 1', email: 'user1@example.com', active: true },
  { name: 'User 2', email: 'user2@example.com', active: false },
  { name: 'User 3', email: 'user3@example.com', active: true },
];

describe('MongoDB Repository Tests', () => {
  let mongoServer;
  let mongoUri;

  // Set up in-memory MongoDB server before all tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
    await initializeDb(mongoUri, 'test_db');
  });

  // Close connections after all tests
  afterAll(async () => {
    await closeConnection();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  // Test connection initialization
  describe('Connection Management', () => {
    test('should connect to MongoDB successfully', async () => {
      const connectionInfo = getConnectionInfo();
      expect(connectionInfo.isConnected).toBe(true);
      expect(connectionInfo.dbName).toBe('test_db');
    });
  });

  // Test CRUD operations
  describe('CRUD Operations', () => {
    // Clean up the test collection before each test
    beforeEach(async () => {
      await deleteMany(TEST_COLLECTION, {});
    });

    // Insert operations
    describe('Insert Operations', () => {
      test('should insert a single document', async () => {
        const result = await insertOne(TEST_COLLECTION, sampleDoc);
        expect(result.acknowledged).toBe(true);
        expect(result.insertedId).toBeDefined();
      });

      test('should insert multiple documents', async () => {
        const result = await insertMany(TEST_COLLECTION, sampleDocs);
        expect(result.acknowledged).toBe(true);
        expect(result.insertedCount).toBe(sampleDocs.length);
      });
    });

    // Find operations
    describe('Find Operations', () => {
      beforeEach(async () => {
        await insertMany(TEST_COLLECTION, sampleDocs);
      });

      test('should find a single document by filter', async () => {
        const result = await findOne(TEST_COLLECTION, { name: 'User 1' });
        expect(result).toBeDefined();
        expect(result.email).toBe('user1@example.com');
      });

      test('should find multiple documents by filter', async () => {
        const results = await findMany(TEST_COLLECTION, { active: true });
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBe(2);
      });

      test('should return empty array when no documents match filter', async () => {
        const results = await findMany(TEST_COLLECTION, { name: 'Non-existent User' });
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBe(0);
      });
    });

    // Update operations
    describe('Update Operations', () => {
      beforeEach(async () => {
        await insertMany(TEST_COLLECTION, sampleDocs);
      });

      test('should update a single document', async () => {
        const result = await updateOne(
          TEST_COLLECTION,
          { name: 'User 2' },
          { $set: { active: true } }
        );
        expect(result.acknowledged).toBe(true);
        expect(result.modifiedCount).toBe(1);

        const updatedDoc = await findOne(TEST_COLLECTION, { name: 'User 2' });
        expect(updatedDoc.active).toBe(true);
      });

      test('should update multiple documents', async () => {
        const result = await updateMany(
          TEST_COLLECTION,
          { active: true },
          { $set: { status: 'verified' } }
        );
        expect(result.acknowledged).toBe(true);
        expect(result.modifiedCount).toBe(2);

        const updatedDocs = await findMany(TEST_COLLECTION, { status: 'verified' });
        expect(updatedDocs.length).toBe(2);
      });
    });

    // Delete operations
    describe('Delete Operations', () => {
      beforeEach(async () => {
        await insertMany(TEST_COLLECTION, sampleDocs);
      });

      test('should delete a single document', async () => {
        const result = await deleteOne(TEST_COLLECTION, { name: 'User 1' });
        expect(result.acknowledged).toBe(true);
        expect(result.deletedCount).toBe(1);

        const remainingDocs = await findMany(TEST_COLLECTION, {});
        expect(remainingDocs.length).toBe(2);
      });

      test('should delete multiple documents', async () => {
        const result = await deleteMany(TEST_COLLECTION, { active: true });
        expect(result.acknowledged).toBe(true);
        expect(result.deletedCount).toBe(2);

        const remainingDocs = await findMany(TEST_COLLECTION, {});
        expect(remainingDocs.length).toBe(1);
        expect(remainingDocs[0].active).toBe(false);
      });
    });
  });
});
