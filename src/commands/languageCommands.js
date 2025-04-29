/**
 * Language Commands Module
 * @module commands/languageCommands
 */

const fs = require('fs').promises;
const path = require('path');
const Language = require('../models/languageModel');
const { validateLanguagesData } = require('../utils/languageValidator');
const { fileExists } = require('../utils/fileParser');
const logger = require('../utils/logger');

/**
 * Read and parse a JSON file containing language data
 * @async
 * @param {string} filePath - Path to the JSON file
 * @returns {Promise<Array<Object>>} Array of language objects
 * @throws {Error} If file reading or parsing fails
 */
async function readLanguagesFile(filePath) {
  try {
    logger.info(`Reading languages file: ${filePath}`);
    const resolvedPath = path.resolve(process.cwd(), filePath);
    const fileContent = await fs.readFile(resolvedPath, 'utf8');
    const data = JSON.parse(fileContent);

    // Handle both array format and object with languages property
    if (Array.isArray(data)) {
      return data;
    } else if (data.languages && Array.isArray(data.languages)) {
      return data.languages;
    } else {
      throw new Error(
        'Invalid file format. Expected an array of languages or an object with a languages array property.'
      );
    }
  } catch (error) {
    logger.error(`Error reading languages file: ${error.message}`);
    throw error;
  }
}

/**
 * Check for duplicate languages in the database
 * @async
 * @param {Array<Object>} languages - Array of language objects
 * @returns {Promise<Object>} Object with unique and duplicate languages
 */
async function checkForDuplicates(languages) {
  const uniqueLanguages = [];
  const duplicates = [];

  for (const language of languages) {
    // Check if language with same name already exists
    const existingByName = await Language.findOne({ name: language.name });

    // Generate slug if not provided
    const slug = language.slug || language.name.toLowerCase().replace(/\s+/g, '-');

    // Check if language with same slug already exists
    const existingBySlug = await Language.findOne({ slug });

    if (existingByName || existingBySlug) {
      duplicates.push({
        language,
        reason: existingByName
          ? `Language with name '${language.name}' already exists`
          : `Language with slug '${slug}' already exists`,
      });
    } else {
      // Add slug if not provided
      if (!language.slug) {
        language.slug = slug;
      }
      uniqueLanguages.push(language);
    }
  }

  return { uniqueLanguages, duplicates };
}

/**
 * Insert languages into the database
 * @async
 * @param {Array<Object>} languages - Array of language objects
 * @returns {Promise<Object>} Result of the insertion operation
 */
async function insertLanguages(languages) {
  try {
    if (languages.length === 0) {
      return { insertedCount: 0 };
    }

    const result = await Language.insertMany(languages, { ordered: false });
    return { insertedCount: result.length };
  } catch (error) {
    logger.error(`Error inserting languages: ${error.message}`);
    throw error;
  }
}

/**
 * Initialize languages from a JSON file
 * @async
 * @param {Array<string>} args - Command arguments (first argument should be the file path)
 * @returns {Promise<void>}
 * @throws {Error} If file validation or database operations fail
 */
async function initLanguagesCommand(args) {
  if (!args || args.length === 0) {
    throw new Error('File path argument is required');
  }

  const filePath = args[0];
  logger.info(`Initializing languages from file: ${filePath}`);

  // Check if file exists
  const exists = await fileExists(filePath);
  if (!exists) {
    throw new Error(`File not found: ${filePath}`);
  }

  try {
    // Read and parse the languages file
    const languages = await readLanguagesFile(filePath);
    logger.info(`Found ${languages.length} languages in file`);

    // Validate languages data
    const validation = validateLanguagesData(languages);
    if (!validation.isValid) {
      logger.error('Invalid languages data:', validation.errors);
      throw new Error(`Invalid languages data: ${validation.errors.join(', ')}`);
    }

    // Check for duplicates
    const { uniqueLanguages, duplicates } = await checkForDuplicates(languages);

    // Insert unique languages
    const result = await insertLanguages(uniqueLanguages);

    // Log results
    logger.info(`Successfully inserted ${result.insertedCount} languages`);
    if (duplicates.length > 0) {
      logger.warn(`Skipped ${duplicates.length} duplicate languages`);
      duplicates.forEach(dup => {
        logger.warn(`- ${dup.language.name}: ${dup.reason}`);
      });
    }

    console.log(`Languages initialization completed.`);
    console.log(`- Total languages in file: ${languages.length}`);
    console.log(`- Successfully inserted: ${result.insertedCount}`);
    console.log(`- Skipped (duplicates): ${duplicates.length}`);

    return {
      inserted: result.insertedCount,
      skipped: duplicates.length,
      total: languages.length,
    };
  } catch (error) {
    logger.error(`Failed to initialize languages: ${error.message}`);
    throw error;
  }
}

module.exports = {
  initLanguagesCommand,
  readLanguagesFile,
  checkForDuplicates,
  insertLanguages,
};
