/**
 * Migration Script: Add logic_questions field to existing submissions
 *
 * This script adds the logic_questions field to all existing submissions in the database.
 * It sets the field to an empty array for each submission that doesn't already have it.
 *
 * Usage: node src/scripts/migrations/add-logic-questions-field.js
 */

const { MongoClient } = require('mongodb');
const logger = require('../../utils/logger');
require('dotenv').config();

// MongoDB connection URI
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hirebot';

// Database and collection names
const dbName = process.env.MONGODB_DB_NAME || 'hirebot';
const collectionName = 'submissions';

/**
 * Add logic_questions field to all submissions
 * @async
 */
async function addLogicQuestionsField() {
  const client = new MongoClient(uri, { useUnifiedTopology: true });

  try {
    // Connect to MongoDB
    await client.connect();
    logger.info('Connected to MongoDB');

    const db = client.db(dbName);
    const submissions = db.collection(collectionName);

    // Find all submissions that don't have the logic_questions field
    const submissionsToUpdate = await submissions
      .find({
        logic_questions: { $exists: false },
      })
      .toArray();

    logger.info(`Found ${submissionsToUpdate.length} submissions to update`);

    if (submissionsToUpdate.length === 0) {
      logger.info(
        'No submissions need to be updated. All submissions already have the logic_questions field.'
      );
      return { success: true, modifiedCount: 0 };
    }

    // Update all submissions to add the logic_questions field
    const result = await submissions.updateMany(
      { logic_questions: { $exists: false } },
      { $set: { logic_questions: [] } }
    );

    // Wait a moment for the updates to be applied
    await new Promise(resolve => setTimeout(resolve, 100));

    logger.info(`Updated ${result.modifiedCount} submissions with the logic_questions field`);

    // Verify the update
    const verifyCount = await submissions.countDocuments({
      logic_questions: { $exists: false },
    });

    if (verifyCount > 0) {
      logger.error(`Failed to update ${verifyCount} submissions`);
      return { success: false, modifiedCount: result.modifiedCount, failedCount: verifyCount };
    } else {
      logger.info('All submissions now have the logic_questions field');
      return { success: true, modifiedCount: result.modifiedCount };
    }
  } catch (error) {
    logger.error('Error updating submissions:', error);
    throw error;
  } finally {
    // Close the connection
    await client.close();
    logger.info('Disconnected from MongoDB');
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  addLogicQuestionsField()
    .then(() => {
      logger.info('Migration completed successfully');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addLogicQuestionsField };
