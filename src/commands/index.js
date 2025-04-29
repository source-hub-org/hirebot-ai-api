/**
 * Command Handler Module
 * @module commands
 */

const { initTopicsCommand } = require('./topicCommands');
const { initPositionsCommand } = require('./positionCommands');

/**
 * Execute a command with the given arguments
 * @param {string} commandName - The name of the command to execute
 * @param {Array<string>} args - Command arguments
 * @returns {Promise<void>}
 * @throws {Error} If the command is not found or execution fails
 */
async function executeCommand(commandName, args) {
  const commands = {
    'app:init-topics': initTopicsCommand,
    'app:init-positions': initPositionsCommand,
  };

  const command = commands[commandName];
  if (!command) {
    throw new Error(`Command not found: ${commandName}`);
  }

  try {
    await command(args);
  } catch (error) {
    console.error(`Error executing command ${commandName}:`, error.message);
    throw error;
  }
}

module.exports = {
  executeCommand,
};
