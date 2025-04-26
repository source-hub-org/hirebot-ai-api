/**
 * Submission Enricher Tests
 */

const { ObjectId } = require('mongodb');
const baseRepository = require('../../src/repository/baseRepository');
const {
  fetchCandidateById,
  fetchQuestionsByIds,
  enrichSubmission,
  enrichSubmissions,
} = require('../../src/utils/submissionEnricher');

// Mock dependencies
jest.mock('../../src/repository/baseRepository');
jest.mock('../../src/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

describe('Submission Enricher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchCandidateById', () => {
    test('should fetch candidate with selected fields', async () => {
      // Mock data
      const candidateId = '507f1f77bcf86cd799439011';
      const candidate = {
        _id: new ObjectId(candidateId),
        full_name: 'John Doe',
        email: 'john@example.com',
        phone_number: '1234567890',
        interview_level: 'junior',
        skills: ['JavaScript', 'React'],
        programming_languages: ['JavaScript'],
        status: 'active',
        // Fields that should be excluded
        cv_url: 'https://example.com/cv.pdf',
        portfolio_url: 'https://example.com/portfolio',
      };

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findOne.mockResolvedValue(candidate);

      // Execute
      const result = await fetchCandidateById(candidateId);

      // Verify
      expect(baseRepository.findOne).toHaveBeenCalledWith(
        'candidates',
        { _id: expect.any(ObjectId) },
        {
          projection: {
            full_name: 1,
            email: 1,
            phone_number: 1,
            interview_level: 1,
            skills: 1,
            programming_languages: 1,
            status: 1,
          },
        }
      );
      expect(result).toEqual(candidate);
    });

    test('should return null for invalid ObjectId', async () => {
      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(false);

      // Execute
      const result = await fetchCandidateById('invalid-id');

      // Verify
      expect(baseRepository.findOne).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test('should return null when database error occurs', async () => {
      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findOne.mockRejectedValue(new Error('Database error'));

      // Execute
      const result = await fetchCandidateById('507f1f77bcf86cd799439011');

      // Verify
      expect(result).toBeNull();
    });
  });

  describe('fetchQuestionsByIds', () => {
    test('should fetch questions with selected fields', async () => {
      // Mock data
      const questionIds = ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'];
      const questions = [
        {
          _id: new ObjectId(questionIds[0]),
          text: 'Question 1',
          type: 'multiple_choice',
          difficulty: 'easy',
          options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          topic_id: '507f1f77bcf86cd799439013',
          // Fields that should be excluded
          created_at: '2023-01-01',
          updated_at: '2023-01-02',
        },
        {
          _id: new ObjectId(questionIds[1]),
          text: 'Question 2',
          type: 'multiple_choice',
          difficulty: 'medium',
          options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          topic_id: '507f1f77bcf86cd799439014',
        },
      ];

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findMany.mockResolvedValue(questions);

      // Execute
      const result = await fetchQuestionsByIds(questionIds);

      // Verify
      expect(baseRepository.findMany).toHaveBeenCalledWith(
        'questions',
        { _id: { $in: expect.any(Array) } },
        {
          projection: {
            text: 1,
            type: 1,
            difficulty: 1,
            options: 1,
            topic_id: 1,
            correctAnswer: 1,
            category: 1,
            topic: 1,
          },
        }
      );
      expect(result).toEqual({
        [questionIds[0]]: questions[0],
        [questionIds[1]]: questions[1],
      });
    });

    test('should return empty object for empty questionIds array', async () => {
      // Execute
      const result = await fetchQuestionsByIds([]);

      // Verify
      expect(baseRepository.findMany).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });

    test('should filter out invalid ObjectIds', async () => {
      // Mock data
      const questionIds = ['507f1f77bcf86cd799439011', 'invalid-id'];
      const questions = [
        {
          _id: new ObjectId(questionIds[0]),
          text: 'Question 1',
        },
      ];

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockImplementation(id => id === questionIds[0]);
      baseRepository.findMany.mockResolvedValue(questions);

      // Execute
      const result = await fetchQuestionsByIds(questionIds);

      // Verify
      expect(baseRepository.findMany).toHaveBeenCalledWith(
        'questions',
        { _id: { $in: [expect.any(ObjectId)] } },
        expect.any(Object)
      );
      expect(result).toEqual({
        [questionIds[0]]: questions[0],
      });
    });

    test('should return empty object when database error occurs', async () => {
      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findMany.mockRejectedValue(new Error('Database error'));

      // Execute
      const result = await fetchQuestionsByIds(['507f1f77bcf86cd799439011']);

      // Verify
      expect(result).toEqual({});
    });
  });

  describe('enrichSubmission', () => {
    test('should enrich a submission with candidate and question data', async () => {
      // Mock data
      const submission = {
        _id: new ObjectId('507f1f77bcf86cd799439011'),
        candidate_id: '507f1f77bcf86cd799439012',
        answers: [
          {
            question_id: '507f1f77bcf86cd799439013',
            answer: 2,
          },
          {
            question_id: '507f1f77bcf86cd799439014',
            answer: 1,
          },
        ],
      };

      const candidate = {
        _id: new ObjectId(submission.candidate_id),
        full_name: 'John Doe',
        email: 'john@example.com',
      };

      const questions = {
        '507f1f77bcf86cd799439013': {
          _id: new ObjectId('507f1f77bcf86cd799439013'),
          text: 'Question 1',
          type: 'multiple_choice',
        },
        '507f1f77bcf86cd799439014': {
          _id: new ObjectId('507f1f77bcf86cd799439014'),
          text: 'Question 2',
          type: 'multiple_choice',
        },
      };

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findOne.mockResolvedValue(candidate);
      baseRepository.findMany.mockResolvedValue([
        questions['507f1f77bcf86cd799439013'],
        questions['507f1f77bcf86cd799439014'],
      ]);

      // Execute
      const result = await enrichSubmission(submission);

      // Verify
      const expected = {
        ...submission,
        candidate,
        answers: [
          {
            question_id: '507f1f77bcf86cd799439013',
            answer: 2,
            question: questions['507f1f77bcf86cd799439013'],
          },
          {
            question_id: '507f1f77bcf86cd799439014',
            answer: 1,
            question: questions['507f1f77bcf86cd799439014'],
          },
        ],
      };

      expect(result).toEqual(expected);
    });

    test('should handle missing candidate', async () => {
      // Mock data
      const submission = {
        _id: new ObjectId('507f1f77bcf86cd799439011'),
        candidate_id: '507f1f77bcf86cd799439012',
        answers: [],
      };

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findOne.mockResolvedValue(null);
      baseRepository.findMany.mockResolvedValue([]);

      // Execute
      const result = await enrichSubmission(submission);

      // Verify
      expect(result).toEqual({
        ...submission,
        candidate: null,
        answers: [],
      });
    });

    test('should handle missing questions', async () => {
      // Mock data
      const submission = {
        _id: new ObjectId('507f1f77bcf86cd799439011'),
        candidate_id: '507f1f77bcf86cd799439012',
        answers: [
          {
            question_id: '507f1f77bcf86cd799439013',
            answer: 2,
          },
        ],
      };

      const candidate = {
        _id: new ObjectId(submission.candidate_id),
        full_name: 'John Doe',
      };

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findOne.mockResolvedValue(candidate);
      baseRepository.findMany.mockResolvedValue([]);

      // Execute
      const result = await enrichSubmission(submission);

      // Verify
      expect(result).toEqual({
        ...submission,
        candidate,
        answers: [
          {
            question_id: '507f1f77bcf86cd799439013',
            answer: 2,
            question: null,
          },
        ],
      });
    });

    test('should return null for null submission', async () => {
      // Execute
      const result = await enrichSubmission(null);

      // Verify
      expect(result).toBeNull();
    });

    test('should return original submission when error occurs', async () => {
      // Mock data
      const submission = {
        _id: new ObjectId('507f1f77bcf86cd799439011'),
        candidate_id: '507f1f77bcf86cd799439012',
        answers: [],
      };

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findOne.mockRejectedValue(new Error('Database error'));

      // Execute
      const result = await enrichSubmission(submission);

      // Verify
      // The implementation adds a candidate: null property even when an error occurs
      expect(result).toEqual({
        ...submission,
        candidate: null,
      });
    });
  });

  describe('enrichSubmissions', () => {
    test('should enrich multiple submissions', async () => {
      // Mock data
      const submissions = [
        {
          _id: new ObjectId('507f1f77bcf86cd799439011'),
          candidate_id: '507f1f77bcf86cd799439012',
          answers: [],
        },
        {
          _id: new ObjectId('507f1f77bcf86cd799439013'),
          candidate_id: '507f1f77bcf86cd799439014',
          answers: [],
        },
      ];

      const candidates = {
        '507f1f77bcf86cd799439012': {
          _id: new ObjectId('507f1f77bcf86cd799439012'),
          full_name: 'John Doe',
        },
        '507f1f77bcf86cd799439014': {
          _id: new ObjectId('507f1f77bcf86cd799439014'),
          full_name: 'Jane Smith',
        },
      };

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);

      // Mock findOne to return different candidates based on ID
      baseRepository.findOne.mockImplementation((collection, query) => {
        const id = query._id.toString();
        return Promise.resolve(candidates[id]);
      });

      baseRepository.findMany.mockResolvedValue([]);

      // Execute
      const result = await enrichSubmissions(submissions);

      // Verify
      const expected = [
        {
          _id: submissions[0]._id,
          candidate_id: submissions[0].candidate_id,
          candidate: candidates[submissions[0].candidate_id],
          answers: [],
        },
        {
          _id: submissions[1]._id,
          candidate_id: submissions[1].candidate_id,
          candidate: candidates[submissions[1].candidate_id],
          answers: [],
        },
      ];

      expect(result).toEqual(expected);
    });

    test('should return empty array for empty submissions array', async () => {
      // Execute
      const result = await enrichSubmissions([]);

      // Verify
      expect(result).toEqual([]);
    });

    test('should filter out null results', async () => {
      // Mock data
      const submissions = [
        {
          _id: new ObjectId('507f1f77bcf86cd799439011'),
          candidate_id: '507f1f77bcf86cd799439012',
          answers: [],
        },
        null, // This should be filtered out
      ];

      const candidate = {
        _id: new ObjectId('507f1f77bcf86cd799439012'),
        full_name: 'John Doe',
      };

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findOne.mockResolvedValue(candidate);
      baseRepository.findMany.mockResolvedValue([]);

      // Execute
      const result = await enrichSubmissions(submissions);

      // Verify
      expect(result).toEqual([
        {
          _id: submissions[0]._id,
          candidate_id: submissions[0].candidate_id,
          candidate,
          answers: [],
        },
      ]);
    });

    test('should return original submissions when error occurs', async () => {
      // Mock data
      const submissions = [
        {
          _id: new ObjectId('507f1f77bcf86cd799439011'),
          candidate_id: '507f1f77bcf86cd799439012',
          answers: [],
        },
      ];

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findOne.mockRejectedValue(new Error('Database error'));

      // Execute
      const result = await enrichSubmissions(submissions);

      // Verify
      // The implementation adds a candidate: null property to each submission even when an error occurs
      expect(result).toEqual(
        submissions.map(submission => ({
          ...submission,
          candidate: null,
        }))
      );
    });
  });
});
