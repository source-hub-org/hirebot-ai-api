/**
 * Instrument Model Tests
 * @module test/instruments/models/instrument.model.test
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Instrument = require('../../../src/models/instrumentModel');
const InstrumentTag = require('../../../src/models/instrumentTagModel');

let mongoServer;

/**
 * Test the instrument model schema and validation rules
 */
describe('Instrument Model', () => {
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
    await Instrument.deleteMany({});
    await InstrumentTag.deleteMany({});
  });

  // Create a tag for testing
  let testTag;
  beforeEach(async () => {
    testTag = await InstrumentTag.create({
      name: 'Personality',
      description: 'Tags related to personality tests and measurements.',
    });
  });

  /**
   * Test creating a valid instrument document
   */
  const testValidInstrumentCreation = () => {
    it('should create a valid scale instrument document', async () => {
      // Arrange
      const instrumentData = {
        questionId: 'q1',
        questionText: 'I enjoy socializing with large groups of people.',
        type: 'scale',
        options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
        tags: [testTag._id],
      };

      // Act
      const instrument = new Instrument(instrumentData);
      const savedInstrument = await instrument.save();

      // Assert
      expect(savedInstrument._id).toBeDefined();
      expect(savedInstrument.questionId).toBe(instrumentData.questionId);
      expect(savedInstrument.questionText).toBe(instrumentData.questionText);
      expect(savedInstrument.type).toBe(instrumentData.type);
      expect(savedInstrument.options).toEqual(expect.arrayContaining(instrumentData.options));
      expect(savedInstrument.tags[0].toString()).toBe(testTag._id.toString());
      expect(savedInstrument.createdAt).toBeInstanceOf(Date);
      expect(savedInstrument.updatedAt).toBeInstanceOf(Date);

      // Ensure the virtual 'id' field is not present
      const instrumentObject = savedInstrument.toJSON();
      expect(instrumentObject.id).toBeUndefined();
    });

    it('should create a valid multiple-choice instrument document', async () => {
      // Arrange
      const instrumentData = {
        questionId: 'q2',
        questionText: 'Which of the following best describes your leadership style?',
        type: 'multiple-choice',
        options: ['Authoritative', 'Democratic', 'Laissez-faire', 'Transformational'],
        tags: [testTag._id],
      };

      // Act
      const instrument = new Instrument(instrumentData);
      const savedInstrument = await instrument.save();

      // Assert
      expect(savedInstrument._id).toBeDefined();
      expect(savedInstrument.questionId).toBe(instrumentData.questionId);
      expect(savedInstrument.questionText).toBe(instrumentData.questionText);
      expect(savedInstrument.type).toBe(instrumentData.type);
      expect(savedInstrument.options).toEqual(expect.arrayContaining(instrumentData.options));
      expect(savedInstrument.tags[0].toString()).toBe(testTag._id.toString());
    });

    it('should create a valid open-ended instrument document', async () => {
      // Arrange
      const instrumentData = {
        questionId: 'q3',
        questionText: 'Describe a situation where you demonstrated leadership skills.',
        type: 'open-ended',
        tags: [testTag._id],
      };

      // Act
      const instrument = new Instrument(instrumentData);
      const savedInstrument = await instrument.save();

      // Assert
      expect(savedInstrument._id).toBeDefined();
      expect(savedInstrument.questionId).toBe(instrumentData.questionId);
      expect(savedInstrument.questionText).toBe(instrumentData.questionText);
      expect(savedInstrument.type).toBe(instrumentData.type);
      expect(savedInstrument.tags[0].toString()).toBe(testTag._id.toString());
    });

    it('should create a valid boolean instrument document', async () => {
      // Arrange
      const instrumentData = {
        questionId: 'q4',
        questionText: 'Have you ever managed a team?',
        type: 'boolean',
        tags: [testTag._id],
      };

      // Act
      const instrument = new Instrument(instrumentData);
      const savedInstrument = await instrument.save();

      // Assert
      expect(savedInstrument._id).toBeDefined();
      expect(savedInstrument.questionId).toBe(instrumentData.questionId);
      expect(savedInstrument.questionText).toBe(instrumentData.questionText);
      expect(savedInstrument.type).toBe(instrumentData.type);
      expect(savedInstrument.tags[0].toString()).toBe(testTag._id.toString());
    });
  };

  /**
   * Test required fields validation
   */
  const testRequiredFields = () => {
    it('should require questionId field', async () => {
      // Arrange
      const instrumentData = {
        questionText: 'I enjoy socializing with large groups of people.',
        type: 'scale',
        options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
        tags: [testTag._id],
      };

      // Act & Assert
      const instrument = new Instrument(instrumentData);
      await expect(instrument.save()).rejects.toThrow(/Question ID is required/);
    });

    it('should require questionText field', async () => {
      // Arrange
      const instrumentData = {
        questionId: 'q1',
        type: 'scale',
        options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
        tags: [testTag._id],
      };

      // Act & Assert
      const instrument = new Instrument(instrumentData);
      await expect(instrument.save()).rejects.toThrow(/Question text is required/);
    });

    it('should require type field', async () => {
      // Arrange
      const instrumentData = {
        questionId: 'q1',
        questionText: 'I enjoy socializing with large groups of people.',
        options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
        tags: [testTag._id],
      };

      // Act & Assert
      const instrument = new Instrument(instrumentData);
      await expect(instrument.save()).rejects.toThrow(/Question type is required/);
    });

    it('should require at least one tag', async () => {
      // Arrange
      const instrumentData = {
        questionId: 'q1',
        questionText: 'I enjoy socializing with large groups of people.',
        type: 'scale',
        options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
        tags: [],
      };

      // Act & Assert
      const instrument = new Instrument(instrumentData);
      await expect(instrument.save()).rejects.toThrow(/At least one tag is required/);
    });

    it('should require options for scale type', async () => {
      // Arrange
      const instrumentData = {
        questionId: 'q1',
        questionText: 'I enjoy socializing with large groups of people.',
        type: 'scale',
        tags: [testTag._id],
      };

      // Act & Assert
      const instrument = new Instrument(instrumentData);
      await expect(instrument.save()).rejects.toThrow(/Options are required for scale/);
    });

    it('should require options for multiple-choice type', async () => {
      // Arrange
      const instrumentData = {
        questionId: 'q2',
        questionText: 'Which of the following best describes your leadership style?',
        type: 'multiple-choice',
        tags: [testTag._id],
      };

      // Act & Assert
      const instrument = new Instrument(instrumentData);
      await expect(instrument.save()).rejects.toThrow(/Options are required for.*multiple-choice/);
    });
  };

  /**
   * Test field validation rules
   */
  const testFieldValidation = () => {
    it('should validate type is one of the allowed values', async () => {
      // Arrange
      const instrumentData = {
        questionId: 'q1',
        questionText: 'I enjoy socializing with large groups of people.',
        type: 'invalid-type',
        options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
        tags: [testTag._id],
      };

      // Act & Assert
      const instrument = new Instrument(instrumentData);
      await expect(instrument.save()).rejects.toThrow(/Type must be one of/);
    });

    it('should validate options are not empty for scale type', async () => {
      // Arrange
      const instrumentData = {
        questionId: 'q1',
        questionText: 'I enjoy socializing with large groups of people.',
        type: 'scale',
        options: [],
        tags: [testTag._id],
      };

      // Act & Assert
      const instrument = new Instrument(instrumentData);
      await expect(instrument.save()).rejects.toThrow(/Options are required for scale/);
    });
  };

  /**
   * Test unique constraints
   */
  const testUniqueConstraints = () => {
    it('should enforce unique questionId constraint', async () => {
      // Arrange
      const instrumentData1 = {
        questionId: 'q1',
        questionText: 'I enjoy socializing with large groups of people.',
        type: 'scale',
        options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
        tags: [testTag._id],
      };

      const instrumentData2 = {
        questionId: 'q1', // Duplicate questionId
        questionText: 'Different question text',
        type: 'scale',
        options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
        tags: [testTag._id],
      };

      // Act & Assert
      await new Instrument(instrumentData1).save();

      // The second save should fail due to duplicate questionId
      const instrument2 = new Instrument(instrumentData2);
      await expect(instrument2.save()).rejects.toThrow(/duplicate key error/);
    });
  };

  /**
   * Test timestamps
   */
  const testTimestamps = () => {
    it('should include createdAt and updatedAt timestamps', async () => {
      // Arrange
      const instrumentData = {
        questionId: 'q1',
        questionText: 'I enjoy socializing with large groups of people.',
        type: 'scale',
        options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
        tags: [testTag._id],
      };

      // Act
      const instrument = new Instrument(instrumentData);
      const savedInstrument = await instrument.save();

      // Assert
      expect(savedInstrument.createdAt).toBeInstanceOf(Date);
      expect(savedInstrument.updatedAt).toBeInstanceOf(Date);
    });
  };

  /**
   * Test collection name
   */
  const testCollectionName = () => {
    it('should use the correct collection name', () => {
      // Assert
      expect(Instrument.collection.name).toBe('instruments');
    });
  };

  // Run all test functions
  testValidInstrumentCreation();
  testRequiredFields();
  testFieldValidation();
  testUniqueConstraints();
  testTimestamps();
  testCollectionName();
});
