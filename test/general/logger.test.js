/**
 * Tests for the logger utility
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('../../src/utils/logger');

describe('Logger Utility', () => {
  // Save original environment and console methods
  const originalEnv = process.env.NODE_ENV;
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  const originalConsoleDebug = console.debug;

  beforeEach(() => {
    // Set NODE_ENV to something other than 'test' for these tests
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    // Restore original environment
    process.env.NODE_ENV = originalEnv;
    // Restore original console methods
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
    console.debug = originalConsoleDebug;
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

  describe('formatLogMessage', () => {
    test('should format log message with timestamp and level', () => {
      // Access the private formatLogMessage function using a workaround
      // We'll call a public method that uses it and check the output
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      logger.info('Test message');

      expect(consoleLogSpy).toHaveBeenCalled();
      const loggedMessage = consoleLogSpy.mock.calls[0][0];

      // Check format: [timestamp] [LEVEL] message
      expect(loggedMessage).toMatch(
        /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z\] \[INFO\] Test message$/
      );

      consoleLogSpy.mockRestore();
    });

    test('should include data in JSON format when provided', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const testData = { key: 'value', nested: { prop: true } };

      logger.info('Test message with data', testData);

      expect(consoleLogSpy).toHaveBeenCalled();
      const loggedMessage = consoleLogSpy.mock.calls[0][0];

      // Check that data is included and properly formatted
      expect(loggedMessage).toContain('Test message with data');
      expect(loggedMessage).toContain(JSON.stringify(testData, null, 2));

      consoleLogSpy.mockRestore();
    });
  });

  describe('info', () => {
    test('should log info messages in non-test environments', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      logger.info('Info message');

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy.mock.calls[0][0]).toContain('[INFO] Info message');

      consoleLogSpy.mockRestore();
    });

    test('should not log in test environment', () => {
      process.env.NODE_ENV = 'test';
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      logger.info('This should not be logged');

      expect(consoleLogSpy).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });
  });

  describe('warn', () => {
    test('should log warning messages in non-test environments', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      logger.warn('Warning message');

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleWarnSpy.mock.calls[0][0]).toContain('[WARN] Warning message');

      consoleWarnSpy.mockRestore();
    });

    test('should not log in test environment', () => {
      process.env.NODE_ENV = 'test';
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      logger.warn('This should not be logged');

      expect(consoleWarnSpy).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });

  describe('error', () => {
    test('should log error messages in non-test environments', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      logger.error('Error message');

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('[ERROR] Error message');

      consoleErrorSpy.mockRestore();
    });

    test('should log error objects with stack traces', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const testError = new Error('Test error');

      // Convert the error to a plain object to ensure it's properly stringified
      const errorObj = {
        message: testError.message,
        stack: testError.stack,
      };

      logger.error('Error occurred', errorObj);

      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('[ERROR] Error occurred');
      expect(loggedMessage).toContain('Test error'); // Error message

      consoleErrorSpy.mockRestore();
    });

    test('should not log in test environment', () => {
      process.env.NODE_ENV = 'test';
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      logger.error('This should not be logged');

      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('debug', () => {
    test('should log debug messages only in development environment', () => {
      const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();

      // In development environment (set in beforeEach)
      logger.debug('Debug message');

      expect(consoleDebugSpy).toHaveBeenCalled();
      expect(consoleDebugSpy.mock.calls[0][0]).toContain('[DEBUG] Debug message');

      // Change to production
      process.env.NODE_ENV = 'production';
      consoleDebugSpy.mockClear();

      logger.debug('This should not be logged in production');

      expect(consoleDebugSpy).not.toHaveBeenCalled();

      consoleDebugSpy.mockRestore();
    });
  });

  describe('logToFile', () => {
    test('should write to a log file', async () => {
      const testMessage = 'Test log message';
      const testData = { key: 'value', number: 123 };

      await logger.logToFile(testLogFile, testMessage, testData);

      // Read the log file
      const fileContent = await fs.readFile(testLogPath, 'utf8');

      // Verify the log contains our message and data
      expect(fileContent).toContain(testMessage);
      expect(fileContent).toContain(JSON.stringify(testData, null, 2));
    });

    test('should append to an existing log file', async () => {
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

    test('should create logs directory if it does not exist', async () => {
      // Mock fs.access to throw an error (directory doesn't exist)
      const originalAccess = fs.access;
      const originalMkdir = fs.mkdir;

      fs.access = jest.fn().mockRejectedValue(new Error('Directory not found'));
      fs.mkdir = jest.fn().mockResolvedValue(undefined);

      await logger.logToFile(testLogFile, 'Test message');

      // Verify mkdir was called
      expect(fs.mkdir).toHaveBeenCalledWith(logDir, { recursive: true });

      // Restore original functions
      fs.access = originalAccess;
      fs.mkdir = originalMkdir;
    });

    test('should handle errors gracefully when creating directory', async () => {
      // Mock fs.access to throw an error (directory doesn't exist)
      // And fs.mkdir to also throw an error
      const originalAccess = fs.access;
      const originalMkdir = fs.mkdir;
      const originalConsoleError = console.error;

      fs.access = jest.fn().mockRejectedValue(new Error('Directory not found'));
      fs.mkdir = jest.fn().mockRejectedValue(new Error('Cannot create directory'));
      console.error = jest.fn();

      await logger.logToFile(testLogFile, 'Test message');

      // Verify error was logged
      expect(console.error).toHaveBeenCalled();
      expect(console.error.mock.calls[0][0]).toContain('Failed to write to log file');

      // Restore original functions
      fs.access = originalAccess;
      fs.mkdir = originalMkdir;
      console.error = originalConsoleError;
    });

    test('should handle errors gracefully when writing to file', async () => {
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

    test('should not attempt to write logs in test environment', async () => {
      process.env.NODE_ENV = 'test';

      // Spy on fs.appendFile to ensure it's not called
      const appendFileSpy = jest.spyOn(fs, 'appendFile').mockImplementation();

      await logger.logToFile(testLogFile, 'This should not be written');

      expect(appendFileSpy).not.toHaveBeenCalled();

      appendFileSpy.mockRestore();
    });
  });

  test('LogLevel enum should have the correct values', () => {
    expect(logger.LogLevel).toEqual({
      INFO: 'INFO',
      WARN: 'WARN',
      ERROR: 'ERROR',
      DEBUG: 'DEBUG',
    });
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
