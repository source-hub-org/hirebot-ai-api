/**
 * Tests for the Ensure Directories utility
 */

const fs = require('fs').promises;
const path = require('path');
const { ensureDirectoriesExist } = require('../../src/utils/ensureDirectories');
const logger = require('../../src/utils/logger');

// Mock dependencies
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
  },
}));

jest.mock('path', () => ({
  resolve: jest.fn((cwd, dir) => `/mock/path/${dir}`),
}));

jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('ensureDirectories', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test('should check for required directories', async () => {
    // Mock successful access to all directories
    fs.access.mockResolvedValue(undefined);

    await ensureDirectoriesExist();

    // Should check for logs, data, and tmp directories
    expect(path.resolve).toHaveBeenCalledTimes(3);
    expect(path.resolve).toHaveBeenCalledWith(expect.any(String), 'logs');
    expect(path.resolve).toHaveBeenCalledWith(expect.any(String), 'data');
    expect(path.resolve).toHaveBeenCalledWith(expect.any(String), 'tmp');

    // Should check if each directory exists
    expect(fs.access).toHaveBeenCalledTimes(3);
    expect(fs.access).toHaveBeenCalledWith('/mock/path/logs');
    expect(fs.access).toHaveBeenCalledWith('/mock/path/data');
    expect(fs.access).toHaveBeenCalledWith('/mock/path/tmp');

    // Should log that directories exist
    expect(logger.info).toHaveBeenCalledTimes(3);
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Directory exists'));

    // Should not try to create any directories
    expect(fs.mkdir).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  test('should create directories that do not exist', async () => {
    // Mock access failing for all directories
    fs.access.mockRejectedValue(new Error('Directory does not exist'));

    // Mock successful directory creation
    fs.mkdir.mockResolvedValue(undefined);

    await ensureDirectoriesExist();

    // Should check for logs, data, and tmp directories
    expect(path.resolve).toHaveBeenCalledTimes(3);

    // Should check if each directory exists
    expect(fs.access).toHaveBeenCalledTimes(3);

    // Should try to create each directory
    expect(fs.mkdir).toHaveBeenCalledTimes(3);
    expect(fs.mkdir).toHaveBeenCalledWith('/mock/path/logs', { recursive: true });
    expect(fs.mkdir).toHaveBeenCalledWith('/mock/path/data', { recursive: true });
    expect(fs.mkdir).toHaveBeenCalledWith('/mock/path/tmp', { recursive: true });

    // Should log that directories were created
    expect(logger.info).toHaveBeenCalledTimes(3);
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Created directory'));

    // Should not log any errors
    expect(logger.error).not.toHaveBeenCalled();
  });

  test('should handle errors when creating directories', async () => {
    // Mock access failing for all directories
    fs.access.mockRejectedValue(new Error('Directory does not exist'));

    // Mock directory creation failing
    const mkdirError = new Error('Permission denied');
    fs.mkdir.mockRejectedValue(mkdirError);

    await ensureDirectoriesExist();

    // Should check for logs, data, and tmp directories
    expect(path.resolve).toHaveBeenCalledTimes(3);

    // Should check if each directory exists
    expect(fs.access).toHaveBeenCalledTimes(3);

    // Should try to create each directory
    expect(fs.mkdir).toHaveBeenCalledTimes(3);

    // Should log errors for each failed directory creation
    expect(logger.error).toHaveBeenCalledTimes(3);
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to create directory'),
      mkdirError
    );
  });

  test('should handle mixed scenarios', async () => {
    // Mock access succeeding for first directory, failing for others
    fs.access
      .mockResolvedValueOnce(undefined) // logs exists
      .mockRejectedValueOnce(new Error('Directory does not exist')) // data doesn't exist
      .mockRejectedValueOnce(new Error('Directory does not exist')); // tmp doesn't exist

    // Mock directory creation succeeding for data, failing for tmp
    fs.mkdir
      .mockResolvedValueOnce(undefined) // data created successfully
      .mockRejectedValueOnce(new Error('Permission denied')); // tmp creation failed

    await ensureDirectoriesExist();

    // Should check all directories
    expect(fs.access).toHaveBeenCalledTimes(3);

    // Should only try to create directories that don't exist
    expect(fs.mkdir).toHaveBeenCalledTimes(2);
    expect(fs.mkdir).toHaveBeenCalledWith('/mock/path/data', { recursive: true });
    expect(fs.mkdir).toHaveBeenCalledWith('/mock/path/tmp', { recursive: true });

    // Should log appropriate messages
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('Directory exists: /mock/path/logs')
    );
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('Created directory: /mock/path/data')
    );
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to create directory /mock/path/tmp'),
      expect.any(Error)
    );
  });
});
