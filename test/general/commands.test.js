/**
 * Tests for the command handler module
 */

const { executeCommand } = require('../../src/commands');
const { initTopicsCommand } = require('../../src/commands/topicCommands');

// Mock the topicCommands module
jest.mock('../../src/commands/topicCommands', () => ({
  initTopicsCommand: jest.fn(),
}));

describe('Command Handler', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('executeCommand', () => {
    test('should execute a valid command', async () => {
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

    test('should throw an error for unknown command', async () => {
      // Attempt to execute an unknown command
      await expect(executeCommand('unknown:command', [])).rejects.toThrow(
        'Command not found: unknown:command'
      );

      // Verify no commands were called
      expect(initTopicsCommand).not.toHaveBeenCalled();
    });

    test('should propagate errors from command execution', async () => {
      // Setup mock implementation to throw an error
      const testError = new Error('Test command error');
      initTopicsCommand.mockRejectedValue(testError);

      // Mock console.error to prevent test output pollution
      const originalConsoleError = console.error;
      console.error = jest.fn();

      // Attempt to execute the command that will throw an error
      await expect(executeCommand('app:init-topics', [])).rejects.toThrow(testError);

      // Verify the error was logged
      expect(console.error).toHaveBeenCalledWith(
        'Error executing command app:init-topics:',
        testError.message
      );

      // Verify the command was called
      expect(initTopicsCommand).toHaveBeenCalledTimes(1);

      // Restore console.error
      console.error = originalConsoleError;
    });

    test('should pass arguments to the command', async () => {
      // Setup mock implementation
      initTopicsCommand.mockResolvedValue({
        success: true,
        message: 'Topics initialized successfully',
      });

      // Execute the command with multiple arguments
      const args = ['path/to/topics.json', '--force', '--verbose'];
      await executeCommand('app:init-topics', args);

      // Verify the command was called with all arguments
      expect(initTopicsCommand).toHaveBeenCalledWith(args);
    });
  });
});
