/**
 * @fileoverview Tests for the promptBuilder module
 */

const { constructPrompt } = require('../../src/services/gemini/quiz/promptBuilder');

describe('promptBuilder', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
    delete process.env.AI_QUIZ_PROMPT_TEMPLATE;
  });

  afterEach(() => {
    // Restore process.env after each test
    process.env = originalEnv;
  });

  describe('constructPrompt', () => {
    const mockQuestionFormat = {
      schema: { type: 'array', items: { type: 'object' } },
      example: { question: 'Example question?' },
    };

    const mockExistingQuestions = ['What is JavaScript?', 'Explain closures in JavaScript.'];

    it('should construct a prompt with all options provided', () => {
      const options = {
        topic: 'React',
        language: 'JavaScript',
        difficultyText: 'intermediate to advanced knowledge',
        positionInstruction: 'Target senior frontend developers',
      };

      // Override the default template to include all placeholders for testing
      process.env.AI_QUIZ_PROMPT_TEMPLATE = `
      Generate questions for {topic}.
      {language}{positionInstruction}The questions should demonstrate {difficultyText}.
      Avoid these questions:
      {existingQuestions}
      Use this schema: {schema}
      Example: {example}
      `;

      const result = constructPrompt(mockQuestionFormat, mockExistingQuestions, options);

      expect(result).toContain('React');
      expect(result).toContain('JavaScript');
      expect(result).toContain('- What is JavaScript?');
      expect(result).toContain('- Explain closures in JavaScript.');
      expect(result).toContain(JSON.stringify(mockQuestionFormat.schema));
      expect(result).toContain(JSON.stringify(mockQuestionFormat.example, null, 2));
    });

    it('should use default values when options are not provided', () => {
      const result = constructPrompt(mockQuestionFormat, mockExistingQuestions, {});

      expect(result).toContain('various software development topics');
      expect(result).not.toContain('Focus on the');
      expect(result).toContain('various difficulty levels');
      expect(result).not.toContain('Target');
    });

    it('should use custom prompt template from environment variable', () => {
      process.env.AI_QUIZ_PROMPT_TEMPLATE = 'Custom template for {topic} with {language}';

      const options = {
        topic: 'React',
        language: 'JavaScript',
      };

      const result = constructPrompt(mockQuestionFormat, mockExistingQuestions, options);

      // The template only has {topic} and {language} placeholders
      const expected = 'Custom template for React with JavaScript';
      expect(result).toBe(expected);
    });

    it('should handle missing topic option', () => {
      const options = {
        language: 'JavaScript',
        difficultyText: 'intermediate knowledge',
        positionInstruction: 'Target junior developers',
      };

      const result = constructPrompt(mockQuestionFormat, mockExistingQuestions, options);

      expect(result).toContain('various software development topics');
      expect(result).toContain('JavaScript');
      expect(result).toContain('intermediate knowledge');
      expect(result).toContain('Target junior developers.');
    });

    it('should handle missing language option', () => {
      const options = {
        topic: 'React',
        difficultyText: 'intermediate knowledge',
        positionInstruction: 'Target junior developers',
      };

      const result = constructPrompt(mockQuestionFormat, mockExistingQuestions, options);

      expect(result).toContain('intermediate knowledge');
      expect(result).toContain('Target junior developers.');
    });

    it('should handle missing difficultyText option', () => {
      const options = {
        topic: 'React',
        language: 'JavaScript',
        positionInstruction: 'Target junior developers',
      };

      const result = constructPrompt(mockQuestionFormat, mockExistingQuestions, options);

      expect(result).toContain('React');
      expect(result).toContain('JavaScript');
      expect(result).toContain('various difficulty levels');
      expect(result).toContain('Target junior developers.');
    });

    it('should handle missing positionInstruction option', () => {
      const options = {
        topic: 'React',
        language: 'JavaScript',
        difficultyText: 'intermediate knowledge',
      };

      const result = constructPrompt(mockQuestionFormat, mockExistingQuestions, options);

      expect(result).toContain('React');
      expect(result).toContain('JavaScript');
      expect(result).toContain('intermediate knowledge');
      expect(result).not.toContain('Target');
    });

    it('should handle empty existing questions array', () => {
      const options = {
        topic: 'React',
        language: 'JavaScript',
      };

      const result = constructPrompt(mockQuestionFormat, [], options);

      expect(result).not.toContain('- What is JavaScript?');
      expect(result).not.toContain('- Explain closures in JavaScript.');
    });
  });
});
