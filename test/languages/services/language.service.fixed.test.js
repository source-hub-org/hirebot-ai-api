/**
 * Language Service Tests
 * @module test/languages/services/language.service.test
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const {
  createLanguageService,
  getAllLanguagesService,
  getLanguageByIdService,
  updateLanguageService,
  deleteLanguageService,
} = require('../../../src/service/languageService');

// Mock the repository functions
jest.mock('../../../src/repository/languageRepository', () => ({
  createLanguage: jest.fn(),
  getLanguageById: jest.fn(),
  getLanguageByName: jest.fn(),
  getLanguageBySlug: jest.fn(),
  getAllLanguages: jest.fn(),
  updateLanguage: jest.fn(),
  deleteLanguage: jest.fn(),
}));

// Mock the baseRepository
jest.mock('../../../src/repository/baseRepository', () => ({
  getCollection: jest.fn(),
}));

// Import the mocked functions
const {
  createLanguage,
  getLanguageById,
  getLanguageByName,
  getLanguageBySlug,
  getAllLanguages,
  updateLanguage,
  deleteLanguage,
} = require('../../../src/repository/languageRepository');

const { getCollection } = require('../../../src/repository/baseRepository');

jest.mock('../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

/**
 * Test the language service functions
 */
describe('Language Service', () => {
  let mongoServer;

  // Sample language data for testing
  const sampleLanguage = {
    name: 'JavaScript',
    designed_by: 'Brendan Eich',
    first_appeared: 1995,
    paradigm: ['event-driven', 'functional', 'imperative'],
    usage: 'Front-end web, back-end (Node.js), mobile apps',
    popularity_rank: 2,
    type_system: 'dynamic, weak',
    slug: 'javascript',
  };

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

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test creating a language
   */
  describe('createLanguageService', () => {
    it('should create a language successfully', async () => {
      // Arrange
      const languageData = { ...sampleLanguage };
      delete languageData.slug; // Remove slug to test auto-generation

      getLanguageByName.mockResolvedValue(null);
      getLanguageBySlug.mockResolvedValue(null);
      createLanguage.mockResolvedValue({ _id: 'mock-id', ...languageData, slug: 'javascript' });

      // Act
      const result = await createLanguageService(languageData);

      // Assert
      expect(getLanguageByName).toHaveBeenCalledWith(languageData.name);
      expect(createLanguage).toHaveBeenCalledWith({ ...languageData, slug: 'javascript' });
      expect(result).toEqual({ _id: 'mock-id', ...languageData, slug: 'javascript' });
    });

    it('should generate a slug if not provided', async () => {
      // Arrange
      const languageData = { ...sampleLanguage, name: 'Test Language' };
      delete languageData.slug;

      getLanguageByName.mockResolvedValue(null);
      getLanguageBySlug.mockResolvedValue(null);
      createLanguage.mockResolvedValue({
        _id: 'mock-id',
        ...languageData,
        slug: 'test-language',
      });

      // Act
      const result = await createLanguageService(languageData);

      // Assert
      expect(getLanguageBySlug).toHaveBeenCalledWith('test-language');
      expect(createLanguage).toHaveBeenCalledWith({ ...languageData, slug: 'test-language' });
      expect(result).toEqual({ _id: 'mock-id', ...languageData, slug: 'test-language' });
    });

    it('should throw an error if language with same name exists', async () => {
      // Arrange
      const languageData = { ...sampleLanguage };
      getLanguageByName.mockResolvedValue({ _id: 'existing-id', ...languageData });

      // Act & Assert
      await expect(createLanguageService(languageData)).rejects.toThrow(
        `Language with name '${languageData.name}' already exists`
      );
      expect(createLanguage).not.toHaveBeenCalled();
    });

    it('should throw an error if language with same slug exists', async () => {
      // Arrange
      const languageData = { ...sampleLanguage, slug: 'javascript' };
      getLanguageByName.mockResolvedValue(null);
      getLanguageBySlug.mockResolvedValue({ _id: 'existing-id', ...languageData });

      // Act & Assert
      await expect(createLanguageService(languageData)).rejects.toThrow(
        `Language with slug '${languageData.slug}' already exists`
      );
      expect(createLanguage).not.toHaveBeenCalled();
    });
  });

  /**
   * Test getting all languages
   */
  describe('getAllLanguagesService', () => {
    it('should get all languages with default options', async () => {
      // Arrange
      const languages = [
        { _id: 'id1', ...sampleLanguage },
        { _id: 'id2', name: 'Python', ...sampleLanguage },
      ];

      const mockCollection = {
        countDocuments: jest.fn().mockResolvedValue(2),
      };

      // Mock the repository functions
      getAllLanguages.mockResolvedValue(languages);

      // Mock the baseRepository.getCollection function
      getCollection.mockReturnValue(mockCollection);

      // Act
      const result = await getAllLanguagesService();

      // Assert
      expect(getAllLanguages).toHaveBeenCalledWith({}, expect.any(Object));
      expect(getCollection).toHaveBeenCalledWith('languages');
      expect(result).toEqual({
        languages,
        totalCount: 2,
      });
    });

    it('should apply filters from query parameters', async () => {
      // Arrange
      const queryParams = {
        name: 'Java',
        designed_by: 'James',
        first_appeared: '1995',
        paradigm: 'object-oriented',
        popularity_rank: '3',
        type_system: 'static',
        slug: 'java',
        page: '2',
        limit: '5',
        sortBy: 'name',
        sortOrder: 'desc',
      };

      const languages = [{ _id: 'id1', name: 'Java', ...sampleLanguage }];

      const mockCollection = {
        countDocuments: jest.fn().mockResolvedValue(1),
      };

      // Mock the repository functions
      getAllLanguages.mockResolvedValue(languages);

      // Mock the baseRepository.getCollection function
      getCollection.mockReturnValue(mockCollection);

      // Act
      const result = await getAllLanguagesService(queryParams);

      // Assert
      expect(result).toEqual({
        languages,
        totalCount: 1,
      });

      // Verify getAllLanguages was called with appropriate filter and options
      expect(getAllLanguages).toHaveBeenCalled();
      expect(getCollection).toHaveBeenCalledWith('languages');
    });
  });

  /**
   * Test getting a language by ID
   */
  describe('getLanguageByIdService', () => {
    it('should get a language by ID', async () => {
      // Arrange
      const languageId = 'mock-id';
      const language = { _id: languageId, ...sampleLanguage };
      getLanguageById.mockResolvedValue(language);

      // Act
      const result = await getLanguageByIdService(languageId);

      // Assert
      expect(getLanguageById).toHaveBeenCalledWith(languageId);
      expect(result).toEqual(language);
    });

    it('should return null if language not found', async () => {
      // Arrange
      const languageId = 'non-existent-id';
      getLanguageById.mockResolvedValue(null);

      // Act
      const result = await getLanguageByIdService(languageId);

      // Assert
      expect(getLanguageById).toHaveBeenCalledWith(languageId);
      expect(result).toBeNull();
    });

    it('should propagate errors from repository', async () => {
      // Arrange
      const languageId = 'mock-id';
      const error = new Error('Database error');
      getLanguageById.mockRejectedValue(error);

      // Act & Assert
      await expect(getLanguageByIdService(languageId)).rejects.toThrow('Database error');
    });
  });

  /**
   * Test updating a language
   */
  describe('updateLanguageService', () => {
    it('should update a language successfully', async () => {
      // Arrange
      const languageId = 'mock-id';
      const existingLanguage = { _id: languageId, ...sampleLanguage };
      const updateData = { usage: 'Updated usage' };
      const updatedLanguage = { ...existingLanguage, ...updateData };

      getLanguageById.mockResolvedValue(existingLanguage);
      updateLanguage.mockResolvedValue(updatedLanguage);

      // Act
      const result = await updateLanguageService(languageId, updateData);

      // Assert
      expect(getLanguageById).toHaveBeenCalledWith(languageId);
      expect(updateLanguage).toHaveBeenCalledWith(languageId, updateData);
      expect(result).toEqual(updatedLanguage);
    });

    it('should return null if language not found', async () => {
      // Arrange
      const languageId = 'non-existent-id';
      const updateData = { usage: 'Updated usage' };

      getLanguageById.mockResolvedValue(null);

      // Act
      const result = await updateLanguageService(languageId, updateData);

      // Assert
      expect(getLanguageById).toHaveBeenCalledWith(languageId);
      expect(result).toBeNull();
    });

    it('should generate a slug if name is updated but slug is not provided', async () => {
      // Arrange
      const languageId = 'mock-id';
      const existingLanguage = { _id: languageId, ...sampleLanguage, slug: 'javascript' };
      const updateData = { name: 'Updated JavaScript' };
      const expectedSlug = 'updated-javascript';

      getLanguageById.mockResolvedValue(existingLanguage);
      getLanguageByName.mockResolvedValue(null);
      getLanguageBySlug.mockResolvedValue(null);
      updateLanguage.mockResolvedValue({
        ...existingLanguage,
        ...updateData,
        slug: expectedSlug,
      });

      // Act
      const result = await updateLanguageService(languageId, updateData);

      // Assert
      expect(updateLanguage).toHaveBeenCalledWith(languageId, {
        ...updateData,
        slug: expectedSlug,
      });
      expect(result.slug).toBe(expectedSlug);
    });

    it('should throw an error if updated name already exists', async () => {
      // Arrange
      const languageId = 'mock-id';
      const existingLanguage = { _id: languageId, ...sampleLanguage };
      const updateData = { name: 'Python' };

      getLanguageById.mockResolvedValue(existingLanguage);
      getLanguageByName.mockResolvedValue({ _id: 'different-id', name: 'Python' });

      // Act & Assert
      await expect(updateLanguageService(languageId, updateData)).rejects.toThrow(
        `Language with name 'Python' already exists`
      );
    });

    it('should throw an error if updated slug already exists', async () => {
      // Arrange
      const languageId = 'mock-id';
      const existingLanguage = { _id: languageId, ...sampleLanguage };
      const updateData = { slug: 'python' };

      getLanguageById.mockResolvedValue(existingLanguage);
      getLanguageByName.mockResolvedValue(null);
      getLanguageBySlug.mockResolvedValue({ _id: 'different-id', slug: 'python' });

      // Act & Assert
      await expect(updateLanguageService(languageId, updateData)).rejects.toThrow(
        `Language with slug 'python' already exists`
      );
    });
  });

  /**
   * Test deleting a language
   */
  describe('deleteLanguageService', () => {
    it('should delete a language successfully', async () => {
      // Arrange
      const languageId = 'mock-id';
      deleteLanguage.mockResolvedValue(true);

      // Act
      const result = await deleteLanguageService(languageId);

      // Assert
      expect(deleteLanguage).toHaveBeenCalledWith(languageId);
      expect(result).toBe(true);
    });

    it('should return false if language not found', async () => {
      // Arrange
      const languageId = 'non-existent-id';
      deleteLanguage.mockResolvedValue(false);

      // Act
      const result = await deleteLanguageService(languageId);

      // Assert
      expect(deleteLanguage).toHaveBeenCalledWith(languageId);
      expect(result).toBe(false);
    });

    it('should propagate errors from repository', async () => {
      // Arrange
      const languageId = 'mock-id';
      const error = new Error('Database error');
      deleteLanguage.mockRejectedValue(error);

      // Act & Assert
      await expect(deleteLanguageService(languageId)).rejects.toThrow('Database error');
    });
  });
});
