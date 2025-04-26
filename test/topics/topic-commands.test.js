/**
 * Tests for the topic commands module
 * @module test/topicCommandsTest
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const { initializeDb, closeConnection } = require('../../src/repository/baseRepository');
const { initTopicsCommand } = require('../../src/commands/topicCommands');
const { readJsonFile, fileExists } = require('../../src/utils/fileParser');
const { validateTopicsData } = require('../../src/utils/topicValidator');
const { clearAllTopics, insertTopics } = require('../../src/repository/topicRepository');

// Mock dependencies
jest.mock('../../src/utils/fileParser');
jest.mock('../../src/utils/topicValidator');
jest.mock('../../src/repository/topicRepository');

describe('Topic Commands Tests', () => {
  let mongoServer;
  let mongoUri;

  // Sample valid topics data
  const validTopicsData = {
    topics: [
      {
        title: 'Test Topic 1',
        difficulty: 1,
        popularity: 'low',
        suitable_level: 'intern',
        description: 'Test description 1',
      },
      {
        title: 'Test Topic 2',
        difficulty: 2,
        popularity: 'high',
        suitable_level: 'junior',
        description: 'Test description 2',
      },
    ],
  };

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

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Set up default mock implementations
    fileExists.mockResolvedValue(true);
    readJsonFile.mockResolvedValue(validTopicsData);
    validateTopicsData.mockReturnValue({ isValid: true, errors: [] });
    clearAllTopics.mockResolvedValue({ acknowledged: true, deletedCount: 0 });
    insertTopics.mockResolvedValue({ acknowledged: true, insertedCount: 2 });
  });

  describe('initTopicsCommand', () => {
    test('should throw error when no file path is provided', async () => {
      await expect(initTopicsCommand([])).rejects.toThrow('File path argument is required');
      await expect(initTopicsCommand()).rejects.toThrow('File path argument is required');
    });

    test('should throw error when file does not exist', async () => {
      // Mock file not existing
      fileExists.mockResolvedValue(false);

      await expect(initTopicsCommand(['/path/to/nonexistent.json'])).rejects.toThrow(
        'File not found: /path/to/nonexistent.json'
      );
    });

    test('should throw error when file has invalid data', async () => {
      // Mock validation failure
      validateTopicsData.mockReturnValue({
        isValid: false,
        errors: ['Missing required field', 'Invalid type'],
      });

      await expect(initTopicsCommand(['/path/to/invalid.json'])).rejects.toThrow(
        'Invalid topics data: Missing required field, Invalid type'
      );
    });

    test('should process valid file and initialize topics', async () => {
      // Execute command
      const result = await initTopicsCommand(['/path/to/valid.json']);

      // Verify file operations
      expect(fileExists).toHaveBeenCalledWith('/path/to/valid.json');
      expect(readJsonFile).toHaveBeenCalledWith('/path/to/valid.json');
      expect(validateTopicsData).toHaveBeenCalledWith(validTopicsData);

      // Verify database operations
      expect(clearAllTopics).toHaveBeenCalled();
      expect(insertTopics).toHaveBeenCalledWith(validTopicsData.topics);

      // Verify result
      expect(result.success).toBe(true);
      expect(result.message).toBe('Successfully initialized 2 topics');
    });

    test('should handle database errors during topic insertion', async () => {
      // Mock database error
      insertTopics.mockRejectedValue(new Error('Database connection failed'));

      await expect(initTopicsCommand(['/path/to/valid.json'])).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
});
