/**
 * @fileoverview Prompt builder for quiz question generation.
 * This module handles constructing prompts for the Gemini AI.
 */

/**
 * Default prompt template to use if environment variable is not set
 */
const DEFAULT_PROMPT_TEMPLATE = `
Generate 10 unique multiple-choice technical interview questions for software developers on {topic}.
{language}{positionInstruction}The questions should demonstrate {difficultyText}.`;

/**
 * Constructs a prompt for Gemini AI to generate quiz questions
 *
 * @param {Object} questionFormat - The question format configuration
 * @param {string[]} existingQuestions - Array of existing questions to avoid duplicates
 * @param {Object} [options] - Additional options for customizing the prompt
 * @param {string} [options.topic] - The topic for which questions should be generated
 * @param {string} [options.language] - The programming language for the questions
 * @param {string} [options.position] - The position level (intern, junior, senior, etc.)
 * @param {string} [options.difficultyText] - Description of the difficulty level
 * @param {string} [options.positionInstruction] - Instruction related to the position
 * @returns {string} The constructed prompt
 */
function constructPrompt(questionFormat, existingQuestions, options = {}) {
  // Get topic instruction
  const topicInstruction = options.topic
    ? `the topic of "${options.topic}"`
    : 'various software development topics';

  // Get language instruction
  const languageInstruction = options.language
    ? `Focus on the "${options.language}" programming language. `
    : '';

  // Get difficulty text and position instruction
  const difficultyText = options.difficultyText || 'various difficulty levels';
  const positionInstruction = options.positionInstruction ? `${options.positionInstruction}. ` : '';

  // Format existing questions as bullet points
  const formattedExistingQuestions = existingQuestions.map(q => `- ${q}`).join('\n');

  // Get the prompt template from environment variable or use default
  const promptTemplate = process.env.AI_QUIZ_PROMPT_TEMPLATE || DEFAULT_PROMPT_TEMPLATE;

  // Replace placeholders in the template
  const prompt = promptTemplate
    .replace('{topic}', topicInstruction)
    .replace('{language}', languageInstruction)
    .replace('{difficultyText}', difficultyText)
    .replace('{positionInstruction}', positionInstruction)
    .replace('{schema}', JSON.stringify(questionFormat.schema))
    .replace('{existingQuestions}', formattedExistingQuestions)
    .replace('{example}', JSON.stringify(questionFormat.example, null, 2));

  return prompt;
}

module.exports = {
  constructPrompt,
  DEFAULT_PROMPT_TEMPLATE,
};
