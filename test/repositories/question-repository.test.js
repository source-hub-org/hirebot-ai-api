/**
 * Tests for the question repository module
 * @module test/repositories/question-repository.test
 */

const { ObjectId } = require('mongodb');
const {
  createQuestion,
  getQuestionById,
  updateQuestionById,
  deleteQuestionById,
} = require('../../src/repository/questionRepository');
const { insertOne, findOne, updateOne, deleteOne } = require('../../src/repository/baseRepository');

// Mock the base repository module
jest.mock('../../src/repository/baseRepository');

describe('Question Repository Tests', () => {
  // Sample question for testing
  const sampleQuestion = {
    question: 'What is a closure in JavaScript?',
    options: [
      'A function that returns another function',
      'A variable that cannot be changed',
      'A function with access to its outer scope',
      'A method to close a connection',
    ],
    correctAnswer: 2,
    explanation: 'A closure is a function that has access to variables from its outer scope.',
    difficulty: 'medium',
    category: 'JavaScript Concepts',
    topic: 'JavaScript',
    language: 'JavaScript',
    position: 'Junior',
    positionLevel: 2,
    createdAt: new Date('2023-01-01'),
  };

  // Sample ObjectId
  const sampleId = new ObjectId('60d21b4667d0d8992e610c85');

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('createQuestion', () => {
    test('should create a question successfully', async () => {
      // Mock insertOne to return success
      insertOne.mockResolvedValue({
        acknowledged: true,
        insertedId: sampleId,
      });

      // Mock findOne to return the created question
      findOne.mockResolvedValue({
        _id: sampleId,
        ...sampleQuestion,
      });

      // Call the repository function
      const result = await createQuestion(sampleQuestion);

      // Verify the result
      expect(result).toEqual({
        _id: sampleId,
        ...sampleQuestion,
      });

      // Verify insertOne was called with correct parameters
      expect(insertOne).toHaveBeenCalledWith('questions', sampleQuestion);

      // Verify findOne was called with correct parameters
      expect(findOne).toHaveBeenCalledWith('questions', { _id: sampleId });
    });

    test('should add createdAt timestamp if not provided', async () => {
      // Create a question without createdAt
      const questionWithoutCreatedAt = { ...sampleQuestion };
      delete questionWithoutCreatedAt.createdAt;

      // Mock insertOne to return success
      insertOne.mockResolvedValue({
        acknowledged: true,
        insertedId: sampleId,
      });

      // Mock findOne to return the created question
      findOne.mockResolvedValue({
        _id: sampleId,
        ...questionWithoutCreatedAt,
        createdAt: expect.any(Date),
      });

      // Call the repository function
      await createQuestion(questionWithoutCreatedAt);

      // Verify insertOne was called with a createdAt timestamp
      expect(insertOne).toHaveBeenCalledWith(
        'questions',
        expect.objectContaining({
          ...questionWithoutCreatedAt,
          createdAt: expect.any(Date),
        })
      );
    });

    test('should throw error when insertion fails', async () => {
      // Mock insertOne to return failure
      insertOne.mockResolvedValue({
        acknowledged: false,
      });

      // Call the repository function and expect it to throw
      await expect(createQuestion(sampleQuestion)).rejects.toThrow('Failed to create question');

      // Verify insertOne was called
      expect(insertOne).toHaveBeenCalled();

      // Verify findOne was not called
      expect(findOne).not.toHaveBeenCalled();
    });

    test('should handle database errors during creation', async () => {
      // Mock insertOne to throw error
      const error = new Error('Database error');
      insertOne.mockRejectedValue(error);

      // Call the repository function and expect it to throw
      await expect(createQuestion(sampleQuestion)).rejects.toThrow('Database error');

      // Verify insertOne was called
      expect(insertOne).toHaveBeenCalled();

      // Verify findOne was not called
      expect(findOne).not.toHaveBeenCalled();
    });
  });

  describe('getQuestionById', () => {
    test('should get a question by ID successfully', async () => {
      // Mock findOne to return the question
      findOne.mockResolvedValue({
        _id: sampleId,
        ...sampleQuestion,
      });

      // Call the repository function
      const result = await getQuestionById(sampleId.toString());

      // Verify the result
      expect(result).toEqual({
        _id: sampleId,
        ...sampleQuestion,
      });

      // Verify findOne was called with correct parameters
      expect(findOne).toHaveBeenCalledWith('questions', { _id: expect.any(ObjectId) });
    });

    test('should return null for invalid ID format', async () => {
      // Call the repository function with invalid ID
      const result = await getQuestionById('invalid-id');

      // Verify the result
      expect(result).toBeNull();

      // Verify findOne was not called
      expect(findOne).not.toHaveBeenCalled();
    });

    test('should return null when question is not found', async () => {
      // Mock findOne to return null
      findOne.mockResolvedValue(null);

      // Call the repository function
      const result = await getQuestionById(sampleId.toString());

      // Verify the result
      expect(result).toBeNull();

      // Verify findOne was called
      expect(findOne).toHaveBeenCalled();
    });

    test('should handle database errors during retrieval', async () => {
      // Mock findOne to throw error
      const error = new Error('Database error');
      findOne.mockRejectedValue(error);

      // Call the repository function and expect it to throw
      await expect(getQuestionById(sampleId.toString())).rejects.toThrow('Database error');

      // Verify findOne was called
      expect(findOne).toHaveBeenCalled();
    });
  });

  describe('updateQuestionById', () => {
    test('should update a question successfully', async () => {
      // Create update data
      const updateData = {
        question: 'Updated question text',
        explanation: 'Updated explanation',
      };

      // Mock updateOne to return success
      updateOne.mockResolvedValue({
        acknowledged: true,
        matchedCount: 1,
        modifiedCount: 1,
      });

      // Mock findOne to return the updated question
      findOne.mockResolvedValue({
        _id: sampleId,
        ...sampleQuestion,
        ...updateData,
      });

      // Call the repository function
      const result = await updateQuestionById(sampleId.toString(), updateData);

      // Verify the result
      expect(result).toEqual({
        _id: sampleId,
        ...sampleQuestion,
        ...updateData,
      });

      // Verify updateOne was called with correct parameters
      expect(updateOne).toHaveBeenCalledWith(
        'questions',
        { _id: expect.any(ObjectId) },
        { $set: updateData }
      );

      // Verify findOne was called with correct parameters
      expect(findOne).toHaveBeenCalledWith('questions', { _id: expect.any(ObjectId) });
    });

    test('should remove _id from update data if present', async () => {
      // Create update data with _id
      const updateData = {
        _id: new ObjectId(), // This should be removed
        question: 'Updated question text',
      };

      // Mock updateOne to return success
      updateOne.mockResolvedValue({
        acknowledged: true,
        matchedCount: 1,
        modifiedCount: 1,
      });

      // Mock findOne to return the updated question
      findOne.mockResolvedValue({
        _id: sampleId,
        ...sampleQuestion,
        question: 'Updated question text',
      });

      // Call the repository function
      await updateQuestionById(sampleId.toString(), updateData);

      // Verify updateOne was called without the _id in the update data
      expect(updateOne).toHaveBeenCalledWith(
        'questions',
        { _id: expect.any(ObjectId) },
        { $set: { question: 'Updated question text' } }
      );
    });

    test('should return null for invalid ID format', async () => {
      // Call the repository function with invalid ID
      const result = await updateQuestionById('invalid-id', { question: 'Updated' });

      // Verify the result
      expect(result).toBeNull();

      // Verify updateOne was not called
      expect(updateOne).not.toHaveBeenCalled();

      // Verify findOne was not called
      expect(findOne).not.toHaveBeenCalled();
    });

    test('should return null when question is not found', async () => {
      // Mock updateOne to return no matches
      updateOne.mockResolvedValue({
        acknowledged: true,
        matchedCount: 0,
        modifiedCount: 0,
      });

      // Call the repository function
      const result = await updateQuestionById(sampleId.toString(), { question: 'Updated' });

      // Verify the result
      expect(result).toBeNull();

      // Verify updateOne was called
      expect(updateOne).toHaveBeenCalled();

      // Verify findOne was not called
      expect(findOne).not.toHaveBeenCalled();
    });

    test('should throw error when update fails', async () => {
      // Mock updateOne to return failure
      updateOne.mockResolvedValue({
        acknowledged: false,
      });

      // Call the repository function and expect it to throw
      await expect(
        updateQuestionById(sampleId.toString(), { question: 'Updated' })
      ).rejects.toThrow(`Failed to update question with ID ${sampleId.toString()}`);

      // Verify updateOne was called
      expect(updateOne).toHaveBeenCalled();

      // Verify findOne was not called
      expect(findOne).not.toHaveBeenCalled();
    });

    test('should handle database errors during update', async () => {
      // Mock updateOne to throw error
      const error = new Error('Database error');
      updateOne.mockRejectedValue(error);

      // Call the repository function and expect it to throw
      await expect(
        updateQuestionById(sampleId.toString(), { question: 'Updated' })
      ).rejects.toThrow('Database error');

      // Verify updateOne was called
      expect(updateOne).toHaveBeenCalled();

      // Verify findOne was not called
      expect(findOne).not.toHaveBeenCalled();
    });
  });

  describe('deleteQuestionById', () => {
    test('should delete a question successfully', async () => {
      // Mock deleteOne to return success
      deleteOne.mockResolvedValue({
        acknowledged: true,
        deletedCount: 1,
      });

      // Call the repository function
      const result = await deleteQuestionById(sampleId.toString());

      // Verify the result
      expect(result).toBe(true);

      // Verify deleteOne was called with correct parameters
      expect(deleteOne).toHaveBeenCalledWith('questions', { _id: expect.any(ObjectId) });
    });

    test('should return false for invalid ID format', async () => {
      // Call the repository function with invalid ID
      const result = await deleteQuestionById('invalid-id');

      // Verify the result
      expect(result).toBe(false);

      // Verify deleteOne was not called
      expect(deleteOne).not.toHaveBeenCalled();
    });

    test('should return false when question is not found', async () => {
      // Mock deleteOne to return no deletions
      deleteOne.mockResolvedValue({
        acknowledged: true,
        deletedCount: 0,
      });

      // Call the repository function
      const result = await deleteQuestionById(sampleId.toString());

      // Verify the result
      expect(result).toBe(false);

      // Verify deleteOne was called
      expect(deleteOne).toHaveBeenCalled();
    });

    test('should throw error when deletion fails', async () => {
      // Mock deleteOne to return failure
      deleteOne.mockResolvedValue({
        acknowledged: false,
      });

      // Call the repository function and expect it to throw
      await expect(deleteQuestionById(sampleId.toString())).rejects.toThrow(
        `Failed to delete question with ID ${sampleId.toString()}`
      );

      // Verify deleteOne was called
      expect(deleteOne).toHaveBeenCalled();
    });

    test('should handle database errors during deletion', async () => {
      // Mock deleteOne to throw error
      const error = new Error('Database error');
      deleteOne.mockRejectedValue(error);

      // Call the repository function and expect it to throw
      await expect(deleteQuestionById(sampleId.toString())).rejects.toThrow('Database error');

      // Verify deleteOne was called
      expect(deleteOne).toHaveBeenCalled();
    });
  });
});
