/**
 * Tests for the topicCommands module
 * @module test/commands/topicCommands.test
 */

const { readJsonFile, fileExists } = require('../../src/utils/fileParser');
const { validateTopicsData } = require('../../src/utils/topicValidator');
const { clearAllTopics, insertTopics } = require('../../src/repository/topicRepository');
const logger = require('../../src/utils/logger');
const { initTopicsCommand } = require('../../src/commands/topicCommands');

// Mock dependencies
jest.mock('../../src/utils/fileParser');
jest.mock('../../src/utils/topicValidator');
jest.mock('../../src/repository/topicRepository');
jest.mock('../../src/utils/logger');

describe('Topic Commands Tests', () => {
  // Sample valid topics data
  const validTopicsData = {
    topics: [
      {
        title: 'JavaScript',
        difficulty: 3,
        popularity: 'high',
        suitable_level: 'junior',
        description: 'JavaScript programming language',
      },
      {
        title: 'React',
        difficulty: 4,
        popularity: 'high',
        suitable_level: 'mid',
        description: 'React library for building user interfaces',
      },
    ],
  };

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
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

      // Execute command and expect error
      await expect(initTopicsCommand(['/path/to/valid.json'])).rejects.toThrow(
        'Database connection failed'
      );
    });

    test('should log appropriate messages during execution', async () => {
      // Execute command
      await initTopicsCommand(['/path/to/valid.json']);

      // Verify logging
      expect(logger.info).toHaveBeenCalledWith(
        'Initializing topics from file: /path/to/valid.json'
      );
      expect(logger.info).toHaveBeenCalledWith('Existing topics cleared successfully');
      expect(logger.info).toHaveBeenCalledWith('Successfully inserted 2 topics');
    });

    test('should log errors when they occur', async () => {
      // Mock database error
      insertTopics.mockRejectedValue(new Error('Database connection failed'));

      // Execute command and catch error
      try {
        await initTopicsCommand(['/path/to/valid.json']);
      } catch (error) {
        console.debug('Error caught in test:', error);
      }

      // Verify error logging
      expect(logger.error).toHaveBeenCalledWith('Failed to initialize topics:', expect.any(Error));
    });

    test('should handle different data structures', async () => {
      // Mock different data structure (direct array instead of object with topics property)
      const topicsArray = validTopicsData.topics;
      readJsonFile.mockResolvedValue(topicsArray);

      // Execute command
      await initTopicsCommand(['/path/to/valid.json']);

      // Verify validation was called with the array
      expect(validateTopicsData).toHaveBeenCalledWith(topicsArray);
    });

    test('should handle empty topics array', async () => {
      // Mock empty topics array
      readJsonFile.mockResolvedValue({ topics: [] });
      insertTopics.mockResolvedValue({ acknowledged: true, insertedCount: 0 });

      // Execute command
      const result = await initTopicsCommand(['/path/to/empty.json']);

      // Verify result
      expect(result.success).toBe(true);
      expect(result.message).toBe('Successfully initialized 0 topics');
    });

    test('should handle additional command arguments', async () => {
      // Execute command with additional arguments
      await initTopicsCommand(['/path/to/valid.json', '--force', '--verbose']);

      // Verify file operations still work correctly
      expect(fileExists).toHaveBeenCalledWith('/path/to/valid.json');
      expect(readJsonFile).toHaveBeenCalledWith('/path/to/valid.json');
    });
  });
});
