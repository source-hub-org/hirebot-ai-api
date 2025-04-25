/**
 * Tests for the file parser module
 * @module test/fileParserTest
 */

const fs = require('fs/promises');
const { readJsonFile, fileExists } = require('../src/utils/fileParser');

// Mock fs module
jest.mock('fs/promises');

describe('File Parser Tests', () => {
  const testFilePath = '/path/to/test.json';
  const validJsonContent = JSON.stringify({
    topics: [
      {
        title: 'Test Topic',
        difficulty: 1,
        popularity: 'low',
        suitable_level: 'intern',
        description: 'Test description',
      },
    ],
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('readJsonFile', () => {
    test('should read and parse a valid JSON file', async () => {
      // Mock successful file read
      fs.readFile.mockResolvedValue(validJsonContent);

      const result = await readJsonFile(testFilePath);

      expect(fs.readFile).toHaveBeenCalledWith(testFilePath, 'utf8');
      expect(result).toEqual(JSON.parse(validJsonContent));
    });

    test('should throw error when file not found', async () => {
      // Mock file not found error
      const error = new Error('File not found');
      error.code = 'ENOENT';
      fs.readFile.mockRejectedValue(error);

      await expect(readJsonFile(testFilePath)).rejects.toThrow(`File not found: ${testFilePath}`);
    });

    test('should throw error when JSON is invalid', async () => {
      // Mock invalid JSON content
      fs.readFile.mockResolvedValue('{ invalid json }');

      await expect(readJsonFile(testFilePath)).rejects.toThrow(
        `Invalid JSON format in file: ${testFilePath}`
      );
    });

    test('should throw error on other file reading errors', async () => {
      // Mock other file reading error
      const error = new Error('Permission denied');
      fs.readFile.mockRejectedValue(error);

      await expect(readJsonFile(testFilePath)).rejects.toThrow(
        `Error reading file ${testFilePath}: Permission denied`
      );
    });
  });

  describe('fileExists', () => {
    test('should return true when file exists', async () => {
      // Mock successful file access
      fs.access.mockResolvedValue(undefined);

      const result = await fileExists(testFilePath);

      expect(fs.access).toHaveBeenCalledWith(testFilePath);
      expect(result).toBe(true);
    });

    test('should return false when file does not exist', async () => {
      // Mock file access error
      fs.access.mockRejectedValue(new Error('File not found'));

      const result = await fileExists(testFilePath);

      expect(fs.access).toHaveBeenCalledWith(testFilePath);
      expect(result).toBe(false);
    });
  });
});
