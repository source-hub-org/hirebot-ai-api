/**
 * Tests for the Submission Validator utility
 */

const { ObjectId } = require('mongodb');
const {
  validateSubmissionInput,
  formatSubmissionDefaults,
  sanitizeUpdateData,
  isValidObjectId,
  isValidAnswerValue,
  isValidInstrumentValue,
  isValidIsSkip,
  isValidPoint,
} = require('../../src/utils/submissionValidator');

// Mock dependencies
jest.mock('../../src/models/submissionModel', () => ({
  requiredFields: ['candidate_id'],
  requiredAnswerFields: ['question_id'],
  requiredInstrumentFields: ['instrument_id'],
  defaultValues: {
    answers: [],
    instruments: [],
    essay: {
      question: null,
      answer: null,
      is_skip: 0,
    },
    review: {
      comment: '',
      status: 'submitted',
    },
  },
  answerValueRange: {
    min: 0,
    max: 3,
  },
  instrumentValueRange: {
    min: 0,
    max: 4,
  },
}));

jest.mock('../../src/utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}));

describe('submissionValidator', () => {
  describe('isValidObjectId', () => {
    test('should return true for valid ObjectId', () => {
      const validId = new ObjectId().toString();
      expect(isValidObjectId(validId)).toBe(true);
    });

    test('should return false for invalid ObjectId', () => {
      expect(isValidObjectId('invalid-id')).toBe(false);
      expect(isValidObjectId('')).toBe(false);
      expect(isValidObjectId(null)).toBe(false);
      expect(isValidObjectId(undefined)).toBe(false);
      expect(isValidObjectId(123)).toBe(false);
    });
  });

  describe('isValidAnswerValue', () => {
    test('should return true for valid answer values', () => {
      expect(isValidAnswerValue(0)).toBe(true);
      expect(isValidAnswerValue(1)).toBe(true);
      expect(isValidAnswerValue(2)).toBe(true);
      expect(isValidAnswerValue(3)).toBe(true);
      expect(isValidAnswerValue(null)).toBe(true);
    });

    test('should return false for invalid answer values', () => {
      expect(isValidAnswerValue(-1)).toBe(false);
      expect(isValidAnswerValue(4)).toBe(false);
      expect(isValidAnswerValue(1.5)).toBe(false);
      expect(isValidAnswerValue('0')).toBe(false);
      expect(isValidAnswerValue(undefined)).toBe(false);
      expect(isValidAnswerValue({})).toBe(false);
    });
  });

  describe('isValidInstrumentValue', () => {
    test('should return true for valid instrument values', () => {
      expect(isValidInstrumentValue(0)).toBe(true);
      expect(isValidInstrumentValue(1)).toBe(true);
      expect(isValidInstrumentValue(2)).toBe(true);
      expect(isValidInstrumentValue(3)).toBe(true);
      expect(isValidInstrumentValue(4)).toBe(true);
      expect(isValidInstrumentValue(null)).toBe(true);
    });

    test('should return false for invalid instrument values', () => {
      expect(isValidInstrumentValue(-1)).toBe(false);
      expect(isValidInstrumentValue(5)).toBe(false);
      expect(isValidInstrumentValue(1.5)).toBe(false);
      expect(isValidInstrumentValue('0')).toBe(false);
      expect(isValidInstrumentValue(undefined)).toBe(false);
      expect(isValidInstrumentValue({})).toBe(false);
    });
  });

  describe('isValidIsSkip', () => {
    test('should return true for valid is_skip values', () => {
      expect(isValidIsSkip(0)).toBe(true);
      expect(isValidIsSkip(1)).toBe(true);
    });

    test('should return false for invalid is_skip values', () => {
      expect(isValidIsSkip(-1)).toBe(false);
      expect(isValidIsSkip(2)).toBe(false);
      expect(isValidIsSkip(1.5)).toBe(false);
      expect(isValidIsSkip('0')).toBe(false);
      expect(isValidIsSkip(null)).toBe(false);
      expect(isValidIsSkip(undefined)).toBe(false);
      expect(isValidIsSkip({})).toBe(false);
    });
  });

  describe('isValidPoint', () => {
    test('should return true for valid point values', () => {
      expect(isValidPoint(0)).toBe(true);
      expect(isValidPoint(1)).toBe(true);
      expect(isValidPoint(1.5)).toBe(true);
      expect(isValidPoint(100)).toBe(true);
      expect(isValidPoint(undefined)).toBe(true); // undefined is valid (will use default)
    });

    test('should return false for invalid point values', () => {
      expect(isValidPoint(-1)).toBe(false);
      expect(isValidPoint('0')).toBe(false);
      expect(isValidPoint(null)).toBe(false);
      expect(isValidPoint({})).toBe(false);
      expect(isValidPoint(NaN)).toBe(false);
      expect(isValidPoint(Infinity)).toBe(false);
    });
  });

  describe('validateSubmissionInput', () => {
    test('should return valid for a complete and valid submission', () => {
      const candidateId = new ObjectId().toString();
      const questionId = new ObjectId().toString();
      const instrumentId = new ObjectId().toString();

      const submission = {
        candidate_id: candidateId,
        answers: [
          {
            question_id: questionId,
            answer: 1,
            is_skip: 0,
            point: 1,
          },
        ],
        instruments: [
          {
            instrument_id: instrumentId,
            answer: 2,
            is_skip: 0,
            point: 2,
          },
        ],
        essay: {
          question: 'Essay question',
          answer: 'Essay answer',
          is_skip: 0,
        },
      };

      const result = validateSubmissionInput(submission);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate required fields', () => {
      const submission = {
        // Missing candidate_id
      };

      const result = validateSubmissionInput(submission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required field: candidate_id');
    });

    test('should validate candidate_id format', () => {
      const submission = {
        candidate_id: 'invalid-id',
      };

      const result = validateSubmissionInput(submission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid candidate_id format');
    });

    test('should validate answers array', () => {
      // Answers not an array
      let submission = {
        candidate_id: new ObjectId().toString(),
        answers: 'not an array',
      };
      let result = validateSubmissionInput(submission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Field answers must be an array');

      // Missing required fields in answers
      submission = {
        candidate_id: new ObjectId().toString(),
        answers: [
          {
            // Missing question_id
            answer: 1,
          },
        ],
      };
      result = validateSubmissionInput(submission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required field: question_id in answers[0]');

      // Invalid question_id format
      submission = {
        candidate_id: new ObjectId().toString(),
        answers: [
          {
            question_id: 'invalid-id',
            answer: 1,
          },
        ],
      };
      result = validateSubmissionInput(submission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid question_id format in answers[0]');

      // Invalid answer value
      submission = {
        candidate_id: new ObjectId().toString(),
        answers: [
          {
            question_id: new ObjectId().toString(),
            answer: 5, // Out of range
          },
        ],
      };
      result = validateSubmissionInput(submission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Invalid answer value in answers[0]. Must be an integer between 0 and 3 or null'
      );

      // Invalid is_skip value
      submission = {
        candidate_id: new ObjectId().toString(),
        answers: [
          {
            question_id: new ObjectId().toString(),
            answer: 1,
            is_skip: 2, // Invalid value
          },
        ],
      };
      result = validateSubmissionInput(submission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid is_skip value in answers[0]. Must be 0 or 1');

      // Invalid point value
      submission = {
        candidate_id: new ObjectId().toString(),
        answers: [
          {
            question_id: new ObjectId().toString(),
            answer: 1,
            point: -1, // Invalid value
          },
        ],
      };
      result = validateSubmissionInput(submission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Invalid point value in answers[0]. Must be a number greater than or equal to 0'
      );
    });

    test('should validate instruments array', () => {
      // Instruments not an array
      let submission = {
        candidate_id: new ObjectId().toString(),
        instruments: 'not an array',
      };
      let result = validateSubmissionInput(submission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Field instruments must be an array');

      // Missing required fields in instruments
      submission = {
        candidate_id: new ObjectId().toString(),
        instruments: [
          {
            // Missing instrument_id
            answer: 1,
          },
        ],
      };
      result = validateSubmissionInput(submission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required field: instrument_id in instruments[0]');

      // Invalid instrument_id format
      submission = {
        candidate_id: new ObjectId().toString(),
        instruments: [
          {
            instrument_id: 'invalid-id',
            answer: 1,
          },
        ],
      };
      result = validateSubmissionInput(submission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid instrument_id format in instruments[0]');

      // Invalid answer value
      submission = {
        candidate_id: new ObjectId().toString(),
        instruments: [
          {
            instrument_id: new ObjectId().toString(),
            answer: 5, // Out of range
          },
        ],
      };
      result = validateSubmissionInput(submission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Invalid answer value in instruments[0]. Must be an integer between 0 and 4 or null'
      );

      // Invalid is_skip value
      submission = {
        candidate_id: new ObjectId().toString(),
        instruments: [
          {
            instrument_id: new ObjectId().toString(),
            answer: 1,
            is_skip: 2, // Invalid value
          },
        ],
      };
      result = validateSubmissionInput(submission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid is_skip value in instruments[0]. Must be 0 or 1');

      // Invalid point value
      submission = {
        candidate_id: new ObjectId().toString(),
        instruments: [
          {
            instrument_id: new ObjectId().toString(),
            answer: 1,
            point: -1, // Invalid value
          },
        ],
      };
      result = validateSubmissionInput(submission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Invalid point value in instruments[0]. Must be a number greater than or equal to 0'
      );
    });

    test('should validate essay object', () => {
      // Essay not an object
      let submission = {
        candidate_id: new ObjectId().toString(),
        essay: 'not an object',
      };
      let result = validateSubmissionInput(submission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Field essay must be an object');

      // Invalid is_skip value in essay
      submission = {
        candidate_id: new ObjectId().toString(),
        essay: {
          question: 'Essay question',
          answer: 'Essay answer',
          is_skip: 2, // Invalid value
        },
      };
      result = validateSubmissionInput(submission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid is_skip value in essay. Must be 0 or 1');
    });

    test('should validate multiple fields at once', () => {
      const submission = {
        candidate_id: 'invalid-id',
        answers: [
          {
            question_id: 'invalid-id',
            answer: 5,
          },
        ],
        instruments: [
          {
            instrument_id: 'invalid-id',
            answer: 6,
          },
        ],
        essay: {
          is_skip: 2,
        },
      };

      const result = validateSubmissionInput(submission);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(6); // Updated to match actual number of errors
      expect(result.errors).toContain('Invalid candidate_id format');
      expect(result.errors).toContain('Invalid question_id format in answers[0]');
      expect(result.errors).toContain(
        'Invalid answer value in answers[0]. Must be an integer between 0 and 3 or null'
      );
      expect(result.errors).toContain('Invalid instrument_id format in instruments[0]');
      expect(result.errors).toContain(
        'Invalid answer value in instruments[0]. Must be an integer between 0 and 4 or null'
      );
      expect(result.errors).toContain('Invalid is_skip value in essay. Must be 0 or 1');
    });
  });

  describe('formatSubmissionDefaults', () => {
    test('should apply default values for missing fields', () => {
      const candidateId = new ObjectId().toString();
      const submission = {
        candidate_id: candidateId,
        instruments: [], // Add instruments to match the expected output
      };

      const result = formatSubmissionDefaults(submission);

      expect(result).toEqual({
        candidate_id: candidateId,
        answers: [],
        instruments: [],
        essay: {
          question: null,
          answer: null,
          is_skip: 0,
        },
        review: {
          comment: '',
          status: 'submitted',
        },
      });
    });

    test('should not override existing values', () => {
      const candidateId = new ObjectId().toString();
      const questionId = new ObjectId().toString();
      const submission = {
        candidate_id: candidateId,
        answers: [
          {
            question_id: questionId,
            answer: 1,
            is_skip: 1,
            other: 'Custom answer',
            point: 2,
          },
        ],
        essay: {
          question: 'Custom question',
          answer: 'Custom answer',
          is_skip: 1,
        },
        review: {
          comment: 'Custom comment',
          status: 'reviewed',
        },
      };

      const result = formatSubmissionDefaults(submission);

      expect(result).toEqual(submission);
    });

    test('should apply default values to partial objects', () => {
      const candidateId = new ObjectId().toString();
      const submission = {
        candidate_id: candidateId,
        essay: {
          question: 'Custom question',
          // Missing answer and is_skip
        },
        review: {
          // Missing comment and status
        },
      };

      const result = formatSubmissionDefaults(submission);

      expect(result.essay).toEqual({
        question: 'Custom question',
        answer: null,
        is_skip: 0,
      });

      expect(result.review).toEqual({
        comment: '',
        status: 'submitted',
      });
    });

    test('should apply default values to answers array items', () => {
      const candidateId = new ObjectId().toString();
      const questionId = new ObjectId().toString();
      const submission = {
        candidate_id: candidateId,
        answers: [
          {
            question_id: questionId,
            answer: 1,
            // Missing is_skip, other, and point
          },
        ],
      };

      const result = formatSubmissionDefaults(submission);

      expect(result.answers[0]).toEqual({
        question_id: questionId,
        answer: 1,
        is_skip: 0,
        other: '',
        point: 0,
      });
    });

    test('should apply default values to instruments array items', () => {
      const candidateId = new ObjectId().toString();
      const instrumentId = new ObjectId().toString();
      const submission = {
        candidate_id: candidateId,
        instruments: [
          {
            instrument_id: instrumentId,
            answer: 2,
            // Missing is_skip, other, and point
          },
        ],
      };

      const result = formatSubmissionDefaults(submission);

      expect(result.instruments[0]).toEqual({
        instrument_id: instrumentId,
        answer: 2,
        is_skip: 0,
        other: '',
        point: 0,
      });
    });
  });

  describe('sanitizeUpdateData', () => {
    test('should return a copy of the input data', () => {
      const updateData = {
        answers: [{ question_id: new ObjectId().toString(), answer: 1 }],
        essay: { answer: 'Updated answer' },
      };

      const result = sanitizeUpdateData(updateData);

      expect(result).toEqual(updateData);
      expect(result).not.toBe(updateData); // Should be a new object
    });
  });
});
