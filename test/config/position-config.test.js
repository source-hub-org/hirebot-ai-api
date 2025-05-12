/**
 * Tests for the Position Configuration Module
 */

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('positionConfig', () => {
  let originalEnv;
  let positionConfig;

  beforeEach(() => {
    // Clear module cache to ensure fresh imports with new environment variables
    jest.resetModules();

    // Save original environment
    originalEnv = { ...process.env };

    // Import the module under test
    positionConfig = require('../../src/config/positionConfig');
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('getDifficultyText', () => {
    test('should return a difficulty text when environment variable is not set', () => {
      const result = positionConfig.getDifficultyText('junior');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    test('should return environment variable value when set', () => {
      const customText = 'Custom junior difficulty text';
      process.env.POSITION_DIFFICULTY_TEXT_JUNIOR = customText;

      // Re-import the module to pick up new env vars
      jest.resetModules();
      positionConfig = require('../../src/config/positionConfig');

      const result = positionConfig.getDifficultyText('junior');
      expect(result).toBe(customText);
    });

    test('should return generic value for unknown position', () => {
      const result = positionConfig.getDifficultyText('unknown');
      expect(result).toBe('various difficulty levels');
    });
  });

  describe('getPositionInstruction', () => {
    test('should return a position instruction when environment variable is not set', () => {
      const result = positionConfig.getPositionInstruction('senior');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    test('should return environment variable value when set', () => {
      const customText = 'Custom senior position instruction';
      process.env.POSITION_INSTRUCTION_SENIOR = customText;

      // Re-import the module to pick up new env vars
      jest.resetModules();
      positionConfig = require('../../src/config/positionConfig');

      const result = positionConfig.getPositionInstruction('senior');
      expect(result).toBe(customText);
    });

    test('should return generic value for unknown position', () => {
      const result = positionConfig.getPositionInstruction('unknown');
      expect(result).toBe('suitable for developers of different experience levels');
    });
  });

  describe('getPositionLevel', () => {
    test('should return default position level when environment variable is not set', () => {
      const result = positionConfig.getPositionLevel('middle');
      expect(result).toBe(positionConfig.DEFAULT_POSITION_LEVELS.middle);
    });

    test('should return environment variable value when set', () => {
      const customLevel = 4.5;
      process.env.POSITION_LEVEL_MIDDLE = customLevel.toString();

      // Re-import the module to pick up new env vars
      jest.resetModules();
      positionConfig = require('../../src/config/positionConfig');

      const result = positionConfig.getPositionLevel('middle');
      expect(result).toBe(customLevel);
    });

    test('should return default level for invalid environment variable value', () => {
      process.env.POSITION_LEVEL_MIDDLE = 'not-a-number';

      // Re-import the module to pick up new env vars
      jest.resetModules();
      positionConfig = require('../../src/config/positionConfig');

      const result = positionConfig.getPositionLevel('middle');
      expect(result).toBe(positionConfig.DEFAULT_POSITION_LEVELS.middle);
    });

    test('should return default junior level (3) for unknown position', () => {
      const result = positionConfig.getPositionLevel('unknown');
      expect(result).toBe(3);
    });
  });

  describe('DEFAULT constants', () => {
    test('should export DEFAULT_DIFFICULTY_TEXT', () => {
      expect(positionConfig.DEFAULT_DIFFICULTY_TEXT).toBeDefined();
      expect(typeof positionConfig.DEFAULT_DIFFICULTY_TEXT.junior).toBe('string');
    });

    test('should export DEFAULT_POSITION_INSTRUCTION', () => {
      expect(positionConfig.DEFAULT_POSITION_INSTRUCTION).toBeDefined();
      expect(typeof positionConfig.DEFAULT_POSITION_INSTRUCTION.senior).toBe('string');
    });

    test('should export DEFAULT_POSITION_LEVELS', () => {
      expect(positionConfig.DEFAULT_POSITION_LEVELS).toBeDefined();
      expect(positionConfig.DEFAULT_POSITION_LEVELS.expert).toBe(6);
    });
  });
});
