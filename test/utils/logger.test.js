/**
 * Tests for the Logger Utility
 */

const fs = require('fs').promises;
const { LogLevel, info, warn, error, debug, logToFile } = require('../../src/utils/logger');

// Mock dependencies
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    appendFile: jest.fn(),
  },
}));

describe('Logger Utility', () => {
  // Store original console methods and process.env
  const originalConsole = { ...console };
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Mock console methods
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
    console.debug = jest.fn();

    // Reset mocks
    jest.clearAllMocks();

    // Reset process.env
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore console methods
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.debug = originalConsole.debug;

    // Restore process.env
    process.env = originalEnv;
  });

  describe('LogLevel enum', () => {
    it('should define the correct log levels', () => {
      expect(LogLevel).toEqual({
        INFO: 'INFO',
        WARN: 'WARN',
        ERROR: 'ERROR',
        DEBUG: 'DEBUG',
      });
    });
  });

  describe('info', () => {
    it('should log info messages in non-test environments', () => {
      process.env.NODE_ENV = 'development';

      info('Test info message');

      expect(console.log).toHaveBeenCalled();
      const logMessage = console.log.mock.calls[0][0];
      expect(logMessage).toContain('[INFO] Test info message');
    });

    it('should include optional data in the log message', () => {
      process.env.NODE_ENV = 'development';
      const data = { key: 'value' };

      info('Test info message', data);

      expect(console.log).toHaveBeenCalled();
      const logMessage = console.log.mock.calls[0][0];
      expect(logMessage).toContain('[INFO] Test info message');
      expect(logMessage).toContain(JSON.stringify(data, null, 2));
    });

    it('should not log in test environments', () => {
      process.env.NODE_ENV = 'test';

      info('Test info message');

      expect(console.log).not.toHaveBeenCalled();

      process.env.NODE_ENV = 'testing';

      info('Test info message');

      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('should log warning messages in non-test environments', () => {
      process.env.NODE_ENV = 'development';

      warn('Test warning message');

      expect(console.warn).toHaveBeenCalled();
      const logMessage = console.warn.mock.calls[0][0];
      expect(logMessage).toContain('[WARN] Test warning message');
    });

    it('should include optional data in the log message', () => {
      process.env.NODE_ENV = 'development';
      const data = { key: 'value' };

      warn('Test warning message', data);

      expect(console.warn).toHaveBeenCalled();
      const logMessage = console.warn.mock.calls[0][0];
      expect(logMessage).toContain('[WARN] Test warning message');
      expect(logMessage).toContain(JSON.stringify(data, null, 2));
    });

    it('should not log in test environments', () => {
      process.env.NODE_ENV = 'test';

      warn('Test warning message');

      expect(console.warn).not.toHaveBeenCalled();

      process.env.NODE_ENV = 'testing';

      warn('Test warning message');

      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should log error messages in non-test environments', () => {
      process.env.NODE_ENV = 'development';

      error('Test error message');

      expect(console.error).toHaveBeenCalled();
      const logMessage = console.error.mock.calls[0][0];
      expect(logMessage).toContain('[ERROR] Test error message');
    });

    it('should include optional error in the log message', () => {
      process.env.NODE_ENV = 'development';
      const testError = new Error('Test error');

      error('Test error message', testError);

      expect(console.error).toHaveBeenCalled();
      const logMessage = console.error.mock.calls[0][0];
      expect(logMessage).toContain('[ERROR] Test error message');
      expect(logMessage).toContain(JSON.stringify(testError, null, 2));
    });

    it('should not log in test environments', () => {
      process.env.NODE_ENV = 'test';

      error('Test error message');

      expect(console.error).not.toHaveBeenCalled();

      process.env.NODE_ENV = 'testing';

      error('Test error message');

      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('debug', () => {
    it('should log debug messages only in development environment', () => {
      process.env.NODE_ENV = 'development';

      debug('Test debug message');

      expect(console.debug).toHaveBeenCalled();
      const logMessage = console.debug.mock.calls[0][0];
      expect(logMessage).toContain('[DEBUG] Test debug message');

      // Reset mock
      console.debug.mockClear();

      // Test other environments
      process.env.NODE_ENV = 'production';

      debug('Test debug message');

      expect(console.debug).not.toHaveBeenCalled();
    });

    it('should include optional data in the log message', () => {
      process.env.NODE_ENV = 'development';
      const data = { key: 'value' };

      debug('Test debug message', data);

      expect(console.debug).toHaveBeenCalled();
      const logMessage = console.debug.mock.calls[0][0];
      expect(logMessage).toContain('[DEBUG] Test debug message');
      expect(logMessage).toContain(JSON.stringify(data, null, 2));
    });
  });

  describe('logToFile', () => {
    it('should not perform file operations in test environments', async () => {
      process.env.NODE_ENV = 'test';

      await logToFile('test.log', 'Test log message');

      expect(fs.access).not.toHaveBeenCalled();
      expect(fs.mkdir).not.toHaveBeenCalled();
      expect(fs.appendFile).not.toHaveBeenCalled();

      process.env.NODE_ENV = 'testing';

      await logToFile('test.log', 'Test log message');

      expect(fs.access).not.toHaveBeenCalled();
      expect(fs.mkdir).not.toHaveBeenCalled();
      expect(fs.appendFile).not.toHaveBeenCalled();
    });

    it('should create logs directory if it does not exist', async () => {
      process.env.NODE_ENV = 'development';

      // Mock fs.access to throw error (directory does not exist)
      fs.access.mockRejectedValueOnce(new Error('Directory not found'));

      await logToFile('test.log', 'Test log message');

      expect(fs.access).toHaveBeenCalled();
      expect(fs.mkdir).toHaveBeenCalledWith(expect.stringContaining('logs'), { recursive: true });
      expect(fs.appendFile).toHaveBeenCalled();
    });

    it('should append log message to file', async () => {
      process.env.NODE_ENV = 'development';

      // Mock fs.access to resolve (directory exists)
      fs.access.mockResolvedValueOnce();

      await logToFile('test.log', 'Test log message');

      expect(fs.access).toHaveBeenCalled();
      expect(fs.mkdir).not.toHaveBeenCalled();
      expect(fs.appendFile).toHaveBeenCalledWith(
        expect.stringContaining('test.log'),
        expect.stringContaining('Test log message'),
        'utf8'
      );
    });

    it('should include optional data in the log message', async () => {
      process.env.NODE_ENV = 'development';
      const data = { key: 'value' };

      // Mock fs.access to resolve (directory exists)
      fs.access.mockResolvedValueOnce();

      await logToFile('test.log', 'Test log message', data);

      expect(fs.appendFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining(JSON.stringify(data, null, 2)),
        'utf8'
      );
    });

    it('should handle errors when writing to file', async () => {
      process.env.NODE_ENV = 'development';

      // Mock fs.access to resolve (directory exists)
      fs.access.mockResolvedValueOnce();

      // Mock fs.appendFile to throw error
      const appendError = new Error('Failed to write to file');
      fs.appendFile.mockRejectedValueOnce(appendError);

      // Mock console.error to verify it's called with the error
      console.error = jest.fn();

      await logToFile('test.log', 'Test log message');

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to write to log file test.log:'),
        appendError
      );
    });
  });
});
