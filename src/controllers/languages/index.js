/**
 * Languages Controllers Index
 * @module controllers/languages
 */

const { getAllLanguagesController } = require('./getAllLanguagesController');
const { getLanguageByIdController } = require('./getLanguageByIdController');
const { createLanguageController } = require('./createLanguageController');
const { updateLanguageController } = require('./updateLanguageController');
const { deleteLanguageController } = require('./deleteLanguageController');

module.exports = {
  getAllLanguagesController,
  getLanguageByIdController,
  createLanguageController,
  updateLanguageController,
  deleteLanguageController,
};
