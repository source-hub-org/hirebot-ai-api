/**
 * Language Model Validation Tests
 * @module test/languages/models/language.model.validation.test
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Language = require('../../../src/models/languageModel');

let mongoServer;

/**
 * Test the language model validation rules
 */
describe('Language Model Validation', () => {
  // Setup MongoDB Memory Server before tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  // Clean up after tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // Clear the database between tests
  afterEach(async () => {
    await Language.deleteMany({});
  });

  /**
   * Test required fields validation
   */
  const testRequiredFields = () => {
    it('should require name field', async () => {
      // Arrange
      const languageData = {
        designed_by: 'Microsoft',
        first_appeared: 2000,
        paradigm: ['object-oriented'],
        usage: 'Web apps',
        popularity_rank: 4,
        type_system: 'static, strong',
      };

      // Act & Assert
      const language = new Language(languageData);
      await expect(language.save()).rejects.toThrow(/Language name is required/);
    });

    it('should require designed_by field', async () => {
      // Arrange
      const languageData = {
        name: 'C#',
        first_appeared: 2000,
        paradigm: ['object-oriented'],
        usage: 'Web apps',
        popularity_rank: 4,
        type_system: 'static, strong',
      };

      // Act & Assert
      const language = new Language(languageData);
      await expect(language.save()).rejects.toThrow(/Designer information is required/);
    });

    it('should require first_appeared field', async () => {
      // Arrange
      const languageData = {
        name: 'C#',
        designed_by: 'Microsoft',
        paradigm: ['object-oriented'],
        usage: 'Web apps',
        popularity_rank: 4,
        type_system: 'static, strong',
      };

      // Act & Assert
      const language = new Language(languageData);
      await expect(language.save()).rejects.toThrow(/First appearance year is required/);
    });

    it('should require paradigm field', async () => {
      // Arrange
      const languageData = {
        name: 'C#',
        designed_by: 'Microsoft',
        first_appeared: 2000,
        usage: 'Web apps',
        popularity_rank: 4,
        type_system: 'static, strong',
      };

      // Act & Assert
      const language = new Language(languageData);
      await expect(language.save()).rejects.toThrow(/paradigm/);
    });

    it('should require usage field', async () => {
      // Arrange
      const languageData = {
        name: 'C#',
        designed_by: 'Microsoft',
        first_appeared: 2000,
        paradigm: ['object-oriented'],
        popularity_rank: 4,
        type_system: 'static, strong',
      };

      // Act & Assert
      const language = new Language(languageData);
      await expect(language.save()).rejects.toThrow(/Usage information is required/);
    });

    it('should require popularity_rank field', async () => {
      // Arrange
      const languageData = {
        name: 'C#',
        designed_by: 'Microsoft',
        first_appeared: 2000,
        paradigm: ['object-oriented'],
        usage: 'Web apps',
        type_system: 'static, strong',
      };

      // Act & Assert
      const language = new Language(languageData);
      await expect(language.save()).rejects.toThrow(/Popularity rank is required/);
    });

    it('should require type_system field', async () => {
      // Arrange
      const languageData = {
        name: 'C#',
        designed_by: 'Microsoft',
        first_appeared: 2000,
        paradigm: ['object-oriented'],
        usage: 'Web apps',
        popularity_rank: 4,
      };

      // Act & Assert
      const language = new Language(languageData);
      await expect(language.save()).rejects.toThrow(/Type system information is required/);
    });
  };

  /**
   * Test field validation rules
   */
  const testFieldValidation = () => {
    it('should validate first_appeared is at least 1940', async () => {
      // Arrange
      const languageData = {
        name: 'Invalid Language',
        designed_by: 'Test',
        first_appeared: 1939, // Invalid: before 1940
        paradigm: ['test'],
        usage: 'Testing',
        popularity_rank: 100,
        type_system: 'test',
      };

      // Act & Assert
      const language = new Language(languageData);
      await expect(language.save()).rejects.toThrow(/Year must be at least 1940/);
    });

    it('should validate popularity_rank is at least 1', async () => {
      // Arrange
      const languageData = {
        name: 'Invalid Language',
        designed_by: 'Test',
        first_appeared: 2000,
        paradigm: ['test'],
        usage: 'Testing',
        popularity_rank: 0, // Invalid: less than 1
        type_system: 'test',
      };

      // Act & Assert
      const language = new Language(languageData);
      await expect(language.save()).rejects.toThrow(/Rank must be at least 1/);
    });

    it('should validate paradigm is a non-empty array', async () => {
      // Arrange
      const languageData = {
        name: 'Invalid Language',
        designed_by: 'Test',
        first_appeared: 2000,
        paradigm: [], // Invalid: empty array
        usage: 'Testing',
        popularity_rank: 100,
        type_system: 'test',
      };

      // Act & Assert
      const language = new Language(languageData);
      await expect(language.save()).rejects.toThrow(/At least one paradigm must be specified/);
    });
  };

  // Run all test functions
  testRequiredFields();
  testFieldValidation();
});
