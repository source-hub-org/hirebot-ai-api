/**
 * Tests for the positionCommands module
 * @module test/commands/positionCommands.test
 */

const { readJsonFile, fileExists } = require('../../src/utils/fileParser');
const { validatePositionsData } = require('../../src/utils/positionValidator');
const { clearAllPositions, insertPositions } = require('../../src/repository/positionRepository');
const logger = require('../../src/utils/logger');
const { initPositionsCommand } = require('../../src/commands/positionCommands');

// Mock dependencies
jest.mock('../../src/utils/fileParser');
jest.mock('../../src/utils/positionValidator');
jest.mock('../../src/repository/positionRepository');
jest.mock('../../src/utils/logger');

describe('Position Commands Tests', () => {
  // Sample valid positions data
  const samplePositions = [
    {
      title: 'Frontend Developer',
      slug: 'frontend-developer',
      description: 'Frontend development position',
      positionLevel: 'junior',
      requiredSkills: ['JavaScript', 'React', 'HTML', 'CSS'],
    },
    {
      title: 'Backend Developer',
      slug: 'backend-developer',
      description: 'Backend development position',
      level: 'mid', // Using level instead of positionLevel to test mapping
      requiredSkills: ['Node.js', 'Express', 'MongoDB'],
    },
  ];

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    fileExists.mockResolvedValue(true);
    readJsonFile.mockResolvedValue(samplePositions);
    validatePositionsData.mockReturnValue({ isValid: true, errors: [] });
    clearAllPositions.mockResolvedValue({ acknowledged: true, deletedCount: 0 });
    insertPositions.mockResolvedValue({ acknowledged: true, insertedCount: 2 });
  });

  describe('initPositionsCommand', () => {
    test('should throw error when no file path is provided', async () => {
      await expect(initPositionsCommand([])).rejects.toThrow('File path argument is required');
      await expect(initPositionsCommand()).rejects.toThrow('File path argument is required');
    });

    test('should throw error when file does not exist', async () => {
      // Mock file not existing
      fileExists.mockResolvedValue(false);

      await expect(initPositionsCommand(['/path/to/nonexistent.json'])).rejects.toThrow(
        'File not found: /path/to/nonexistent.json'
      );
    });

    test('should throw error when file has invalid data', async () => {
      // Mock validation failure
      validatePositionsData.mockReturnValue({
        isValid: false,
        errors: ['Missing required field', 'Invalid type'],
      });

      await expect(initPositionsCommand(['/path/to/invalid.json'])).rejects.toThrow(
        'Invalid positions data: Missing required field, Invalid type'
      );
    });

    test('should process valid file with array format', async () => {
      // Execute command
      const result = await initPositionsCommand(['/path/to/valid.json']);

      // Verify file operations
      expect(fileExists).toHaveBeenCalledWith('/path/to/valid.json');
      expect(readJsonFile).toHaveBeenCalledWith('/path/to/valid.json');
      expect(validatePositionsData).toHaveBeenCalledWith(samplePositions);

      // Verify database operations
      expect(clearAllPositions).toHaveBeenCalled();
      expect(insertPositions).toHaveBeenCalled();

      // Verify result
      expect(result.success).toBe(true);
      expect(result.message).toBe('Successfully initialized 2 positions');
    });

    test('should process valid file with object format', async () => {
      // Mock object format
      readJsonFile.mockResolvedValue({ positions: samplePositions });

      // Execute command
      const result = await initPositionsCommand(['/path/to/valid.json']);

      // Verify operations
      expect(validatePositionsData).toHaveBeenCalledWith({ positions: samplePositions });
      expect(insertPositions).toHaveBeenCalled();

      // Verify the positions were processed correctly
      const insertedPositions = insertPositions.mock.calls[0][0];
      expect(insertedPositions).toHaveLength(2);

      // Verify result
      expect(result.success).toBe(true);
    });

    test('should map level to positionLevel when needed', async () => {
      // Execute command
      await initPositionsCommand(['/path/to/valid.json']);

      // Verify the positions were processed correctly
      const insertedPositions = insertPositions.mock.calls[0][0];

      // Check that the second position has positionLevel mapped from level
      expect(insertedPositions[1].positionLevel).toBe('mid');
    });

    test('should add timestamps to positions', async () => {
      // Execute command
      await initPositionsCommand(['/path/to/valid.json']);

      // Verify the positions were processed correctly
      const insertedPositions = insertPositions.mock.calls[0][0];

      // Check that timestamps were added
      expect(insertedPositions[0].createdAt).toBeInstanceOf(Date);
      expect(insertedPositions[0].updatedAt).toBeInstanceOf(Date);
      expect(insertedPositions[1].createdAt).toBeInstanceOf(Date);
      expect(insertedPositions[1].updatedAt).toBeInstanceOf(Date);
    });

    test('should throw error when duplicate slugs are found in file', async () => {
      // Mock positions with duplicate slugs
      const positionsWithDuplicateSlugs = [
        {
          title: 'Frontend Developer',
          slug: 'developer',
          description: 'Frontend development position',
          positionLevel: 'junior',
        },
        {
          title: 'Backend Developer',
          slug: 'developer', // Duplicate slug
          description: 'Backend development position',
          positionLevel: 'mid',
        },
      ];

      readJsonFile.mockResolvedValue(positionsWithDuplicateSlugs);

      // Execute command and expect error
      await expect(initPositionsCommand(['/path/to/duplicate-slugs.json'])).rejects.toThrow(
        'Duplicate slugs found in file: developer'
      );
    });

    test('should handle database errors during position insertion', async () => {
      // Mock database error
      insertPositions.mockRejectedValue(new Error('Database connection failed'));

      // Execute command and expect error
      await expect(initPositionsCommand(['/path/to/valid.json'])).rejects.toThrow(
        'Database connection failed'
      );
    });

    test('should log appropriate messages during execution', async () => {
      // Execute command
      await initPositionsCommand(['/path/to/valid.json']);

      // Verify logging
      expect(logger.info).toHaveBeenCalledWith(
        'Initializing positions from file: /path/to/valid.json'
      );
      expect(logger.info).toHaveBeenCalledWith('Existing positions cleared successfully');
      expect(logger.info).toHaveBeenCalledWith('Successfully inserted 2 positions');
    });

    test('should log errors when they occur', async () => {
      // Mock database error
      insertPositions.mockRejectedValue(new Error('Database connection failed'));

      // Execute command and catch error
      try {
        await initPositionsCommand(['/path/to/valid.json']);
      } catch (error) {
        console.debug('Error caught in test:', error);
      }

      // Verify error logging
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to initialize positions:',
        expect.any(Error)
      );
    });
  });
});
