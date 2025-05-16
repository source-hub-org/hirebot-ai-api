/**
 * Tests for Logic Question Service
 */

const {
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require('../../src/services/logicQuestionService');
const {
  createLogicQuestion,
  updateLogicQuestion,
  deleteLogicQuestion,
} = require('../../src/repository/logicQuestionRepository');
const { checkLogicTagsExist } = require('../../src/repository/logicTagRepository');
const { isValidObjectId, areValidObjectIds } = require('../../src/utils/validateObjectId');
const { getQuestionById } = require('../../src/services/logicQuestionGetService');
const logger = require('../../src/utils/logger');

// Mock dependencies
jest.mock('../../src/repository/logicQuestionRepository');
jest.mock('../../src/repository/logicTagRepository');
jest.mock('../../src/utils/validateObjectId');
jest.mock('../../src/services/logicQuestionGetService');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Logic Question Service', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('createQuestion', () => {
    it('should create a question successfully', async () => {
      // Mock data
      const questionData = {
        question: 'What is a closure in JavaScript?',
        level: 3,
        tag_ids: ['60d21b4667d0d8992e610c85', '60d21b4667d0d8992e610c86'],
        type: 'multiple_choice',
        choices: [
          { text: 'A function that returns another function', is_correct: true },
          { text: 'A variable that cannot be changed', is_correct: false },
        ],
        answer_explanation:
          'A closure is a function that has access to its outer function scope even after the outer function has returned.',
      };

      const createdQuestion = {
        _id: '60d21b4667d0d8992e610c87',
        ...questionData,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      // Setup mocks
      areValidObjectIds.mockReturnValue(true);
      checkLogicTagsExist.mockResolvedValue({
        success: true,
        data: [
          { _id: '60d21b4667d0d8992e610c85', name: 'JavaScript' },
          { _id: '60d21b4667d0d8992e610c86', name: 'Functions' },
        ],
      });
      createLogicQuestion.mockResolvedValue(createdQuestion);

      // Call the service
      const result = await createQuestion(questionData);

      // Verify results
      expect(areValidObjectIds).toHaveBeenCalledWith([
        '60d21b4667d0d8992e610c85',
        '60d21b4667d0d8992e610c86',
      ]);
      expect(checkLogicTagsExist).toHaveBeenCalledWith([
        '60d21b4667d0d8992e610c85',
        '60d21b4667d0d8992e610c86',
      ]);
      expect(createLogicQuestion).toHaveBeenCalledWith(questionData);
      expect(logger.info).toHaveBeenCalledWith('Logic question created successfully');
      expect(result).toEqual({
        success: true,
        data: createdQuestion,
      });
    });

    it('should handle validation errors', async () => {
      // Mock data with missing required fields
      const questionData = {
        level: 'not-a-number',
        tag_ids: 'not-an-array',
        type: 'invalid-type',
      };

      // Setup mocks
      areValidObjectIds.mockReturnValue(false);

      // Call the service
      const result = await createQuestion(questionData);

      // Verify results
      expect(checkLogicTagsExist).not.toHaveBeenCalled();
      expect(createLogicQuestion).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith('Invalid logic question data:', expect.any(Array));
      expect(result).toEqual({
        success: false,
        errors: expect.arrayContaining([
          'Question text is required',
          'Tag IDs must be an array',
          'Difficulty level must be a number',
          'Question type must be either "multiple_choice" or "open_question"',
          'Answer explanation is required',
        ]),
      });
    });

    it('should handle non-existent tags', async () => {
      // Mock data
      const questionData = {
        question: 'What is a closure in JavaScript?',
        level: 3,
        tag_ids: ['60d21b4667d0d8992e610c85', '60d21b4667d0d8992e610c86'],
        type: 'multiple_choice',
        choices: [
          { text: 'A function that returns another function', is_correct: true },
          { text: 'A variable that cannot be changed', is_correct: false },
        ],
        answer_explanation:
          'A closure is a function that has access to its outer function scope even after the outer function has returned.',
      };

      // Setup mocks
      areValidObjectIds.mockReturnValue(true);
      checkLogicTagsExist.mockResolvedValue({
        success: false,
        errors: ['One or more tags do not exist'],
        data: [{ _id: '60d21b4667d0d8992e610c85', name: 'JavaScript' }],
      });

      // Call the service
      const result = await createQuestion(questionData);

      // Verify results
      expect(areValidObjectIds).toHaveBeenCalledWith([
        '60d21b4667d0d8992e610c85',
        '60d21b4667d0d8992e610c86',
      ]);
      expect(checkLogicTagsExist).toHaveBeenCalledWith([
        '60d21b4667d0d8992e610c85',
        '60d21b4667d0d8992e610c86',
      ]);
      expect(createLogicQuestion).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith('One or more logic tags do not exist');
      expect(result).toEqual({
        success: false,
        errors: ['One or more tags do not exist'],
      });
    });

    it('should handle error during creation', async () => {
      // Mock data
      const questionData = {
        question: 'What is a closure in JavaScript?',
        level: 3,
        tag_ids: ['60d21b4667d0d8992e610c85', '60d21b4667d0d8992e610c86'],
        type: 'multiple_choice',
        choices: [
          { text: 'A function that returns another function', is_correct: true },
          { text: 'A variable that cannot be changed', is_correct: false },
        ],
        answer_explanation:
          'A closure is a function that has access to its outer function scope even after the outer function has returned.',
      };

      const error = new Error('Database connection failed');

      // Setup mocks
      areValidObjectIds.mockReturnValue(true);
      checkLogicTagsExist.mockResolvedValue({
        success: true,
        data: [
          { _id: '60d21b4667d0d8992e610c85', name: 'JavaScript' },
          { _id: '60d21b4667d0d8992e610c86', name: 'Functions' },
        ],
      });
      createLogicQuestion.mockRejectedValue(error);

      // Call the service
      const result = await createQuestion(questionData);

      // Verify results
      expect(areValidObjectIds).toHaveBeenCalledWith([
        '60d21b4667d0d8992e610c85',
        '60d21b4667d0d8992e610c86',
      ]);
      expect(checkLogicTagsExist).toHaveBeenCalledWith([
        '60d21b4667d0d8992e610c85',
        '60d21b4667d0d8992e610c86',
      ]);
      expect(createLogicQuestion).toHaveBeenCalledWith(questionData);
      expect(logger.error).toHaveBeenCalledWith('Error creating logic question:', error);
      expect(result).toEqual({
        success: false,
        errors: ['Error creating question: Database connection failed'],
      });
    });
  });

  describe('updateQuestion', () => {
    it('should update a question successfully', async () => {
      // Mock data
      const questionId = '60d21b4667d0d8992e610c87';
      const updateData = {
        question: 'Updated: What is a closure in JavaScript?',
        level: 4,
        tag_ids: ['60d21b4667d0d8992e610c85', '60d21b4667d0d8992e610c86'],
        answer_explanation: 'Updated explanation about closures in JavaScript.',
      };

      const existingQuestion = {
        _id: questionId,
        question: 'What is a closure in JavaScript?',
        level: 3,
        tag_ids: ['60d21b4667d0d8992e610c85'],
        type: 'multiple_choice',
        choices: [
          { text: 'A function that returns another function', is_correct: true },
          { text: 'A variable that cannot be changed', is_correct: false },
        ],
        answer_explanation:
          'A closure is a function that has access to its outer function scope even after the outer function has returned.',
      };

      const updatedQuestion = {
        ...existingQuestion,
        ...updateData,
        updatedAt: '2023-01-02T00:00:00.000Z',
      };

      // Setup mocks
      isValidObjectId.mockReturnValue(true);
      getQuestionById.mockResolvedValue({
        success: true,
        data: existingQuestion,
      });
      areValidObjectIds.mockReturnValue(true);
      checkLogicTagsExist.mockResolvedValue({
        success: true,
        data: [
          { _id: '60d21b4667d0d8992e610c85', name: 'JavaScript' },
          { _id: '60d21b4667d0d8992e610c86', name: 'Functions' },
        ],
      });
      updateLogicQuestion.mockResolvedValue(updatedQuestion);

      // Call the service
      const result = await updateQuestion(questionId, updateData);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(questionId);
      expect(getQuestionById).toHaveBeenCalledWith(questionId);
      expect(areValidObjectIds).toHaveBeenCalledWith([
        '60d21b4667d0d8992e610c85',
        '60d21b4667d0d8992e610c86',
      ]);
      expect(checkLogicTagsExist).toHaveBeenCalledWith([
        '60d21b4667d0d8992e610c85',
        '60d21b4667d0d8992e610c86',
      ]);
      expect(updateLogicQuestion).toHaveBeenCalledWith(questionId, updateData);
      expect(logger.info).toHaveBeenCalledWith(
        `Logic question with ID ${questionId} updated successfully`
      );
      expect(result).toEqual({
        success: true,
        data: updatedQuestion,
      });
    });

    it('should handle invalid ID format', async () => {
      // Mock data
      const invalidId = 'invalid-id';
      const updateData = {
        question: 'Updated question',
      };

      // Setup mocks
      isValidObjectId.mockReturnValue(false);

      // Call the service
      const result = await updateQuestion(invalidId, updateData);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(invalidId);
      expect(getQuestionById).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(`Invalid question ID format: ${invalidId}`);
      expect(result).toEqual({
        success: false,
        errors: ['Invalid question ID format'],
      });
    });

    it('should handle question not found', async () => {
      // Mock data
      const questionId = '60d21b4667d0d8992e610c87';
      const updateData = {
        question: 'Updated question',
      };

      // Setup mocks
      isValidObjectId.mockReturnValue(true);
      getQuestionById.mockResolvedValue({
        success: false,
        errors: ['Question not found'],
      });

      // Call the service
      const result = await updateQuestion(questionId, updateData);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(questionId);
      expect(getQuestionById).toHaveBeenCalledWith(questionId);
      expect(updateLogicQuestion).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        errors: ['Question not found'],
      });
    });

    it('should handle validation errors', async () => {
      // Mock data
      const questionId = '60d21b4667d0d8992e610c87';
      const updateData = {
        level: 'not-a-number',
        tag_ids: 'not-an-array',
        type: 'invalid-type',
      };

      const existingQuestion = {
        _id: questionId,
        question: 'What is a closure in JavaScript?',
        level: 3,
        tag_ids: ['60d21b4667d0d8992e610c85'],
        type: 'multiple_choice',
        choices: [
          { text: 'A function that returns another function', is_correct: true },
          { text: 'A variable that cannot be changed', is_correct: false },
        ],
        answer_explanation:
          'A closure is a function that has access to its outer function scope even after the outer function has returned.',
      };

      // Setup mocks
      isValidObjectId.mockReturnValue(true);
      getQuestionById.mockResolvedValue({
        success: true,
        data: existingQuestion,
      });
      areValidObjectIds.mockReturnValue(false);

      // Call the service
      const result = await updateQuestion(questionId, updateData);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(questionId);
      expect(getQuestionById).toHaveBeenCalledWith(questionId);
      expect(updateLogicQuestion).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith('Invalid logic question data:', expect.any(Array));
      expect(result).toEqual({
        success: false,
        errors: expect.arrayContaining([
          'Tag IDs must be an array',
          'Difficulty level must be a number',
          'Question type must be either "multiple_choice" or "open_question"',
        ]),
      });
    });

    it('should handle non-existent tags', async () => {
      // Mock data
      const questionId = '60d21b4667d0d8992e610c87';
      const updateData = {
        tag_ids: ['60d21b4667d0d8992e610c85', '60d21b4667d0d8992e610c86'],
      };

      const existingQuestion = {
        _id: questionId,
        question: 'What is a closure in JavaScript?',
        level: 3,
        tag_ids: ['60d21b4667d0d8992e610c85'],
        type: 'multiple_choice',
        choices: [
          { text: 'A function that returns another function', is_correct: true },
          { text: 'A variable that cannot be changed', is_correct: false },
        ],
        answer_explanation:
          'A closure is a function that has access to its outer function scope even after the outer function has returned.',
      };

      // Setup mocks
      isValidObjectId.mockReturnValue(true);
      getQuestionById.mockResolvedValue({
        success: true,
        data: existingQuestion,
      });
      areValidObjectIds.mockReturnValue(true);
      checkLogicTagsExist.mockResolvedValue({
        success: false,
        errors: ['One or more tags do not exist'],
        data: [{ _id: '60d21b4667d0d8992e610c85', name: 'JavaScript' }],
      });

      // Call the service
      const result = await updateQuestion(questionId, updateData);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(questionId);
      expect(getQuestionById).toHaveBeenCalledWith(questionId);
      expect(areValidObjectIds).toHaveBeenCalledWith([
        '60d21b4667d0d8992e610c85',
        '60d21b4667d0d8992e610c86',
      ]);
      expect(checkLogicTagsExist).toHaveBeenCalledWith([
        '60d21b4667d0d8992e610c85',
        '60d21b4667d0d8992e610c86',
      ]);
      expect(updateLogicQuestion).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith('One or more logic tags do not exist');
      expect(result).toEqual({
        success: false,
        errors: ['One or more tags do not exist'],
      });
    });

    it('should handle error during update', async () => {
      // Mock data
      const questionId = '60d21b4667d0d8992e610c87';
      const updateData = {
        question: 'Updated: What is a closure in JavaScript?',
      };

      const existingQuestion = {
        _id: questionId,
        question: 'What is a closure in JavaScript?',
        level: 3,
        tag_ids: ['60d21b4667d0d8992e610c85'],
        type: 'multiple_choice',
        choices: [
          { text: 'A function that returns another function', is_correct: true },
          { text: 'A variable that cannot be changed', is_correct: false },
        ],
        answer_explanation:
          'A closure is a function that has access to its outer function scope even after the outer function has returned.',
      };

      const error = new Error('Database connection failed');

      // Setup mocks
      isValidObjectId.mockReturnValue(true);
      getQuestionById.mockResolvedValue({
        success: true,
        data: existingQuestion,
      });
      updateLogicQuestion.mockRejectedValue(error);

      // Call the service
      const result = await updateQuestion(questionId, updateData);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(questionId);
      expect(getQuestionById).toHaveBeenCalledWith(questionId);
      expect(updateLogicQuestion).toHaveBeenCalledWith(questionId, updateData);
      expect(logger.error).toHaveBeenCalledWith(
        `Error updating logic question with ID ${questionId}:`,
        error
      );
      expect(result).toEqual({
        success: false,
        errors: ['Error updating question: Database connection failed'],
      });
    });
  });

  describe('deleteQuestion', () => {
    it('should delete a question successfully', async () => {
      // Mock data
      const questionId = '60d21b4667d0d8992e610c87';
      const mockQuestion = {
        _id: questionId,
        question: 'What is a closure in JavaScript?',
        level: 3,
        tag_ids: ['60d21b4667d0d8992e610c85'],
        type: 'multiple_choice',
        choices: [
          { text: 'A function that returns another function', is_correct: true },
          { text: 'A variable that cannot be changed', is_correct: false },
        ],
        answer_explanation:
          'A closure is a function that has access to its outer function scope even after the outer function has returned.',
      };

      // Setup mocks
      isValidObjectId.mockReturnValue(true);
      getQuestionById.mockResolvedValue({
        success: true,
        data: mockQuestion,
      });
      deleteLogicQuestion.mockResolvedValue(mockQuestion);

      // Call the service
      const result = await deleteQuestion(questionId);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(questionId);
      expect(getQuestionById).toHaveBeenCalledWith(questionId);
      expect(deleteLogicQuestion).toHaveBeenCalledWith(questionId);
      expect(logger.info).toHaveBeenCalledWith(
        `Logic question with ID ${questionId} deleted successfully`
      );
      expect(result).toEqual({
        success: true,
        data: mockQuestion,
      });
    });

    it('should handle invalid ID format', async () => {
      // Mock data
      const invalidId = 'invalid-id';

      // Setup mocks
      isValidObjectId.mockReturnValue(false);

      // Call the service
      const result = await deleteQuestion(invalidId);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(invalidId);
      expect(getQuestionById).not.toHaveBeenCalled();
      expect(deleteLogicQuestion).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(`Invalid question ID format: ${invalidId}`);
      expect(result).toEqual({
        success: false,
        errors: ['Invalid question ID format'],
      });
    });

    it('should handle question not found', async () => {
      // Mock data
      const questionId = '60d21b4667d0d8992e610c87';

      // Setup mocks
      isValidObjectId.mockReturnValue(true);
      getQuestionById.mockResolvedValue({
        success: false,
        errors: ['Question not found'],
      });

      // Call the service
      const result = await deleteQuestion(questionId);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(questionId);
      expect(getQuestionById).toHaveBeenCalledWith(questionId);
      expect(deleteLogicQuestion).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        errors: ['Question not found'],
      });
    });

    it('should handle error during deletion', async () => {
      // Mock data
      const questionId = '60d21b4667d0d8992e610c87';
      const mockQuestion = {
        _id: questionId,
        question: 'What is a closure in JavaScript?',
        level: 3,
        tag_ids: ['60d21b4667d0d8992e610c85'],
        type: 'multiple_choice',
        choices: [
          { text: 'A function that returns another function', is_correct: true },
          { text: 'A variable that cannot be changed', is_correct: false },
        ],
        answer_explanation:
          'A closure is a function that has access to its outer function scope even after the outer function has returned.',
      };
      const error = new Error('Database connection failed');

      // Setup mocks
      isValidObjectId.mockReturnValue(true);
      getQuestionById.mockResolvedValue({
        success: true,
        data: mockQuestion,
      });
      deleteLogicQuestion.mockRejectedValue(error);

      // Call the service
      const result = await deleteQuestion(questionId);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(questionId);
      expect(getQuestionById).toHaveBeenCalledWith(questionId);
      expect(deleteLogicQuestion).toHaveBeenCalledWith(questionId);
      expect(logger.error).toHaveBeenCalledWith(
        `Error deleting logic question with ID ${questionId}:`,
        error
      );
      expect(result).toEqual({
        success: false,
        errors: ['Error deleting question: Database connection failed'],
      });
    });
  });
});
