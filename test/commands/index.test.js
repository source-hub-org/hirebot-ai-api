/**
 * Tests for the commands index module
 * @module test/commands/index.test
 */

const { executeCommand } = require('../../src/commands');
const { initTopicsCommand } = require('../../src/commands/topicCommands');
const { initPositionsCommand } = require('../../src/commands/positionCommands');
const { initLanguagesCommand } = require('../../src/commands/languageCommands');

// Mock dependencies
jest.mock('../../src/commands/topicCommands');
jest.mock('../../src/commands/positionCommands');
jest.mock('../../src/commands/languageCommands');

describe('Commands Index Module', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock console.error to prevent test output pollution
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // Restore console.error after all tests
  afterAll(() => {
    console.error.mockRestore();
  });

  describe('executeCommand', () => {
    test('should execute initTopicsCommand correctly', async () => {
      // Setup mock implementation
      initTopicsCommand.mockResolvedValue({
        success: true,
        message: 'Topics initialized successfully',
      });

      // Execute the command
      await executeCommand('app:init-topics', ['path/to/topics.json']);

      // Verify the command was called with the correct arguments
      expect(initTopicsCommand).toHaveBeenCalledTimes(1);
      expect(initTopicsCommand).toHaveBeenCalledWith(['path/to/topics.json']);
    });

    test('should execute initPositionsCommand correctly', async () => {
      // Setup mock implementation
      initPositionsCommand.mockResolvedValue({
        success: true,
        message: 'Positions initialized successfully',
      });

      // Execute the command
      await executeCommand('app:init-positions', ['path/to/positions.json']);

      // Verify the command was called with the correct arguments
      expect(initPositionsCommand).toHaveBeenCalledTimes(1);
      expect(initPositionsCommand).toHaveBeenCalledWith(['path/to/positions.json']);
    });

    test('should execute initLanguagesCommand correctly', async () => {
      // Setup mock implementation
      initLanguagesCommand.mockResolvedValue({
        inserted: 5,
        skipped: 2,
        total: 7,
      });

      // Execute the command
      await executeCommand('app:init-languages', ['path/to/languages.json']);

      // Verify the command was called with the correct arguments
      expect(initLanguagesCommand).toHaveBeenCalledTimes(1);
      expect(initLanguagesCommand).toHaveBeenCalledWith(['path/to/languages.json']);
    });

    test('should throw error for unknown command', async () => {
      // Attempt to execute an unknown command
      await expect(executeCommand('unknown:command', [])).rejects.toThrow(
        'Command not found: unknown:command'
      );

      // Verify no commands were called
      expect(initTopicsCommand).not.toHaveBeenCalled();
      expect(initPositionsCommand).not.toHaveBeenCalled();
      expect(initLanguagesCommand).not.toHaveBeenCalled();
    });

    test('should propagate errors from command execution', async () => {
      // Setup mock implementation to throw an error
      const testError = new Error('Test command error');
      initTopicsCommand.mockRejectedValue(testError);

      // Attempt to execute the command that will throw an error
      await expect(executeCommand('app:init-topics', [])).rejects.toThrow(testError);

      // Verify the error was logged
      expect(console.error).toHaveBeenCalledWith(
        'Error executing command app:init-topics:',
        testError.message
      );

      // Verify the command was called
      expect(initTopicsCommand).toHaveBeenCalledTimes(1);
    });

    test('should pass arguments to the command', async () => {
      // Setup mock implementation
      initPositionsCommand.mockResolvedValue({
        success: true,
        message: 'Positions initialized successfully',
      });

      // Execute the command with multiple arguments
      const args = ['path/to/positions.json', '--force', '--verbose'];
      await executeCommand('app:init-positions', args);

      // Verify the command was called with all arguments
      expect(initPositionsCommand).toHaveBeenCalledWith(args);
    });

    test('should handle undefined or null arguments', async () => {
      // Setup mock implementation
      initLanguagesCommand.mockResolvedValue({
        inserted: 0,
        skipped: 0,
        total: 0,
      });

      // Execute the command with undefined arguments
      await executeCommand('app:init-languages', undefined);

      // Verify the command was called with undefined
      expect(initLanguagesCommand).toHaveBeenCalledWith(undefined);

      // Reset mocks
      jest.clearAllMocks();

      // Execute the command with null arguments
      await executeCommand('app:init-languages', null);

      // Verify the command was called with null
      expect(initLanguagesCommand).toHaveBeenCalledWith(null);
    });
  });
});
