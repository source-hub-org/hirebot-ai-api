/**
 * Language Model Constraints Tests
 * @module test/languages/models/language.model.constraints.test
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Language = require('../../../src/models/languageModel');

let mongoServer;

/**
 * Test the language model constraints and special features
 */
describe('Language Model Constraints', () => {
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
   * Test creating a valid language document
   */
  const testValidLanguageCreation = () => {
    it('should create a valid language document', async () => {
      // Arrange
      const languageData = {
        name: 'JavaScript',
        designed_by: 'Brendan Eich',
        first_appeared: 1995,
        paradigm: ['event-driven', 'functional', 'imperative'],
        usage: 'Front-end web, back-end (Node.js), mobile apps',
        popularity_rank: 2,
        type_system: 'dynamic, weak',
      };

      // Act
      const language = new Language(languageData);
      const savedLanguage = await language.save();

      // Assert
      expect(savedLanguage._id).toBeDefined();
      expect(savedLanguage.name).toBe(languageData.name);
      expect(savedLanguage.designed_by).toBe(languageData.designed_by);
      expect(savedLanguage.first_appeared).toBe(languageData.first_appeared);
      expect(savedLanguage.paradigm).toEqual(expect.arrayContaining(languageData.paradigm));
      expect(savedLanguage.usage).toBe(languageData.usage);
      expect(savedLanguage.popularity_rank).toBe(languageData.popularity_rank);
      expect(savedLanguage.type_system).toBe(languageData.type_system);
      expect(savedLanguage.slug).toBe('javascript');
    });
  };

  /**
   * Test automatic slug generation
   */
  const testSlugGeneration = () => {
    it('should generate a slug from the name if not provided', async () => {
      // Arrange
      const languageData = {
        name: 'C Sharp',
        designed_by: 'Microsoft',
        first_appeared: 2000,
        paradigm: ['object-oriented', 'component-oriented'],
        usage: 'Web apps, desktop apps, game development (Unity)',
        popularity_rank: 4,
        type_system: 'static, strong',
      };

      // Act
      const language = new Language(languageData);
      const savedLanguage = await language.save();

      // Assert
      expect(savedLanguage.slug).toBe('c-sharp');
    });

    it('should use the provided slug if available', async () => {
      // Arrange
      const languageData = {
        name: 'C Sharp',
        designed_by: 'Microsoft',
        first_appeared: 2000,
        paradigm: ['object-oriented', 'component-oriented'],
        usage: 'Web apps, desktop apps, game development (Unity)',
        popularity_rank: 4,
        type_system: 'static, strong',
        slug: 'csharp',
      };

      // Act
      const language = new Language(languageData);
      const savedLanguage = await language.save();

      // Assert
      expect(savedLanguage.slug).toBe('csharp');
    });
  };

  /**
   * Test unique constraints
   */
  const testUniqueConstraints = () => {
    it('should enforce unique name constraint', async () => {
      // Arrange
      const languageData1 = {
        name: 'Python',
        designed_by: 'Guido van Rossum',
        first_appeared: 1991,
        paradigm: ['object-oriented'],
        usage: 'AI, data science',
        popularity_rank: 1,
        type_system: 'dynamic',
      };

      const languageData2 = {
        name: 'Python', // Duplicate name
        designed_by: 'Different Person',
        first_appeared: 2000,
        paradigm: ['test'],
        usage: 'Testing',
        popularity_rank: 100,
        type_system: 'test',
      };

      // Act & Assert
      await new Language(languageData1).save();

      // The second save should fail due to duplicate name
      const language2 = new Language(languageData2);
      await expect(language2.save()).rejects.toThrow(/duplicate key error/);
    });

    it('should enforce unique slug constraint', async () => {
      // Arrange
      const languageData1 = {
        name: 'Python',
        designed_by: 'Guido van Rossum',
        first_appeared: 1991,
        paradigm: ['object-oriented'],
        usage: 'AI, data science',
        popularity_rank: 1,
        type_system: 'dynamic',
        slug: 'python-lang',
      };

      const languageData2 = {
        name: 'Different Name',
        designed_by: 'Different Person',
        first_appeared: 2000,
        paradigm: ['test'],
        usage: 'Testing',
        popularity_rank: 100,
        type_system: 'test',
        slug: 'python-lang', // Duplicate slug
      };

      // Act & Assert
      await new Language(languageData1).save();

      // The second save should fail due to duplicate slug
      const language2 = new Language(languageData2);
      await expect(language2.save()).rejects.toThrow(/duplicate key error/);
    });
  };

  /**
   * Test timestamps
   */
  const testTimestamps = () => {
    it('should include createdAt and updatedAt timestamps', async () => {
      // Arrange
      const languageData = {
        name: 'JavaScript',
        designed_by: 'Brendan Eich',
        first_appeared: 1995,
        paradigm: ['event-driven'],
        usage: 'Web development',
        popularity_rank: 2,
        type_system: 'dynamic',
      };

      // Act
      const language = new Language(languageData);
      const savedLanguage = await language.save();

      // Assert
      expect(savedLanguage.createdAt).toBeInstanceOf(Date);
      expect(savedLanguage.updatedAt).toBeInstanceOf(Date);
    });
  };

  // Run all test functions
  testValidLanguageCreation();
  testSlugGeneration();
  testUniqueConstraints();
  testTimestamps();
});
