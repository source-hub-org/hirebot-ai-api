/**
 * Tests for the logger utility
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('../src/utils/logger');

describe('Logger Utility', () => {
  // Save original environment
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Set NODE_ENV to something other than 'test' for these tests
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    // Restore original environment
    process.env.NODE_ENV = originalEnv;
  });

  const testLogFile = 'test-log.log';
  const logDir = path.resolve(process.cwd(), 'logs');
  const testLogPath = path.join(logDir, testLogFile);

  // Clean up test log file after tests
  afterAll(async () => {
    try {
      await fs.unlink(testLogPath);
    } catch (error) {
      console.debug(`Error cleaning up ${testLogPath}:`, error);
      // Ignore if file doesn't exist
    }
  });

  test('logToFile should write to a log file', async () => {
    const testMessage = 'Test log message';
    const testData = { key: 'value', number: 123 };

    // Ensure the logs directory exists

    await logger.logToFile(testLogFile, testMessage, testData);

    // Read the log file
    const fileContent = await fs.readFile(testLogPath, 'utf8');

    // Verify the log contains our message and data
    expect(fileContent).toContain(testMessage);
    expect(fileContent).toContain(JSON.stringify(testData, null, 2));
  });

  test('logToFile should append to an existing log file', async () => {
    const firstMessage = 'First message';
    const secondMessage = 'Second message';

    // Write first message
    await logger.logToFile(testLogFile, firstMessage);

    // Write second message
    await logger.logToFile(testLogFile, secondMessage);

    // Read the log file
    const fileContent = await fs.readFile(testLogPath, 'utf8');

    // Verify both messages are in the file
    expect(fileContent).toContain(firstMessage);
    expect(fileContent).toContain(secondMessage);
  });

  test('logToFile should handle errors gracefully', async () => {
    // Mock fs.appendFile to throw an error
    const originalAppendFile = fs.appendFile;
    fs.appendFile = jest.fn().mockRejectedValue(new Error('Mock error'));

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await logger.logToFile('invalid/path.log', 'This should fail');

    // Verify console.error was called
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('Failed to write to log file');

    // Restore original functions
    fs.appendFile = originalAppendFile;
    consoleErrorSpy.mockRestore();
  });

  test('logger functions should not log in test environment', () => {
    // Set NODE_ENV to test
    process.env.NODE_ENV = 'test';

    // Spy on console methods
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();

    // Call logger methods
    logger.info('Test info');
    logger.warn('Test warn');
    logger.error('Test error');
    logger.debug('Test debug');

    // Verify console methods were not called
    expect(consoleLogSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(consoleDebugSpy).not.toHaveBeenCalled();

    // Restore console methods
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleDebugSpy.mockRestore();
  });
});
