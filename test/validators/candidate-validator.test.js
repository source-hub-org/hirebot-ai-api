/**
 * Candidate Validator Tests
 */

const {
  validateCandidateInput,
  formatCandidateDefaults,
  sanitizeUpdateData,
  isValidEmail,
  isValidPhoneNumber,
} = require('../../src/utils/candidateValidator');

// Mock the logger to prevent console output during tests
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
}));

describe('Candidate Validator', () => {
  describe('isValidEmail', () => {
    test('should return true for valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'a@b.c',
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    test('should return false for invalid email addresses', () => {
      const invalidEmails = [
        'plaintext',
        '@example.com',
        'user@',
        'user@domain',
        'user@.com',
        'user name@example.com',
        '',
        null,
        undefined,
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });

  describe('isValidPhoneNumber', () => {
    test('should return true for valid phone numbers', () => {
      const validPhoneNumbers = [
        '+1234567890',
        '1234567890',
        '+123456789012345',
        '123456789012345',
      ];

      validPhoneNumbers.forEach(phone => {
        expect(isValidPhoneNumber(phone)).toBe(true);
      });
    });

    test('should return false for invalid phone numbers', () => {
      const invalidPhoneNumbers = [
        '+123',
        '123',
        '+abcdefghij',
        'abcdefghij',
        '+123 456 7890',
        '123-456-7890',
        '',
        null,
        undefined,
      ];

      invalidPhoneNumbers.forEach(phone => {
        expect(isValidPhoneNumber(phone)).toBe(false);
      });
    });
  });

  describe('validateCandidateInput', () => {
    test('should validate a valid candidate', () => {
      const validCandidate = {
        full_name: 'Test Candidate',
        email: 'test@example.com',
        phone_number: '+1234567890',
        interview_level: 'junior',
        skills: ['JavaScript', 'React'],
      };

      const result = validateCandidateInput(validCandidate);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject a candidate with missing required fields', () => {
      const invalidCandidate = {
        full_name: 'Test Candidate',
        // Missing email, phone_number, and interview_level
      };

      const result = validateCandidateInput(invalidCandidate);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Missing required field: email');
      expect(result.errors).not.toContain('Missing required field: phone_number');
      expect(result.errors).not.toContain('Missing required field: interview_level');
    });

    test('should reject a candidate with invalid email', () => {
      const invalidCandidate = {
        full_name: 'Test Candidate',
        email: 'invalid-email',
        phone_number: '+1234567890',
        interview_level: 'junior',
      };

      const result = validateCandidateInput(invalidCandidate);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    test('should reject a candidate with invalid phone number', () => {
      const invalidCandidate = {
        full_name: 'Test Candidate',
        email: 'test@example.com',
        phone_number: '123', // Too short
        interview_level: 'junior',
      };

      const result = validateCandidateInput(invalidCandidate);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid phone number format');
    });

    test('should reject a candidate with non-array fields', () => {
      const invalidCandidate = {
        full_name: 'Test Candidate',
        email: 'test@example.com',
        phone_number: '+1234567890',
        interview_level: 'junior',
        skills: 'JavaScript, React', // Should be an array
        programming_languages: 'JavaScript', // Should be an array
      };

      const result = validateCandidateInput(invalidCandidate);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Field skills must be an array');
      expect(result.errors).toContain('Field programming_languages must be an array');
    });

    test('should validate a candidate with all array fields as arrays', () => {
      const validCandidate = {
        full_name: 'Test Candidate',
        email: 'test@example.com',
        phone_number: '+1234567890',
        interview_level: 'junior',
        skills: ['JavaScript', 'React'],
        programming_languages: ['JavaScript'],
        assigned_topics: ['Variables', 'Functions'],
      };

      const result = validateCandidateInput(validCandidate);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('formatCandidateDefaults', () => {
    test('should apply default values to missing fields', () => {
      const minimalCandidate = {
        full_name: 'Test Candidate',
        email: 'test@example.com',
        phone_number: '+1234567890',
        interview_level: 'junior',
      };

      const formatted = formatCandidateDefaults(minimalCandidate);

      // Check that default values are applied
      expect(formatted.status).toBe('');
      expect(formatted.gender).toBe('');
      expect(formatted.location).toBe('');
      expect(Array.isArray(formatted.skills)).toBe(true);
      expect(formatted.skills).toHaveLength(0);
      expect(Array.isArray(formatted.programming_languages)).toBe(true);
      expect(formatted.programming_languages).toHaveLength(0);
      expect(formatted.years_of_experience).toBe(0);

      // Check that timestamps are added
      expect(formatted).toHaveProperty('createdAt');
      expect(formatted).toHaveProperty('updatedAt');
    });

    test('should not override provided values with defaults', () => {
      const fullCandidate = {
        full_name: 'Test Candidate',
        email: 'test@example.com',
        phone_number: '+1234567890',
        interview_level: 'junior',
        status: 'interviewed',
        gender: 'male',
        location: 'New York',
        skills: ['JavaScript', 'React'],
        programming_languages: ['JavaScript'],
        years_of_experience: 5,
        createdAt: '2023-01-01T00:00:00.000Z',
      };

      const formatted = formatCandidateDefaults(fullCandidate);

      // Check that provided values are not overridden
      expect(formatted.status).toBe('interviewed');
      expect(formatted.gender).toBe('male');
      expect(formatted.location).toBe('New York');
      expect(formatted.skills).toEqual(['JavaScript', 'React']);
      expect(formatted.programming_languages).toEqual(['JavaScript']);
      expect(formatted.years_of_experience).toBe(5);
      expect(formatted.createdAt).toBe('2023-01-01T00:00:00.000Z');

      // Check that updatedAt is always set
      expect(formatted).toHaveProperty('updatedAt');
    });

    test('should set timestamps if not provided', () => {
      const candidate = {
        full_name: 'Test Candidate',
        email: 'test@example.com',
        phone_number: '+1234567890',
        interview_level: 'junior',
      };

      const before = new Date().getTime();
      const formatted = formatCandidateDefaults(candidate);
      const after = new Date().getTime();

      // Check that timestamps are added and are recent
      const createdTime = new Date(formatted.createdAt).getTime();
      const updatedTime = new Date(formatted.updatedAt).getTime();

      expect(createdTime).toBeGreaterThanOrEqual(before);
      expect(createdTime).toBeLessThanOrEqual(after);
      expect(updatedTime).toBeGreaterThanOrEqual(before);
      expect(updatedTime).toBeLessThanOrEqual(after);
    });
  });

  describe('sanitizeUpdateData', () => {
    test('should remove createdAt from update data', () => {
      const updateData = {
        full_name: 'Updated Name',
        email: 'updated@example.com',
        createdAt: '2023-01-01T00:00:00.000Z',
      };

      const sanitized = sanitizeUpdateData(updateData);

      expect(sanitized).not.toHaveProperty('createdAt');
    });

    test('should add updatedAt to update data', () => {
      const updateData = {
        full_name: 'Updated Name',
        email: 'updated@example.com',
      };

      const before = new Date().getTime();
      const sanitized = sanitizeUpdateData(updateData);
      const after = new Date().getTime();

      expect(sanitized).toHaveProperty('updatedAt');

      const updatedTime = new Date(sanitized.updatedAt).getTime();
      expect(updatedTime).toBeGreaterThanOrEqual(before);
      expect(updatedTime).toBeLessThanOrEqual(after);
    });

    test('should override existing updatedAt in update data', () => {
      const updateData = {
        full_name: 'Updated Name',
        email: 'updated@example.com',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      const sanitized = sanitizeUpdateData(updateData);

      expect(sanitized.updatedAt).not.toBe('2023-01-01T00:00:00.000Z');
    });

    test('should not modify other fields', () => {
      const updateData = {
        full_name: 'Updated Name',
        email: 'updated@example.com',
        phone_number: '+9876543210',
        skills: ['JavaScript', 'React', 'Node.js'],
      };

      const sanitized = sanitizeUpdateData(updateData);

      expect(sanitized.full_name).toBe('Updated Name');
      expect(sanitized.email).toBe('updated@example.com');
      expect(sanitized.phone_number).toBe('+9876543210');
      expect(sanitized.skills).toEqual(['JavaScript', 'React', 'Node.js']);
    });
  });
});
