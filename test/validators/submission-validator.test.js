/**
 * Submission Validator Tests
 */

const { ObjectId } = require('mongodb');
const {
  validateSubmissionInput,
  formatSubmissionDefaults,
  sanitizeUpdateData,
  isValidObjectId,
  isValidAnswerValue,
  isValidIsSkip,
  isValidPoint,
} = require('../../src/utils/submissionValidator');

// Mock ObjectId.isValid
jest.mock('mongodb', () => {
  const originalModule = jest.requireActual('mongodb');
  return {
    ...originalModule,
    ObjectId: {
      ...originalModule.ObjectId,
      isValid: jest.fn(),
    },
  };
});

describe('Submission Validator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isValidObjectId', () => {
    test('should call ObjectId.isValid', () => {
      ObjectId.isValid.mockReturnValue(true);
      const result = isValidObjectId('507f1f77bcf86cd799439011');
      expect(ObjectId.isValid).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toBe(true);
    });
  });

  describe('isValidAnswerValue', () => {
    test('should return true for null', () => {
      expect(isValidAnswerValue(null)).toBe(true);
    });

    test('should return true for integers between 0 and 3', () => {
      expect(isValidAnswerValue(0)).toBe(true);
      expect(isValidAnswerValue(1)).toBe(true);
      expect(isValidAnswerValue(2)).toBe(true);
      expect(isValidAnswerValue(3)).toBe(true);
    });

    test('should return false for values outside the range', () => {
      expect(isValidAnswerValue(-1)).toBe(false);
      expect(isValidAnswerValue(4)).toBe(false);
    });

    test('should return false for non-integer values', () => {
      expect(isValidAnswerValue(1.5)).toBe(false);
      expect(isValidAnswerValue('1')).toBe(false);
      expect(isValidAnswerValue({})).toBe(false);
    });
  });

  describe('isValidIsSkip', () => {
    test('should return true for 0 and 1', () => {
      expect(isValidIsSkip(0)).toBe(true);
      expect(isValidIsSkip(1)).toBe(true);
    });

    test('should return false for other values', () => {
      expect(isValidIsSkip(2)).toBe(false);
      expect(isValidIsSkip(-1)).toBe(false);
      expect(isValidIsSkip('0')).toBe(false);
      expect(isValidIsSkip(null)).toBe(false);
    });
  });

  describe('isValidPoint', () => {
    test('should return true for valid point values', () => {
      expect(isValidPoint(0)).toBe(true);
      expect(isValidPoint(5)).toBe(true);
      expect(isValidPoint(10.5)).toBe(true);
      expect(isValidPoint(undefined)).toBe(true);
    });

    test('should return false for invalid point values', () => {
      expect(isValidPoint(-1)).toBe(false);
      expect(isValidPoint('5')).toBe(false);
      expect(isValidPoint(null)).toBe(false);
      expect(isValidPoint({})).toBe(false);
    });
  });

  describe('validateSubmissionInput', () => {
    beforeEach(() => {
      ObjectId.isValid.mockImplementation(id => {
        return typeof id === 'string' && id.length === 24;
      });
    });

    test('should validate a valid submission with point fields', () => {
      const validSubmission = {
        candidate_id: '507f1f77bcf86cd799439011',
        answers: [
          {
            question_id: '507f1f77bcf86cd799439012',
            answer: 2,
            other: 'Some explanation',
            point: 5,
            is_skip: 0,
          },
        ],
        instruments: [
          {
            instrument_id: '507f1f77bcf86cd799439013',
            answer: 3,
            other: 'Instrument explanation',
            point: 7.5,
            is_skip: 0,
          },
        ],
        essay: {
          question: 'Essay question',
          answer: 'Essay answer',
          is_skip: 0,
        },
      };

      const result = validateSubmissionInput(validSubmission);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate a submission with minimal required fields', () => {
      const minimalSubmission = {
        candidate_id: '507f1f77bcf86cd799439011',
        answers: [
          {
            question_id: '507f1f77bcf86cd799439012',
          },
        ],
      };

      const result = validateSubmissionInput(minimalSubmission);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject a submission without candidate_id', () => {
      const invalidSubmission = {
        answers: [
          {
            question_id: '507f1f77bcf86cd799439012',
            answer: 2,
          },
        ],
      };

      const result = validateSubmissionInput(invalidSubmission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required field: candidate_id');
    });

    test('should reject a submission with invalid candidate_id', () => {
      ObjectId.isValid.mockReturnValue(false);

      const invalidSubmission = {
        candidate_id: 'invalid-id',
        answers: [
          {
            question_id: '507f1f77bcf86cd799439012',
            answer: 2,
          },
        ],
      };

      const result = validateSubmissionInput(invalidSubmission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid candidate_id format');
    });

    test('should reject a submission with invalid answers format', () => {
      const invalidSubmission = {
        candidate_id: '507f1f77bcf86cd799439011',
        answers: 'not-an-array',
      };

      const result = validateSubmissionInput(invalidSubmission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Field answers must be an array');
    });

    test('should reject a submission with answer missing question_id', () => {
      const invalidSubmission = {
        candidate_id: '507f1f77bcf86cd799439011',
        answers: [
          {
            answer: 2,
          },
        ],
      };

      const result = validateSubmissionInput(invalidSubmission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required field: question_id in answers[0]');
    });

    test('should reject a submission with invalid question_id', () => {
      ObjectId.isValid
        .mockReturnValueOnce(true) // For candidate_id
        .mockReturnValueOnce(false); // For question_id

      const invalidSubmission = {
        candidate_id: '507f1f77bcf86cd799439011',
        answers: [
          {
            question_id: 'invalid-id',
            answer: 2,
          },
        ],
      };

      const result = validateSubmissionInput(invalidSubmission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid question_id format in answers[0]');
    });

    test('should reject a submission with invalid answer value', () => {
      const invalidSubmission = {
        candidate_id: '507f1f77bcf86cd799439011',
        answers: [
          {
            question_id: '507f1f77bcf86cd799439012',
            answer: 5,
          },
        ],
      };

      const result = validateSubmissionInput(invalidSubmission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Invalid answer value in answers[0]. Must be an integer between 0 and 3 or null'
      );
    });

    test('should reject a submission with invalid is_skip value', () => {
      const invalidSubmission = {
        candidate_id: '507f1f77bcf86cd799439011',
        answers: [
          {
            question_id: '507f1f77bcf86cd799439012',
            answer: 2,
            is_skip: 2,
          },
        ],
      };

      const result = validateSubmissionInput(invalidSubmission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid is_skip value in answers[0]. Must be 0 or 1');
    });

    test('should reject a submission with invalid point value in answers', () => {
      const invalidSubmission = {
        candidate_id: '507f1f77bcf86cd799439011',
        answers: [
          {
            question_id: '507f1f77bcf86cd799439012',
            answer: 2,
            point: -5,
          },
        ],
      };

      const result = validateSubmissionInput(invalidSubmission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Invalid point value in answers[0]. Must be a number greater than or equal to 0'
      );
    });

    test('should reject a submission with invalid point value in instruments', () => {
      const invalidSubmission = {
        candidate_id: '507f1f77bcf86cd799439011',
        instruments: [
          {
            instrument_id: '507f1f77bcf86cd799439013',
            answer: 3,
            point: 'invalid',
          },
        ],
      };

      const result = validateSubmissionInput(invalidSubmission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Invalid point value in instruments[0]. Must be a number greater than or equal to 0'
      );
    });

    test('should reject a submission with invalid essay format', () => {
      const invalidSubmission = {
        candidate_id: '507f1f77bcf86cd799439011',
        answers: [
          {
            question_id: '507f1f77bcf86cd799439012',
            answer: 2,
          },
        ],
        essay: 'not-an-object',
      };

      const result = validateSubmissionInput(invalidSubmission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Field essay must be an object');
    });

    test('should reject a submission with invalid essay.is_skip value', () => {
      const invalidSubmission = {
        candidate_id: '507f1f77bcf86cd799439011',
        answers: [
          {
            question_id: '507f1f77bcf86cd799439012',
            answer: 2,
          },
        ],
        essay: {
          question: 'Essay question',
          answer: 'Essay answer',
          is_skip: 2,
        },
      };

      const result = validateSubmissionInput(invalidSubmission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid is_skip value in essay. Must be 0 or 1');
    });
  });

  describe('formatSubmissionDefaults', () => {
    test('should apply default values for missing fields', () => {
      const submissionData = {
        candidate_id: '507f1f77bcf86cd799439011',
      };

      const formatted = formatSubmissionDefaults(submissionData);
      expect(formatted).toHaveProperty('answers', []);
      expect(formatted).toHaveProperty('essay');
      expect(formatted).toHaveProperty('review');
      expect(formatted.review).toHaveProperty('status', 'submitted');
    });

    test('should apply default values for missing essay fields', () => {
      const submissionData = {
        candidate_id: '507f1f77bcf86cd799439011',
        essay: {
          question: 'Essay question',
        },
      };

      const formatted = formatSubmissionDefaults(submissionData);
      expect(formatted.essay).toHaveProperty('question', 'Essay question');
      expect(formatted.essay).toHaveProperty('answer', null);
      expect(formatted.essay).toHaveProperty('is_skip', 0);
    });

    test('should apply default values for missing review fields', () => {
      const submissionData = {
        candidate_id: '507f1f77bcf86cd799439011',
        review: {
          comment: 'Good submission',
        },
      };

      const formatted = formatSubmissionDefaults(submissionData);
      expect(formatted.review).toHaveProperty('comment', 'Good submission');
      expect(formatted.review).toHaveProperty('status', 'submitted');
    });

    test('should apply default values to answers', () => {
      const submissionData = {
        candidate_id: '507f1f77bcf86cd799439011',
        answers: [
          {
            question_id: '507f1f77bcf86cd799439012',
            answer: 2,
          },
        ],
      };

      const formatted = formatSubmissionDefaults(submissionData);
      expect(formatted.answers[0]).toHaveProperty('is_skip', 0);
      expect(formatted.answers[0]).toHaveProperty('other', '');
      expect(formatted.answers[0]).toHaveProperty('point', 0);
    });

    test('should apply default values to instruments', () => {
      const submissionData = {
        candidate_id: '507f1f77bcf86cd799439011',
        instruments: [
          {
            instrument_id: '507f1f77bcf86cd799439013',
            answer: 3,
          },
        ],
      };

      const formatted = formatSubmissionDefaults(submissionData);
      expect(formatted.instruments[0]).toHaveProperty('is_skip', 0);
      expect(formatted.instruments[0]).toHaveProperty('other', '');
      expect(formatted.instruments[0]).toHaveProperty('point', 0);
    });

    test('should preserve existing values', () => {
      const submissionData = {
        candidate_id: '507f1f77bcf86cd799439011',
        answers: [
          {
            question_id: '507f1f77bcf86cd799439012',
            answer: 2,
            other: 'Some explanation',
            point: 8,
            is_skip: 1,
          },
        ],
        instruments: [
          {
            instrument_id: '507f1f77bcf86cd799439013',
            answer: 3,
            other: 'Instrument explanation',
            point: 6.5,
            is_skip: 0,
          },
        ],
        essay: {
          question: 'Essay question',
          answer: 'Essay answer',
          is_skip: 1,
        },
        review: {
          comment: 'Good submission',
          status: 'reviewed',
        },
      };

      const formatted = formatSubmissionDefaults(submissionData);
      expect(formatted).toEqual(submissionData);
    });
  });

  describe('sanitizeUpdateData', () => {
    test('should return the same data', () => {
      const updateData = {
        answers: [
          {
            question_id: '507f1f77bcf86cd799439012',
            answer: 3,
          },
        ],
      };

      const sanitized = sanitizeUpdateData(updateData);
      expect(sanitized).toEqual(updateData);
    });
  });
});
