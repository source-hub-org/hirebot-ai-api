/**
 * @fileoverview Tests for the contentValidator module
 */

const { validateGeneratedContent } = require('../src/service/gemini/quiz/contentValidator');

// Mock dependencies
jest.mock('@utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

jest.mock('../src/service/gemini/quiz/fileOperations', () => ({
  logContentToFile: jest.fn()
}));

jest.mock('../src/service/gemini/quiz/extractors', () => ({
  extractJsonFromCodeBlocks: jest.fn(),
  extractArrayContent: jest.fn()
}));

jest.mock('../src/service/gemini/quiz/parsers', () => ({
  parseJsonContent: jest.fn(),
  extractQuestionsArray: jest.fn()
}));

jest.mock('../src/service/gemini/quiz/validators', () => ({
  validateQuestions: jest.fn()
}));

describe('contentValidator', () => {
  const { 
    extractJsonFromCodeBlocks, 
    extractArrayContent 
  } = require('../src/service/gemini/quiz/extractors');
  
  const { 
    parseJsonContent, 
    extractQuestionsArray 
  } = require('../src/service/gemini/quiz/parsers');
  
  const { validateQuestions } = require('../src/service/gemini/quiz/validators');
  const { logContentToFile } = require('../src/service/gemini/quiz/fileOperations');
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('validateGeneratedContent', () => {
    it('should throw error when content is null', () => {
      expect(() => validateGeneratedContent(null)).toThrow('Content is empty or not a string');
    });
    
    it('should throw error when content is not a string', () => {
      expect(() => validateGeneratedContent(123)).toThrow('Content is empty or not a string');
    });
    
    it('should throw error when content is an empty string', () => {
      expect(() => validateGeneratedContent('')).toThrow('Content is empty or not a string');
    });
    
    it('should process valid content successfully', () => {
      const mockContent = 'Valid content with JSON';
      const mockExtractedJson = '{"questions": [{"question": "Test?"}]}';
      const mockParsedJson = { questions: [{ question: 'Test?' }] };
      const mockQuestionsArray = [{ question: 'Test?' }];
      const mockValidatedQuestions = [{ question: 'Test?', validated: true }];
      
      // Mock substring method on string
      String.prototype.substring = jest.fn().mockReturnValue(mockContent);
      
      extractJsonFromCodeBlocks.mockReturnValue(mockExtractedJson);
      extractArrayContent.mockReturnValue(mockExtractedJson);
      parseJsonContent.mockReturnValue(mockParsedJson);
      extractQuestionsArray.mockReturnValue(mockQuestionsArray);
      validateQuestions.mockReturnValue(mockValidatedQuestions);
      
      const result = validateGeneratedContent(mockContent);
      
      expect(logContentToFile).toHaveBeenCalledWith(mockContent);
      expect(extractJsonFromCodeBlocks).toHaveBeenCalledWith(mockContent.trim());
      expect(parseJsonContent).toHaveBeenCalledWith(mockExtractedJson, mockContent.trim());
      expect(extractQuestionsArray).toHaveBeenCalledWith(mockParsedJson, false);
      expect(validateQuestions).toHaveBeenCalledWith(mockQuestionsArray, false);
      expect(result).toEqual(mockValidatedQuestions);
      
      // Restore substring method
      String.prototype.substring.mockRestore();
    });
    
    it('should use strict mode when specified', () => {
      const mockContent = 'Valid content with JSON';
      const mockExtractedJson = '{"questions": [{"question": "Test?"}]}';
      const mockParsedJson = { questions: [{ question: 'Test?' }] };
      const mockQuestionsArray = [{ question: 'Test?' }];
      const mockValidatedQuestions = [{ question: 'Test?', validated: true }];
      
      // Mock substring method on string
      String.prototype.substring = jest.fn().mockReturnValue(mockContent);
      
      extractJsonFromCodeBlocks.mockReturnValue(mockExtractedJson);
      extractArrayContent.mockReturnValue(mockExtractedJson);
      parseJsonContent.mockReturnValue(mockParsedJson);
      extractQuestionsArray.mockReturnValue(mockQuestionsArray);
      validateQuestions.mockReturnValue(mockValidatedQuestions);
      
      const result = validateGeneratedContent(mockContent, true);
      
      expect(extractQuestionsArray).toHaveBeenCalledWith(mockParsedJson, true);
      expect(validateQuestions).toHaveBeenCalledWith(mockQuestionsArray, true);
      expect(result).toEqual(mockValidatedQuestions);
      
      // Restore substring method
      String.prototype.substring.mockRestore();
    });
    
    it('should try to extract array content when JSON extraction fails', () => {
      const mockContent = 'Content with array but no JSON';
      const mockArrayContent = '[{"question": "Test?"}]';
      const mockParsedJson = [{ question: 'Test?' }];
      const mockQuestionsArray = [{ question: 'Test?' }];
      const mockValidatedQuestions = [{ question: 'Test?', validated: true }];
      
      // Mock substring method on string
      String.prototype.substring = jest.fn().mockReturnValue(mockContent);
      
      extractJsonFromCodeBlocks.mockReturnValue(null);
      extractArrayContent.mockReturnValue(mockArrayContent);
      parseJsonContent.mockReturnValue(mockParsedJson);
      extractQuestionsArray.mockReturnValue(mockQuestionsArray);
      validateQuestions.mockReturnValue(mockValidatedQuestions);
      
      const result = validateGeneratedContent(mockContent);
      
      expect(extractArrayContent).toHaveBeenCalledWith(null);
      expect(parseJsonContent).toHaveBeenCalledWith(mockArrayContent, mockContent.trim());
      expect(result).toEqual(mockValidatedQuestions);
      
      // Restore substring method
      String.prototype.substring.mockRestore();
    });
    
    it('should throw error when all extraction methods fail', () => {
      const mockContent = 'Invalid content with no JSON or array';
      
      // Mock substring method on string
      String.prototype.substring = jest.fn().mockReturnValue(mockContent);
      
      extractJsonFromCodeBlocks.mockReturnValue(null);
      extractArrayContent.mockReturnValue(null);
      
      expect(() => validateGeneratedContent(mockContent)).toThrow('Invalid generated content');
      
      // Restore substring method
      String.prototype.substring.mockRestore();
    });
    
    it('should throw error when JSON parsing fails', () => {
      const mockContent = 'Content with invalid JSON';
      const mockExtractedJson = 'invalid json';
      
      // Mock substring method on string
      String.prototype.substring = jest.fn().mockReturnValue(mockContent);
      
      extractJsonFromCodeBlocks.mockReturnValue(mockExtractedJson);
      extractArrayContent.mockReturnValue(mockExtractedJson);
      parseJsonContent.mockImplementation(() => {
        throw new Error('JSON parse error');
      });
      
      expect(() => validateGeneratedContent(mockContent)).toThrow('Invalid generated content: JSON parse error');
      
      // Restore substring method
      String.prototype.substring.mockRestore();
    });
    
    it('should throw error when questions extraction fails', () => {
      const mockContent = 'Content with valid JSON but no questions';
      const mockExtractedJson = '{"notQuestions": true}';
      const mockParsedJson = { notQuestions: true };
      
      // Mock substring method on string
      String.prototype.substring = jest.fn().mockReturnValue(mockContent);
      
      extractJsonFromCodeBlocks.mockReturnValue(mockExtractedJson);
      extractArrayContent.mockReturnValue(mockExtractedJson);
      parseJsonContent.mockReturnValue(mockParsedJson);
      extractQuestionsArray.mockImplementation(() => {
        throw new Error('No questions found');
      });
      
      expect(() => validateGeneratedContent(mockContent)).toThrow('Invalid generated content: No questions found');
      
      // Restore substring method
      String.prototype.substring.mockRestore();
    });
    
    it('should throw error when validation fails', () => {
      const mockContent = 'Content with invalid questions';
      const mockExtractedJson = '{"questions": [{"invalid": true}]}';
      const mockParsedJson = { questions: [{ invalid: true }] };
      const mockQuestionsArray = [{ invalid: true }];
      
      // Mock substring method on string
      String.prototype.substring = jest.fn().mockReturnValue(mockContent);
      
      extractJsonFromCodeBlocks.mockReturnValue(mockExtractedJson);
      extractArrayContent.mockReturnValue(mockExtractedJson);
      parseJsonContent.mockReturnValue(mockParsedJson);
      extractQuestionsArray.mockReturnValue(mockQuestionsArray);
      validateQuestions.mockImplementation(() => {
        throw new Error('Validation error');
      });
      
      expect(() => validateGeneratedContent(mockContent)).toThrow('Invalid generated content: Validation error');
      
      // Restore substring method
      String.prototype.substring.mockRestore();
    });
  });
});