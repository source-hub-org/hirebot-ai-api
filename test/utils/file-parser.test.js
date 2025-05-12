/**
 * Tests for the File Parser Module
 */

const fs = require('fs/promises');
const { readJsonFile, fileExists } = require('../../src/utils/fileParser');
const logger = require('../../src/utils/logger');

// Mock dependencies
jest.mock('fs/promises');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
}));

describe('File Parser', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('readJsonFile', () => {
    it('should read and parse a JSON file successfully', async () => {
      // Mock file content
      const mockFileContent = '{"key": "value", "number": 42}';
      const expectedParsedContent = { key: 'value', number: 42 };

      // Setup mock implementation
      fs.readFile.mockResolvedValue(mockFileContent);

      // Call the function
      const result = await readJsonFile('/path/to/file.json');

      // Verify results
      expect(fs.readFile).toHaveBeenCalledWith('/path/to/file.json', 'utf8');
      expect(logger.info).toHaveBeenCalledWith('Reading JSON file from: /path/to/file.json');
      expect(result).toEqual(expectedParsedContent);
    });

    it('should throw an error when file is not found', async () => {
      // Setup mock implementation for file not found error
      const error = new Error('File not found');
      error.code = 'ENOENT';
      fs.readFile.mockRejectedValue(error);

      // Call the function and expect it to throw
      await expect(readJsonFile('/path/to/nonexistent.json')).rejects.toThrow(
        'File not found: /path/to/nonexistent.json'
      );

      expect(fs.readFile).toHaveBeenCalledWith('/path/to/nonexistent.json', 'utf8');
      expect(logger.info).toHaveBeenCalledWith('Reading JSON file from: /path/to/nonexistent.json');
    });

    it('should throw an error when JSON is invalid', async () => {
      // Mock invalid JSON content
      const mockInvalidJson = '{invalid: json}';

      // Setup mock implementation
      fs.readFile.mockResolvedValue(mockInvalidJson);

      // Call the function and expect it to throw
      await expect(readJsonFile('/path/to/invalid.json')).rejects.toThrow(
        'Invalid JSON format in file: /path/to/invalid.json'
      );

      expect(fs.readFile).toHaveBeenCalledWith('/path/to/invalid.json', 'utf8');
      expect(logger.info).toHaveBeenCalledWith('Reading JSON file from: /path/to/invalid.json');
    });

    it('should throw a generic error for other errors', async () => {
      // Setup mock implementation for a generic error
      const error = new Error('Some other error');
      fs.readFile.mockRejectedValue(error);

      // Call the function and expect it to throw
      await expect(readJsonFile('/path/to/file.json')).rejects.toThrow(
        'Error reading file /path/to/file.json: Some other error'
      );

      expect(fs.readFile).toHaveBeenCalledWith('/path/to/file.json', 'utf8');
      expect(logger.info).toHaveBeenCalledWith('Reading JSON file from: /path/to/file.json');
    });
  });

  describe('fileExists', () => {
    it('should return true when file exists', async () => {
      // Setup mock implementation
      fs.access.mockResolvedValue(undefined);

      // Call the function
      const result = await fileExists('/path/to/existing/file.json');

      // Verify results
      expect(fs.access).toHaveBeenCalledWith('/path/to/existing/file.json');
      expect(result).toBe(true);
    });

    it('should return false when file does not exist', async () => {
      // Setup mock implementation
      fs.access.mockRejectedValue(new Error('File not found'));

      // Call the function
      const result = await fileExists('/path/to/nonexistent/file.json');

      // Verify results
      expect(fs.access).toHaveBeenCalledWith('/path/to/nonexistent/file.json');
      expect(result).toBe(false);
    });
  });
});
