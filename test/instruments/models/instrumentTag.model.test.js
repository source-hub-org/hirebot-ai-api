/**
 * Instrument Tag Model Tests
 * @module test/instruments/models/instrumentTag.model.test
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const InstrumentTag = require('../../../src/models/instrumentTagModel');

let mongoServer;

/**
 * Test the instrument tag model schema and validation rules
 */
describe('Instrument Tag Model', () => {
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
    await InstrumentTag.deleteMany({});
  });

  /**
   * Test creating a valid instrument tag document
   */
  const testValidInstrumentTagCreation = () => {
    it('should create a valid instrument tag document', async () => {
      // Arrange
      const tagData = {
        name: 'Personality',
        description: 'Tags related to personality tests and measurements.',
      };

      // Act
      const tag = new InstrumentTag(tagData);
      const savedTag = await tag.save();

      // Assert
      expect(savedTag._id).toBeDefined();
      expect(savedTag.name).toBe(tagData.name);
      expect(savedTag.description).toBe(tagData.description);
      expect(savedTag.createdAt).toBeInstanceOf(Date);
      expect(savedTag.updatedAt).toBeInstanceOf(Date);

      // Ensure the virtual 'id' field is not present
      const tagObject = savedTag.toJSON();
      expect(tagObject.id).toBeUndefined();
    });
  };

  /**
   * Test required fields validation
   */
  const testRequiredFields = () => {
    it('should require name field', async () => {
      // Arrange
      const tagData = {
        description: 'Tags related to personality tests and measurements.',
      };

      // Act & Assert
      const tag = new InstrumentTag(tagData);
      await expect(tag.save()).rejects.toThrow(/Tag name is required/);
    });

    it('should require description field', async () => {
      // Arrange
      const tagData = {
        name: 'Personality',
      };

      // Act & Assert
      const tag = new InstrumentTag(tagData);
      await expect(tag.save()).rejects.toThrow(/Tag description is required/);
    });
  };

  /**
   * Test unique constraints
   */
  const testUniqueConstraints = () => {
    it('should enforce unique name constraint', async () => {
      // Arrange
      const tagData1 = {
        name: 'Personality',
        description: 'Tags related to personality tests and measurements.',
      };

      const tagData2 = {
        name: 'Personality', // Duplicate name
        description: 'Different description',
      };

      // Act & Assert
      await new InstrumentTag(tagData1).save();

      // The second save should fail due to duplicate name
      const tag2 = new InstrumentTag(tagData2);
      await expect(tag2.save()).rejects.toThrow(/duplicate key error/);
    });
  };

  /**
   * Test timestamps
   */
  const testTimestamps = () => {
    it('should include createdAt and updatedAt timestamps', async () => {
      // Arrange
      const tagData = {
        name: 'Personality',
        description: 'Tags related to personality tests and measurements.',
      };

      // Act
      const tag = new InstrumentTag(tagData);
      const savedTag = await tag.save();

      // Assert
      expect(savedTag.createdAt).toBeInstanceOf(Date);
      expect(savedTag.updatedAt).toBeInstanceOf(Date);
    });
  };

  /**
   * Test collection name
   */
  const testCollectionName = () => {
    it('should use the correct collection name', () => {
      // Assert
      expect(InstrumentTag.collection.name).toBe('instrument_tags');
    });
  };

  // Run all test functions
  testValidInstrumentTagCreation();
  testRequiredFields();
  testUniqueConstraints();
  testTimestamps();
  testCollectionName();
});
