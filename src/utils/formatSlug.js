/**
 * Slug Formatting Utility
 * @module utils/formatSlug
 */

/**
 * Formats a string into a URL-friendly slug
 * @param {string} text - The text to convert to a slug
 * @returns {string} The formatted slug
 */
function formatSlug(text) {
  if (!text) return '';

  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

module.exports = formatSlug;
