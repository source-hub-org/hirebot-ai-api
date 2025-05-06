/**
 * Candidate Repository Tests
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const { ObjectId } = require('mongodb');
const { initializeDb, closeConnection } = require('../../src/repository/baseRepository');
const candidateRepository = require('../../src/repository/candidateRepository');

// Mock the logger to prevent console output during tests
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
}));

let mongoServer;
let validCandidateId;

// Sample valid candidate data
const validCandidate = {
  full_name: 'Test Candidate',
  email: 'test@example.com',
  phone_number: '+1234567890',
  interview_level: 'junior',
  skills: ['JavaScript', 'React'],
};

// Sample update data
const updateData = {
  full_name: 'Updated Name',
  skills: ['JavaScript', 'React', 'Node.js'],
  status: 'interviewed',
};

describe('Candidate Repository', () => {
  beforeAll(async () => {
    // Start an in-memory MongoDB server for testing
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Initialize the database connection
    await initializeDb(mongoUri, 'hirebot_db_test');
  });

  afterAll(async () => {
    // Clean up resources
    await closeConnection();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  describe('insertCandidateToDB', () => {
    test('should insert a candidate successfully', async () => {
      const result = await candidateRepository.insertCandidateToDB(validCandidate);

      // Save the ID for later tests
      validCandidateId = result._id.toString();

      // Verify the result
      expect(result).toHaveProperty('_id');
      expect(result.full_name).toBe(validCandidate.full_name);
      expect(result.email).toBe(validCandidate.email);
      expect(result.skills).toEqual(validCandidate.skills);

      // Verify default values were applied
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    test('should throw an error when insertion fails', async () => {
      // Mock the baseRepository.insertOne to simulate a failure
      const originalInsertOne = require('../../src/repository/baseRepository').insertOne;
      require('../../src/repository/baseRepository').insertOne = jest
        .fn()
        .mockResolvedValue({ acknowledged: false });

      await expect(candidateRepository.insertCandidateToDB(validCandidate)).rejects.toThrow(
        'Failed to insert candidate'
      );

      // Restore the original function
      require('../../src/repository/baseRepository').insertOne = originalInsertOne;
    });

    test('should throw an error when database operation fails', async () => {
      // Mock the baseRepository.insertOne to throw an error
      const originalInsertOne = require('../../src/repository/baseRepository').insertOne;
      require('../../src/repository/baseRepository').insertOne = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));

      await expect(candidateRepository.insertCandidateToDB(validCandidate)).rejects.toThrow(
        'Database error'
      );

      // Restore the original function
      require('../../src/repository/baseRepository').insertOne = originalInsertOne;
    });
  });

  describe('getCandidateList', () => {
    test('should retrieve a list of candidates with pagination', async () => {
      // Insert a few more candidates for pagination testing
      const candidates = [];
      for (let i = 1; i <= 5; i++) {
        candidates.push({
          full_name: `Test Candidate ${i}`,
          email: `test${i}@example.com`,
          phone_number: `+123456789${i}`,
          interview_level: 'junior',
        });
      }

      // Insert the candidates
      for (const candidate of candidates) {
        await candidateRepository.insertCandidateToDB(candidate);
      }

      // Test with pagination
      const result = await candidateRepository.getCandidateList({ skip: 0, limit: 3 });

      // Verify the result
      expect(result).toHaveProperty('candidates');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.candidates)).toBe(true);
      expect(result.candidates.length).toBeLessThanOrEqual(3);
      expect(result.total).toBeGreaterThanOrEqual(6); // 1 from previous test + 5 new ones
    });

    test('should retrieve all candidates when no pagination options are provided', async () => {
      const result = await candidateRepository.getCandidateList();

      // Verify the result
      expect(result).toHaveProperty('candidates');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.candidates)).toBe(true);
      expect(result.candidates.length).toBeGreaterThanOrEqual(6);
    });

    test('should throw an error when database operation fails', async () => {
      // Mock the baseRepository.getCollection to throw an error
      const originalGetCollection = require('../../src/repository/baseRepository').getCollection;
      require('../../src/repository/baseRepository').getCollection = jest
        .fn()
        .mockImplementation(() => {
          throw new Error('Database error');
        });

      await expect(candidateRepository.getCandidateList()).rejects.toThrow('Database error');

      // Restore the original function
      require('../../src/repository/baseRepository').getCollection = originalGetCollection;
    });
  });

  describe('getCandidateById', () => {
    test('should retrieve a candidate by ID', async () => {
      const result = await candidateRepository.getCandidateById(validCandidateId);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result._id.toString()).toBe(validCandidateId);
      expect(result.full_name).toBe(validCandidate.full_name);
      expect(result.email).toBe(validCandidate.email);
    });

    test('should return null for invalid ObjectId', async () => {
      const result = await candidateRepository.getCandidateById('invalid-id');

      // Verify the result
      expect(result).toBeNull();
    });

    test('should return null for non-existent ID', async () => {
      const nonExistentId = new ObjectId().toString();
      const result = await candidateRepository.getCandidateById(nonExistentId);

      // Verify the result
      expect(result).toBeNull();
    });

    test('should throw an error when database operation fails', async () => {
      // Mock the baseRepository.findOne to throw an error
      const originalFindOne = require('../../src/repository/baseRepository').findOne;
      require('../../src/repository/baseRepository').findOne = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));

      await expect(candidateRepository.getCandidateById(validCandidateId)).rejects.toThrow(
        'Database error'
      );

      // Restore the original function
      require('../../src/repository/baseRepository').findOne = originalFindOne;
    });
  });

  describe('updateCandidateInDB', () => {
    test('should update a candidate successfully', async () => {
      const result = await candidateRepository.updateCandidateInDB(validCandidateId, updateData);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result._id.toString()).toBe(validCandidateId);
      expect(result.full_name).toBe(updateData.full_name);
      expect(result.skills).toEqual(updateData.skills);
      expect(result.status).toBe(updateData.status);

      // Original data should still be there
      expect(result.email).toBe(validCandidate.email);
    });

    test('should throw an error for invalid ObjectId', async () => {
      await expect(
        candidateRepository.updateCandidateInDB('invalid-id', updateData)
      ).rejects.toThrow('Invalid candidate ID');
    });

    test('should return null for non-existent ID', async () => {
      const nonExistentId = new ObjectId().toString();
      const result = await candidateRepository.updateCandidateInDB(nonExistentId, updateData);

      // Verify the result
      expect(result).toBeNull();
    });

    test('should throw an error when update operation is not acknowledged', async () => {
      // Mock the baseRepository.updateOne to simulate a failure
      const originalUpdateOne = require('../../src/repository/baseRepository').updateOne;
      require('../../src/repository/baseRepository').updateOne = jest
        .fn()
        .mockResolvedValue({ acknowledged: false });

      await expect(
        candidateRepository.updateCandidateInDB(validCandidateId, updateData)
      ).rejects.toThrow('Failed to update candidate');

      // Restore the original function
      require('../../src/repository/baseRepository').updateOne = originalUpdateOne;
    });

    test('should throw an error when database operation fails', async () => {
      // Mock the baseRepository.updateOne to throw an error
      const originalUpdateOne = require('../../src/repository/baseRepository').updateOne;
      require('../../src/repository/baseRepository').updateOne = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));

      await expect(
        candidateRepository.updateCandidateInDB(validCandidateId, updateData)
      ).rejects.toThrow('Database error');

      // Restore the original function
      require('../../src/repository/baseRepository').updateOne = originalUpdateOne;
    });
  });

  describe('deleteCandidateById', () => {
    test('should delete a candidate successfully', async () => {
      // First, create a candidate to delete
      const candidate = await candidateRepository.insertCandidateToDB({
        full_name: 'Candidate To Delete',
        email: 'delete@example.com',
        phone_number: '+9876543210',
        interview_level: 'senior',
      });

      const candidateId = candidate._id.toString();

      // Now delete the candidate
      const result = await candidateRepository.deleteCandidateById(candidateId);

      // Verify the result
      expect(result).toBe(true);

      // Verify the candidate is actually deleted
      const deletedCandidate = await candidateRepository.getCandidateById(candidateId);
      expect(deletedCandidate).toBeNull();
    });

    test('should throw an error for invalid ObjectId', async () => {
      await expect(candidateRepository.deleteCandidateById('invalid-id')).rejects.toThrow(
        'Invalid candidate ID'
      );
    });

    test('should return false for non-existent ID', async () => {
      const nonExistentId = new ObjectId().toString();
      const result = await candidateRepository.deleteCandidateById(nonExistentId);

      // Verify the result
      expect(result).toBe(false);
    });

    test('should throw an error when delete operation is not acknowledged', async () => {
      // Mock the baseRepository.deleteOne to simulate a failure
      const originalDeleteOne = require('../../src/repository/baseRepository').deleteOne;
      require('../../src/repository/baseRepository').deleteOne = jest
        .fn()
        .mockResolvedValue({ acknowledged: false });

      await expect(candidateRepository.deleteCandidateById(validCandidateId)).rejects.toThrow(
        'Failed to delete candidate'
      );

      // Restore the original function
      require('../../src/repository/baseRepository').deleteOne = originalDeleteOne;
    });

    test('should throw an error when database operation fails', async () => {
      // Mock the baseRepository.deleteOne to throw an error
      const originalDeleteOne = require('../../src/repository/baseRepository').deleteOne;
      require('../../src/repository/baseRepository').deleteOne = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));

      await expect(candidateRepository.deleteCandidateById(validCandidateId)).rejects.toThrow(
        'Database error'
      );

      // Restore the original function
      require('../../src/repository/baseRepository').deleteOne = originalDeleteOne;
    });
  });

  describe('candidateExistsByEmail', () => {
    test('should return true when a candidate with the email exists', async () => {
      const result = await candidateRepository.candidateExistsByEmail(validCandidate.email);

      // Verify the result
      expect(result).toBe(true);
    });

    test('should return false when no candidate with the email exists', async () => {
      const result = await candidateRepository.candidateExistsByEmail('nonexistent@example.com');

      // Verify the result
      expect(result).toBe(false);
    });

    test('should exclude the specified candidate ID when checking', async () => {
      // Should return false when excluding the only candidate with this email
      const result = await candidateRepository.candidateExistsByEmail(
        validCandidate.email,
        validCandidateId
      );

      // Verify the result
      expect(result).toBe(false);
    });

    test('should handle invalid ObjectId in excludeId parameter', async () => {
      // Should still find the candidate when excludeId is invalid
      const result = await candidateRepository.candidateExistsByEmail(
        validCandidate.email,
        'invalid-id'
      );

      // Verify the result - should still find the candidate
      expect(result).toBe(true);
    });

    test('should throw an error when database operation fails', async () => {
      // Mock the baseRepository.findOne to throw an error
      const originalFindOne = require('../../src/repository/baseRepository').findOne;
      require('../../src/repository/baseRepository').findOne = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));

      await expect(
        candidateRepository.candidateExistsByEmail(validCandidate.email)
      ).rejects.toThrow('Database error');

      // Restore the original function
      require('../../src/repository/baseRepository').findOne = originalFindOne;
    });
  });
});
