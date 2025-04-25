/**
 * @fileoverview Content extractors for quiz question generation.
 * This module handles extracting content from various formats.
 */

const logger = require('../../../utils/logger');

/**
 * Extracts content from a code block with a specific language
 *
 * @param {string} content - The content to extract from
 * @param {string} language - The language identifier
 * @returns {string|null} The extracted content or null if not found
 */
function extractCodeBlockWithLanguage(content, language) {
  const regex = new RegExp(`\`\`\`(?:${language})\\s*([\\s\\S]*?)\\s*\`\`\``, 'i');
  const match = content.match(regex);

  if (match && match[1]) {
    logger.info(`Successfully extracted content from ${language} code block`);
    return match[1].trim();
  }

  return null;
}

/**
 * Extracts content from any code block
 *
 * @param {string} content - The content to extract from
 * @returns {string|null} The extracted content or null if not found
 */
function extractAnyCodeBlock(content) {
  const match = content.match(/```\s*([\s\S]*?)\s*```/);

  if (match && match[1]) {
    logger.info('Successfully extracted content from generic code block');
    return match[1].trim();
  }

  return null;
}

/**
 * Extracts content using the split method
 *
 * @param {string} content - The content to extract from
 * @returns {string|null} The extracted content or null if not found
 */
function extractUsingSplitMethod(content) {
  const parts = content.split('```');

  if (parts.length >= 3) {
    // If we have at least 3 parts, the middle part is our content
    let extractedContent = parts[1].trim();

    // Remove potential language identifier from the first line
    const lines = extractedContent.split('\n');
    if (
      lines[0] &&
      (lines[0].trim() === 'json' || lines[0].trim() === 'javascript' || lines[0].trim() === 'js')
    ) {
      lines.shift();
    }

    extractedContent = lines.join('\n').trim();
    logger.info('Extracted content using split method');
    return extractedContent;
  }

  return null;
}

/**
 * Extracts JSON content from code blocks in the response
 *
 * @param {string} contentToProcess - The content to extract JSON from
 * @returns {string} The extracted content
 */
function extractJsonFromCodeBlocks(contentToProcess) {
  if (!contentToProcess.includes('```')) {
    return contentToProcess;
  }

  logger.info('Detected code block in response, attempting to extract JSON content');

  // Try to match JSON code block with language specifier
  let extractedContent =
    extractCodeBlockWithLanguage(contentToProcess, 'json') ||
    extractCodeBlockWithLanguage(contentToProcess, 'javascript') ||
    extractCodeBlockWithLanguage(contentToProcess, 'js');

  // If that fails, try to match any code block
  if (!extractedContent) {
    extractedContent = extractAnyCodeBlock(contentToProcess);
  }

  // If that fails too, try the split method
  if (!extractedContent) {
    logger.warn(
      'Failed to extract content from code block using regex, trying alternative approach'
    );
    extractedContent = extractUsingSplitMethod(contentToProcess);
  }

  return extractedContent || contentToProcess;
}

/**
 * Extracts array content from a string
 *
 * @param {string} contentToProcess - The content to extract array from
 * @returns {string} The extracted array content
 */
function extractArrayContent(contentToProcess) {
  if (
    !contentToProcess.startsWith('[') &&
    contentToProcess.includes('[') &&
    contentToProcess.includes(']')
  ) {
    logger.info('Content does not start with [, attempting to extract array');
    const arrayStartIndex = contentToProcess.indexOf('[');
    const arrayEndIndex = contentToProcess.lastIndexOf(']') + 1;

    if (arrayStartIndex < arrayEndIndex) {
      contentToProcess = contentToProcess.substring(arrayStartIndex, arrayEndIndex);
      logger.info('Extracted array portion of content');
    }
  }

  return contentToProcess;
}

/**
 * Attempts to find valid JSON by bracket matching
 *
 * @param {string} originalContent - The original content to search in
 * @returns {string|null} The potential JSON string or null if not found
 */
function findJsonByBracketMatching(originalContent) {
  let bracketCount = 0;
  let inQuotes = false;
  let escapeNext = false;
  let startPos = -1;
  let endPos = -1;

  for (let i = 0; i < originalContent.length; i++) {
    const char = originalContent[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (char === '"' && !escapeNext) {
      inQuotes = !inQuotes;
      continue;
    }

    if (inQuotes) continue;

    if (char === '[' || char === '{') {
      if (bracketCount === 0) {
        startPos = i;
      }
      bracketCount++;
    } else if (char === ']' || char === '}') {
      bracketCount--;
      if (bracketCount === 0) {
        endPos = i + 1;
        break;
      }
    }
  }

  if (startPos !== -1 && endPos !== -1) {
    const potentialJson = originalContent.substring(startPos, endPos);
    logger.info('Found potential JSON by bracket matching:', potentialJson.substring(0, 100));
    return potentialJson;
  }

  return null;
}

module.exports = {
  extractJsonFromCodeBlocks,
  extractArrayContent,
  findJsonByBracketMatching,
  // Export these for testing
  extractCodeBlockWithLanguage,
  extractAnyCodeBlock,
  extractUsingSplitMethod,
};
