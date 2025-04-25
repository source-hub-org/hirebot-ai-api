/**
 * @fileoverview Tests for the fileOperations module
 */

const fs = require('fs').promises;
const path = require('path');
const {
  loadQuestionFormat,
  loadExistingQuestions,
  saveGeneratedQuestions,
  ensureTmpDirectoryExists,
  logContentToFile,
} = require('../src/service/gemini/quiz/fileOperations');

// Mock fs and path modules
jest.mock('fs', () => {
  const originalFs = jest.requireActual('fs');
  return {
    ...originalFs,
    promises: {
      readFile: jest.fn(),
      writeFile: jest.fn(),
      access: jest.fn(),
      mkdir: jest.fn(),
    },
    appendFileSync: jest.fn(),
  };
});

jest.mock('path', () => ({
  resolve: jest.fn(),
  join: jest.fn(),
}));

// Mock logger
jest.mock('@utils/logger', () => ({
  warn: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

// Mock questionSearchService
jest.mock('../src/service/questionSearchService', () => ({
  searchQuestions: jest.fn(),
}));

describe('fileOperations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock implementations
    path.resolve.mockImplementation((...args) => args.join('/'));
    path.join.mockImplementation((...args) => args.join('/'));
  });

  describe('loadQuestionFormat', () => {
    it('should load and parse question format successfully', async () => {
      const mockFormatData = '{"key": "value"}';
      fs.readFile.mockResolvedValue(mockFormatData);

      const result = await loadQuestionFormat();

      expect(path.resolve).toHaveBeenCalledWith(
        expect.any(String),
        'src/config/question-format.json'
      );
      expect(fs.readFile).toHaveBeenCalledWith(expect.any(String), 'utf8');
      expect(result).toEqual({ key: 'value' });
    });

    it('should throw an error when file cannot be read', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));

      await expect(loadQuestionFormat()).rejects.toThrow(
        'Failed to load question format: File not found'
      );
    });

    it('should throw an error when JSON is invalid', async () => {
      fs.readFile.mockResolvedValue('invalid json');

      await expect(loadQuestionFormat()).rejects.toThrow(/Failed to load question format/);
    });
  });

  describe('loadExistingQuestions', () => {
    // Import the mocked searchQuestions function
    const { searchQuestions } = require('../src/service/questionSearchService');

    it('should load existing questions successfully from database', async () => {
      // Mock the searchQuestions function to return sample questions
      const mockQuestions = [
        { _id: '1', question: 'question1' },
        { _id: '2', question: 'question2' },
        { _id: '3', question: 'question3' },
      ];

      searchQuestions.mockResolvedValue({
        questions: mockQuestions,
        pagination: {
          total: 3,
          page: 1,
          page_size: 1000,
          total_pages: 1,
        },
      });

      const options = { topic: 'JavaScript', language: 'JavaScript', position: 'junior' };
      const result = await loadExistingQuestions('path/to/questions', options);

      expect(searchQuestions).toHaveBeenCalledWith({
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'junior',
        sort_by: 'createdAt',
        sort_direction: 'asc',
        page: 1,
        page_size: 1000,
        mode: 'minimalist',
      });
      expect(result).toEqual(['question1', 'question2', 'question3']);
    });

    it('should return empty array when search fails', async () => {
      searchQuestions.mockRejectedValue(new Error('Database error'));

      const options = { topic: 'JavaScript', language: 'JavaScript', position: 'junior' };
      const result = await loadExistingQuestions('path/to/questions', options);

      expect(result).toEqual([]);
    });

    it('should return empty array when no questions are found', async () => {
      searchQuestions.mockResolvedValue({
        questions: [],
        pagination: {
          total: 0,
          page: 1,
          page_size: 1000,
          total_pages: 0,
        },
      });

      const options = { topic: 'JavaScript', language: 'JavaScript', position: 'junior' };
      const result = await loadExistingQuestions('path/to/questions', options);

      expect(result).toEqual([]);
    });
  });

  describe('ensureTmpDirectoryExists', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should return existing directory path when directory exists', async () => {
      fs.access.mockResolvedValue(undefined);

      const result = await ensureTmpDirectoryExists();

      expect(result).toBe('/tmp');
      expect(fs.access).toHaveBeenCalledWith('/tmp');
      expect(fs.mkdir).not.toHaveBeenCalled();
    });

    it('should create directory when it does not exist', async () => {
      fs.access.mockRejectedValue(new Error('Directory not found'));
      fs.mkdir.mockResolvedValue(undefined);

      const result = await ensureTmpDirectoryExists();

      expect(result).toBe('/tmp');
      expect(fs.mkdir).toHaveBeenCalledWith('/tmp', { recursive: true });
    });

    it('should use custom directory from environment variable', async () => {
      process.env.GEMINI_TMP_DIR = '/custom/tmp';
      fs.access.mockResolvedValue(undefined);

      const result = await ensureTmpDirectoryExists();

      expect(result).toBe('/custom/tmp');
      expect(fs.access).toHaveBeenCalledWith('/custom/tmp');
    });

    it('should throw an error when directory cannot be created', async () => {
      fs.access.mockRejectedValue(new Error('Directory not found'));
      fs.mkdir.mockRejectedValue(new Error('Permission denied'));

      await expect(ensureTmpDirectoryExists()).rejects.toThrow(
        'Failed to ensure temporary directory exists: Permission denied'
      );
    });
  });

  describe('saveGeneratedQuestions', () => {
    it('should save questions to a file successfully', async () => {
      const mockQuestions = [{ question: 'Test question' }];
      const mockTimestamp = 1234567890;

      // Mock Date.now()
      jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

      // Mock ensureTmpDirectoryExists
      fs.access.mockResolvedValue(undefined);
      fs.writeFile.mockResolvedValue(undefined);
      path.join.mockReturnValue('/tmp/1234567890.json');

      const result = await saveGeneratedQuestions(mockQuestions);

      expect(fs.writeFile).toHaveBeenCalledWith(
        '/tmp/1234567890.json',
        JSON.stringify(mockQuestions, null, 2),
        'utf8'
      );
      expect(result).toBe('/tmp/1234567890.json');

      // Restore Date.now
      jest.restoreAllMocks();
    });

    it('should throw an error when file cannot be written', async () => {
      const mockQuestions = [{ question: 'Test question' }];

      // Mock ensureTmpDirectoryExists
      fs.access.mockResolvedValue(undefined);
      fs.writeFile.mockRejectedValue(new Error('Disk full'));

      await expect(saveGeneratedQuestions(mockQuestions)).rejects.toThrow(
        'Failed to save generated questions: Disk full'
      );
    });
  });

  describe('logContentToFile', () => {
    beforeEach(() => {
      // Save the original fs module
      originalFs = jest.requireActual('fs');

      // Mock the synchronous fs methods
      const mockFs = require('fs');
      mockFs.appendFileSync = jest.fn();

      // Mock path.resolve and path.join for this test
      path.resolve.mockReturnValue('/mock/logs');
      path.join.mockReturnValue('/mock/logs/gemini-content-debug.log');
    });

    it('should log content to file successfully', () => {
      const mockContent = 'Test content to log';

      logContentToFile(mockContent);

      const fs = require('fs');
      expect(path.resolve).toHaveBeenCalledWith(expect.any(String), 'logs');
      expect(path.join).toHaveBeenCalledWith('/mock/logs', 'gemini-content-debug.log');
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        '/mock/logs/gemini-content-debug.log',
        expect.stringContaining('Test content to log'),
        'utf8'
      );
    });

    it('should handle errors when logging fails', () => {
      const mockContent = 'Test content to log';
      const logger = require('../src/utils/logger');

      // Make appendFileSync throw an error
      const fs = require('fs');
      fs.appendFileSync.mockImplementation(() => {
        throw new Error('Write error');
      });

      logContentToFile(mockContent);

      expect(logger.warn).toHaveBeenCalledWith(
        'Failed to log full content for debugging:',
        'Write error'
      );
    });
  });
});
