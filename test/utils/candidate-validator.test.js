/**
 * Tests for the Candidate Validator utility
 */

const {
  validateCandidateInput,
  formatCandidateDefaults,
  sanitizeUpdateData,
  isValidEmail,
  isValidPhoneNumber,
} = require('../../src/utils/candidateValidator');
const candidateModel = require('../../src/models/candidateModel');

// Mock the candidate model
jest.mock('../../src/models/candidateModel', () => ({
  requiredFields: ['email'],
  defaultValues: {
    full_name: '',
    phone_number: '',
    interview_level: '',
    gender: '',
    birthday: '',
    location: '',
    education_level: '',
    major: '',
    years_of_experience: 0,
    current_position: '',
    skills: [],
    programming_languages: [],
    preferred_stack: '',
    assigned_topics: [],
    interview_score: 0,
    interview_feedback: '',
    interview_date: '',
    interviewer_name: '',
    cv_url: '',
    portfolio_url: '',
    linkedin_url: '',
    status: '',
    createdAt: '',
    updatedAt: '',
  },
}));

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}));

describe('candidateValidator', () => {
  describe('isValidEmail', () => {
    test('should return true for valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
      expect(isValidEmail('123@456.789')).toBe(true);
    });

    test('should return false for invalid email addresses', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('test')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@example')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
      expect(isValidEmail('test@example.')).toBe(false);
      expect(isValidEmail('test@exam ple.com')).toBe(false);
      expect(isValidEmail('test@example.com ')).toBe(false);
      expect(isValidEmail(' test@example.com')).toBe(false);
    });
  });

  describe('isValidPhoneNumber', () => {
    test('should return true for valid phone numbers', () => {
      expect(isValidPhoneNumber('1234567890')).toBe(true);
      expect(isValidPhoneNumber('12345678901')).toBe(true);
      expect(isValidPhoneNumber('+1234567890')).toBe(true);
      expect(isValidPhoneNumber('+12345678901234')).toBe(true);
    });

    test('should return false for invalid phone numbers', () => {
      expect(isValidPhoneNumber('')).toBe(false);
      expect(isValidPhoneNumber('123')).toBe(false);
      expect(isValidPhoneNumber('123456789')).toBe(false);
      expect(isValidPhoneNumber('123456789012345678901')).toBe(false);
      expect(isValidPhoneNumber('abcdefghij')).toBe(false);
      expect(isValidPhoneNumber('123-456-7890')).toBe(false);
      expect(isValidPhoneNumber('(123) 456-7890')).toBe(false);
      expect(isValidPhoneNumber('123 456 7890')).toBe(false);
      expect(isValidPhoneNumber('123.456.7890')).toBe(false);
    });
  });

  describe('validateCandidateInput', () => {
    test('should return valid for a complete candidate object', () => {
      const candidate = {
        full_name: 'John Doe',
        email: 'john@example.com',
        phone_number: '1234567890',
        interview_level: 'junior',
        skills: ['JavaScript', 'React'],
        programming_languages: ['JavaScript', 'TypeScript'],
        assigned_topics: ['frontend', 'react'],
      };

      const result = validateCandidateInput(candidate);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate required fields', () => {
      const candidate = {
        // Missing required fields
      };

      const result = validateCandidateInput(candidate);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required field: email');
      expect(result.errors).not.toContain('Missing required field: full_name');
      expect(result.errors).not.toContain('Missing required field: phone_number');
      expect(result.errors).not.toContain('Missing required field: interview_level');
    });

    test('should validate email format', () => {
      const candidate = {
        full_name: 'John Doe',
        email: 'invalid-email',
        phone_number: '1234567890',
        interview_level: 'junior',
      };

      const result = validateCandidateInput(candidate);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    test('should validate phone number format', () => {
      const candidate = {
        full_name: 'John Doe',
        email: 'john@example.com',
        phone_number: '123', // Too short
        interview_level: 'junior',
      };

      const result = validateCandidateInput(candidate);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid phone number format');
    });

    test('should validate array fields', () => {
      const candidate = {
        full_name: 'John Doe',
        email: 'john@example.com',
        phone_number: '1234567890',
        interview_level: 'junior',
        skills: 'JavaScript, React', // Should be an array
        programming_languages: 123, // Should be an array
        assigned_topics: 'frontend', // Should be an array
      };

      const result = validateCandidateInput(candidate);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Field skills must be an array');
      expect(result.errors).toContain('Field programming_languages must be an array');
      expect(result.errors).toContain('Field assigned_topics must be an array');
    });

    test('should not validate array fields if they are not provided', () => {
      const candidate = {
        full_name: 'John Doe',
        email: 'john@example.com',
        phone_number: '1234567890',
        interview_level: 'junior',
        // No array fields provided
      };

      const result = validateCandidateInput(candidate);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate candidate with missing full_name', () => {
      const candidate = {
        email: 'john@example.com',
        phone_number: '1234567890',
        interview_level: 'junior',
      };

      const result = validateCandidateInput(candidate);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate candidate with missing phone_number', () => {
      const candidate = {
        full_name: 'John Doe',
        email: 'john@example.com',
        interview_level: 'junior',
      };

      const result = validateCandidateInput(candidate);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate candidate with missing interview_level', () => {
      const candidate = {
        full_name: 'John Doe',
        email: 'john@example.com',
        phone_number: '1234567890',
      };

      const result = validateCandidateInput(candidate);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate candidate with only email provided', () => {
      const candidate = {
        email: 'john@example.com',
      };

      const result = validateCandidateInput(candidate);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('formatCandidateDefaults', () => {
    test('should apply default values for missing fields', () => {
      const candidate = {
        full_name: 'John Doe',
        email: 'john@example.com',
        phone_number: '1234567890',
        interview_level: 'junior',
      };

      const formatted = formatCandidateDefaults(candidate);

      // Check that default values were applied for missing fields
      for (const [key, value] of Object.entries(candidateModel.defaultValues)) {
        if (
          key !== 'createdAt' &&
          key !== 'updatedAt' &&
          key !== 'full_name' &&
          key !== 'phone_number' &&
          key !== 'interview_level' &&
          !candidate[key]
        ) {
          expect(formatted[key]).toEqual(value);
        }
      }

      // Check that original values were preserved
      expect(formatted.full_name).toBe('John Doe');
      expect(formatted.email).toBe('john@example.com');
      expect(formatted.phone_number).toBe('1234567890');
      expect(formatted.interview_level).toBe('junior');

      // Check that timestamps were added
      expect(formatted.createdAt).toBeTruthy();
      expect(formatted.updatedAt).toBeTruthy();
    });

    test('should not override existing values', () => {
      const candidate = {
        full_name: 'John Doe',
        email: 'john@example.com',
        phone_number: '1234567890',
        interview_level: 'junior',
        gender: 'male',
        skills: ['JavaScript'],
        years_of_experience: 5,
      };

      const formatted = formatCandidateDefaults(candidate);

      // Check that existing values were preserved
      expect(formatted.gender).toBe('male');
      expect(formatted.skills).toEqual(['JavaScript']);
      expect(formatted.years_of_experience).toBe(5);

      // Check that default values were applied for missing fields
      expect(formatted.education_level).toBe('');
      expect(formatted.major).toBe('');
      expect(formatted.programming_languages).toEqual([]);
    });

    test('should preserve existing timestamps if provided', () => {
      const createdAt = '2023-01-01T00:00:00.000Z';
      const candidate = {
        full_name: 'John Doe',
        email: 'john@example.com',
        phone_number: '1234567890',
        interview_level: 'junior',
        createdAt,
      };

      const formatted = formatCandidateDefaults(candidate);

      // Check that createdAt was preserved
      expect(formatted.createdAt).toBe(createdAt);

      // Check that updatedAt was set
      expect(formatted.updatedAt).toBeTruthy();
    });
  });

  describe('sanitizeUpdateData', () => {
    test('should remove createdAt field', () => {
      const updateData = {
        full_name: 'John Doe',
        email: 'john@example.com',
        createdAt: '2023-01-01T00:00:00.000Z',
      };

      const sanitized = sanitizeUpdateData(updateData);

      expect(sanitized).not.toHaveProperty('createdAt');
    });

    test('should add updatedAt timestamp', () => {
      const updateData = {
        full_name: 'John Doe',
        email: 'john@example.com',
      };

      const sanitized = sanitizeUpdateData(updateData);

      expect(sanitized).toHaveProperty('updatedAt');
      expect(sanitized.updatedAt).toBeTruthy();
    });

    test('should override existing updatedAt timestamp', () => {
      const oldTimestamp = '2023-01-01T00:00:00.000Z';
      const updateData = {
        full_name: 'John Doe',
        email: 'john@example.com',
        updatedAt: oldTimestamp,
      };

      const sanitized = sanitizeUpdateData(updateData);

      expect(sanitized.updatedAt).not.toBe(oldTimestamp);
    });

    test('should preserve other fields', () => {
      const updateData = {
        full_name: 'John Doe',
        email: 'john@example.com',
        phone_number: '1234567890',
        skills: ['JavaScript', 'React'],
      };

      const sanitized = sanitizeUpdateData(updateData);

      expect(sanitized.full_name).toBe('John Doe');
      expect(sanitized.email).toBe('john@example.com');
      expect(sanitized.phone_number).toBe('1234567890');
      expect(sanitized.skills).toEqual(['JavaScript', 'React']);
    });
  });
});
