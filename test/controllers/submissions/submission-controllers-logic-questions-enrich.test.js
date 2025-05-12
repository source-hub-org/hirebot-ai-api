/**
 * Test for the submission controller with logic questions enrichment
 */

const { ObjectId } = require('mongodb');
const { getSubmissionById } = require('../../../src/repository/submissionRepository');
const baseRepository = require('../../../src/repository/baseRepository');
const { enrichSubmission } = require('../../../src/utils/submissionEnricher');

// Mock dependencies
jest.mock('../../../src/repository/baseRepository');
jest.mock('../../../src/utils/submissionEnricher');
jest.mock('../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('Submission Controller - Logic Questions Enrichment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSubmissionById with enrichment', () => {
    test('should enrich submission with logic question data', async () => {
      const submissionId = new ObjectId().toString();
      const logicQuestionId = new ObjectId().toString();

      const mockSubmission = {
        _id: new ObjectId(submissionId),
        candidate_id: new ObjectId().toString(),
        logic_questions: [
          {
            logic_question_id: logicQuestionId,
            answer: 'true',
            point: 10,
          },
        ],
      };

      const mockEnrichedSubmission = {
        ...mockSubmission,
        logic_questions: [
          {
            logic_question_id: logicQuestionId,
            answer: 'true',
            point: 10,
            logic_question: {
              _id: new ObjectId(logicQuestionId),
              question: 'Is this a test?',
              description: 'A simple test question',
              type: 'true_false',
              difficulty: 'easy',
            },
          },
        ],
      };

      // Mock the repository calls
      baseRepository.findOne.mockResolvedValue(mockSubmission);
      enrichSubmission.mockResolvedValue(mockEnrichedSubmission);

      const result = await getSubmissionById(submissionId, true);

      expect(baseRepository.findOne).toHaveBeenCalledWith('submissions', {
        _id: expect.any(ObjectId),
      });

      expect(enrichSubmission).toHaveBeenCalledWith(mockSubmission);

      // Check that the logic question was enriched
      expect(result.logic_questions[0]).toHaveProperty('logic_question');
      expect(result.logic_questions[0].logic_question.question).toBe('Is this a test?');
    });

    test('should return null for invalid submission ID', async () => {
      const result = await getSubmissionById('invalid-id', true);
      expect(result).toBeNull();
      expect(baseRepository.findOne).not.toHaveBeenCalled();
      expect(enrichSubmission).not.toHaveBeenCalled();
    });

    test('should return null when submission not found', async () => {
      const submissionId = new ObjectId().toString();

      baseRepository.findOne.mockResolvedValue(null);

      const result = await getSubmissionById(submissionId, true);

      expect(result).toBeNull();
      expect(baseRepository.findOne).toHaveBeenCalled();
      expect(enrichSubmission).not.toHaveBeenCalled();
    });
  });
});
