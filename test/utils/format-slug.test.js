/**
 * Tests for the Slug Formatting Utility
 */

const formatSlug = require('../../src/utils/formatSlug');

describe('Format Slug Utility', () => {
  it('should convert a simple string to a slug', () => {
    const result = formatSlug('Hello World');
    expect(result).toBe('hello-world');
  });

  it('should handle empty strings', () => {
    expect(formatSlug('')).toBe('');
    expect(formatSlug(null)).toBe('');
    expect(formatSlug(undefined)).toBe('');
  });

  it('should convert spaces to hyphens', () => {
    const result = formatSlug('This is a test string');
    expect(result).toBe('this-is-a-test-string');
  });

  it('should handle multiple consecutive spaces', () => {
    const result = formatSlug('This   has   multiple   spaces');
    expect(result).toBe('this-has-multiple-spaces');
  });

  it('should convert ampersands to "and"', () => {
    const result = formatSlug('This & That');
    expect(result).toBe('this-and-that');
  });

  it('should remove non-word characters', () => {
    const result = formatSlug('Special!@#$%^&*()_+{}[]|\\:;"\'<>,.?/characters');
    expect(result).toBe('special-and-_characters');
  });

  it('should replace multiple hyphens with a single hyphen', () => {
    const result = formatSlug('multiple---hyphens');
    expect(result).toBe('multiple-hyphens');
  });

  it('should trim hyphens from the start and end', () => {
    const result = formatSlug('-trim-hyphens-');
    expect(result).toBe('trim-hyphens');
  });

  it('should handle non-string inputs by converting to string', () => {
    expect(formatSlug(123)).toBe('123');
    expect(formatSlug(true)).toBe('true');
    expect(formatSlug({ toString: () => 'object' })).toBe('object');
  });

  it('should handle strings with mixed case', () => {
    const result = formatSlug('MiXeD CaSe StRiNg');
    expect(result).toBe('mixed-case-string');
  });

  it('should handle strings with leading and trailing spaces', () => {
    const result = formatSlug('  leading and trailing spaces  ');
    expect(result).toBe('leading-and-trailing-spaces');
  });

  it('should handle strings with special characters and spaces', () => {
    const result = formatSlug('React.js & Node.js: Web Development');
    expect(result).toBe('reactjs-and-nodejs-web-development');
  });
});
