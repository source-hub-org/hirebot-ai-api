/**
 * Tests for the languageCommands module
 * @module test/commands/languageCommands.test
 */

// Mock fs module before any imports
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

// Mock path module
jest.mock('path', () => ({
  resolve: jest.fn((cwd, filePath) => filePath), // Just return the filePath for simplicity
}));

// Mock other dependencies
jest.mock('../../src/utils/languageValidator');
jest.mock('../../src/utils/fileParser');
jest.mock('../../src/utils/logger');
jest.mock('../../src/models/languageModel');

// Import dependencies
const fs = require('fs').promises;
const { validateLanguagesData } = require('../../src/utils/languageValidator');
const { fileExists } = require('../../src/utils/fileParser');

// Import the module to test
const { initLanguagesCommand } = require('../../src/commands/languageCommands');

describe('Language Commands Tests', () => {
  // Sample valid languages data
  const sampleLanguages = [
    {
      name: 'JavaScript',
      slug: 'javascript',
      description: 'JavaScript programming language',
      popularity: 'high',
    },
    {
      name: 'Python',
      slug: 'python',
      description: 'Python programming language',
      popularity: 'high',
    },
  ];

  // Mock the Language model
  const mockLanguage = {
    findOne: jest.fn(),
    insertMany: jest.fn(),
  };

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    fileExists.mockResolvedValue(true);
    validateLanguagesData.mockReturnValue({ isValid: true, errors: [] });
    console.log = jest.fn();

    // Mock Language model methods
    mockLanguage.findOne.mockResolvedValue(null);
    mockLanguage.insertMany.mockResolvedValue(sampleLanguages);

    // Mock fs.readFile to return valid JSON
    fs.readFile.mockResolvedValue(JSON.stringify(sampleLanguages));
  });

  describe('initLanguagesCommand', () => {
    test('should throw error when no file path is provided', async () => {
      await expect(initLanguagesCommand([])).rejects.toThrow('File path argument is required');
      await expect(initLanguagesCommand()).rejects.toThrow('File path argument is required');
    });

    test('should throw error when file does not exist', async () => {
      // Mock file not existing
      fileExists.mockResolvedValue(false);

      await expect(initLanguagesCommand(['/path/to/nonexistent.json'])).rejects.toThrow(
        'File not found: /path/to/nonexistent.json'
      );
    });

    test('should throw error when file has invalid data', async () => {
      // Mock file exists
      fileExists.mockResolvedValue(true);

      // Mock fs.readFile to return valid JSON
      fs.readFile.mockResolvedValue(JSON.stringify(sampleLanguages));

      // Mock validation failure
      validateLanguagesData.mockReturnValue({
        isValid: false,
        errors: ['Missing required field', 'Invalid type'],
      });

      await expect(initLanguagesCommand(['/path/to/invalid.json'])).rejects.toThrow(
        'Invalid languages data: Missing required field, Invalid type'
      );
    });

    test('should process valid file and initialize languages', async () => {
      // Mock file exists
      fileExists.mockResolvedValue(true);

      // Mock fs.readFile to return valid JSON
      fs.readFile.mockResolvedValue(JSON.stringify(sampleLanguages));

      // Mock validation success
      validateLanguagesData.mockReturnValue({ isValid: true, errors: [] });

      // Mock Language model methods
      const Language = require('../../src/models/languageModel');
      Language.findOne.mockResolvedValue(null);
      Language.insertMany.mockResolvedValue(sampleLanguages);

      // Execute command
      const result = await initLanguagesCommand(['/path/to/valid.json']);

      // Verify file operations
      expect(fileExists).toHaveBeenCalledWith('/path/to/valid.json');
      expect(fs.readFile).toHaveBeenCalled();
      expect(validateLanguagesData).toHaveBeenCalledWith(sampleLanguages);

      // Verify result
      expect(result).toEqual({
        inserted: 2,
        skipped: 0,
        total: 2,
      });
    });

    test('should handle duplicate languages', async () => {
      // Mock file exists
      fileExists.mockResolvedValue(true);

      // Mock fs.readFile to return valid JSON
      fs.readFile.mockResolvedValue(JSON.stringify(sampleLanguages));

      // Mock validation success
      validateLanguagesData.mockReturnValue({ isValid: true, errors: [] });

      // Mock Language model methods to find duplicates
      const Language = require('../../src/models/languageModel');
      Language.findOne.mockImplementation(query => {
        if (query.name === 'Python') {
          return Promise.resolve({ name: 'Python', slug: 'python' });
        }
        return Promise.resolve(null);
      });

      Language.insertMany.mockResolvedValue([sampleLanguages[0]]);

      // Execute command
      const result = await initLanguagesCommand(['/path/to/valid.json']);

      // Verify result
      expect(result.inserted).toBeLessThan(2); // Should be less than total languages
      expect(result.skipped).toBeGreaterThan(0); // Should have skipped some languages
    });

    test('should handle database errors during language insertion', async () => {
      // Mock file exists
      fileExists.mockResolvedValue(true);

      // Mock fs.readFile to return valid JSON
      fs.readFile.mockResolvedValue(JSON.stringify(sampleLanguages));

      // Mock validation success
      validateLanguagesData.mockReturnValue({ isValid: true, errors: [] });

      // Mock Language model methods
      const Language = require('../../src/models/languageModel');
      Language.findOne.mockResolvedValue(null);

      // Mock database error
      Language.insertMany.mockRejectedValue(new Error('Database connection failed'));

      // Execute command and expect error
      await expect(initLanguagesCommand(['/path/to/valid.json'])).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
});
