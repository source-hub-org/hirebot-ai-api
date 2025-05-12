/**
 * Test for the submission enricher with logic questions
 */

const { ObjectId } = require('mongodb');
const {
  fetchLogicQuestionsByIds,
  enrichSubmission,
} = require('../../src/utils/submissionEnricher');
const baseRepository = require('../../src/repository/baseRepository');

// Mock dependencies
jest.mock('../../src/repository/baseRepository');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('Submission Enricher - Logic Questions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchLogicQuestionsByIds', () => {
    test('should return a map of logic question IDs to logic question data', async () => {
      const logicQuestionId1 = new ObjectId().toString();
      const logicQuestionId2 = new ObjectId().toString();

      const mockLogicQuestions = [
        {
          _id: new ObjectId(logicQuestionId1),
          question: 'Logic Question 1',
          description: 'Description 1',
          type: 'multiple_choice',
          options: ['Option 1', 'Option 2'],
          difficulty: 'medium',
        },
        {
          _id: new ObjectId(logicQuestionId2),
          question: 'Logic Question 2',
          description: 'Description 2',
          type: 'true_false',
          difficulty: 'easy',
        },
      ];

      baseRepository.findMany.mockResolvedValue(mockLogicQuestions);

      const result = await fetchLogicQuestionsByIds([logicQuestionId1, logicQuestionId2]);

      expect(baseRepository.findMany).toHaveBeenCalledWith(
        'logic_questions',
        { _id: { $in: expect.any(Array) } },
        expect.any(Object)
      );

      expect(result).toHaveProperty(logicQuestionId1);
      expect(result).toHaveProperty(logicQuestionId2);
      expect(result[logicQuestionId1].question).toBe('Logic Question 1');
      expect(result[logicQuestionId2].question).toBe('Logic Question 2');
    });

    test('should return an empty object for invalid input', async () => {
      const result1 = await fetchLogicQuestionsByIds([]);
      expect(result1).toEqual({});

      const result2 = await fetchLogicQuestionsByIds(null);
      expect(result2).toEqual({});

      const result3 = await fetchLogicQuestionsByIds(['invalid-id']);
      expect(result3).toEqual({});
    });
  });

  describe('enrichSubmission with logic questions', () => {
    test('should enrich submission with logic question data', async () => {
      const logicQuestionId = new ObjectId().toString();

      const mockSubmission = {
        _id: new ObjectId(),
        candidate_id: new ObjectId().toString(),
        logic_questions: [
          {
            logic_question_id: logicQuestionId,
            answer: 'true',
            point: 10,
          },
        ],
      };

      const mockLogicQuestion = {
        _id: new ObjectId(logicQuestionId),
        question: 'Is this a test?',
        description: 'A simple test question',
        type: 'true_false',
        difficulty: 'easy',
      };

      // Mock the repository calls
      baseRepository.findOne.mockResolvedValue(null); // candidate
      baseRepository.findMany.mockImplementation(collection => {
        if (collection === 'logic_questions') {
          return Promise.resolve([mockLogicQuestion]);
        }
        return Promise.resolve([]);
      });

      const enriched = await enrichSubmission(mockSubmission);

      // Check that the logic question was enriched
      expect(enriched.logic_questions[0]).toHaveProperty('logic_question');
      expect(enriched.logic_questions[0].logic_question).toEqual(mockLogicQuestion);
    });

    test('should handle submissions without logic questions', async () => {
      const mockSubmission = {
        _id: new ObjectId(),
        candidate_id: new ObjectId().toString(),
        // No logic_questions field
      };

      baseRepository.findOne.mockResolvedValue(null);
      baseRepository.findMany.mockResolvedValue([]);

      const enriched = await enrichSubmission(mockSubmission);

      // Should not add logic_questions field if not present
      expect(enriched).not.toHaveProperty('logic_questions');
    });

    test('should handle empty logic questions array', async () => {
      const mockSubmission = {
        _id: new ObjectId(),
        candidate_id: new ObjectId().toString(),
        logic_questions: [], // Empty array
      };

      baseRepository.findOne.mockResolvedValue(null);
      baseRepository.findMany.mockResolvedValue([]);

      const enriched = await enrichSubmission(mockSubmission);

      expect(enriched).toHaveProperty('logic_questions');
      expect(enriched.logic_questions).toEqual([]);
    });
  });
});
