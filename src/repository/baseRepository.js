/**
 * Base Repository Module for MongoDB Operations
 * @module repository/baseRepository
 */

const { MongoClient } = require('mongodb');
const logger = require('../utils/logger');

/**
 * MongoDB client instance
 * @type {MongoClient|null}
 */
let client = null;

/**
 * Database connection instance
 * @type {import('mongodb').Db|null}
 */
let db = null;

/**
 * Initialize MongoDB connection
 * @async
 * @param {string} uri - MongoDB connection URI
 * @param {string} dbName - Database name to connect to
 * @param {import('mongodb').MongoClientOptions} [options={}] - MongoDB connection options
 * @returns {Promise<{client: import('mongodb').MongoClient, db: import('mongodb').Db}>} MongoDB client and database instances
 * @throws {Error} If connection fails
 */
async function initializeDb(uri, dbName, options = {}) {
  try {
    if (!client) {
      client = new MongoClient(uri, options);
      await client.connect();
      logger.info('Connected to MongoDB');
    }

    db = client.db(dbName);
    return { client, db };
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Get the current MongoDB connection status
 * @returns {Object} Connection status information
 */
function getConnectionInfo() {
  return {
    isConnected: client ? client.topology?.isConnected() : false,
    serverAddress: client?.options?.hosts?.[0] || null,
    dbName: db?.databaseName || null,
  };
}

/**
 * Close the MongoDB connection
 * @async
 * @returns {Promise<void>}
 */
async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    logger.info('MongoDB connection closed');
  }
}

/**
 * Get a collection by name
 * @param {string} collectionName - Name of the collection
 * @returns {import('mongodb').Collection} MongoDB collection
 * @throws {Error} If database connection is not initialized
 */
function getCollection(collectionName) {
  if (!db) {
    throw new Error('Database connection not initialized');
  }
  return db.collection(collectionName);
}

/**
 * Insert a single document into a collection
 * @async
 * @param {string} collectionName - Name of the collection
 * @param {Object} document - Document to insert
 * @returns {Promise<import('mongodb').InsertOneResult>} Result of the insert operation
 */
async function insertOne(collectionName, document) {
  const collection = getCollection(collectionName);
  return await collection.insertOne(document);
}

/**
 * Insert multiple documents into a collection
 * @async
 * @param {string} collectionName - Name of the collection
 * @param {Array<Object>} documents - Array of documents to insert
 * @returns {Promise<import('mongodb').InsertManyResult>} Result of the insert operation
 */
async function insertMany(collectionName, documents) {
  const collection = getCollection(collectionName);
  return await collection.insertMany(documents);
}

/**
 * Find a single document in a collection
 * @async
 * @param {string} collectionName - Name of the collection
 * @param {Object} filter - Filter criteria
 * @param {Object} [options={}] - Additional options for the query
 * @returns {Promise<Object|null>} Found document or null if not found
 */
async function findOne(collectionName, filter, options = {}) {
  const collection = getCollection(collectionName);
  return await collection.findOne(filter, options);
}

/**
 * Find multiple documents in a collection
 * @async
 * @param {string} collectionName - Name of the collection
 * @param {Object} filter - Filter criteria
 * @param {Object} [options={}] - Additional options for the query
 * @returns {Promise<Array<Object>>} Array of found documents
 */
async function findMany(collectionName, filter, options = {}) {
  const collection = getCollection(collectionName);
  return await collection.find(filter, options).toArray();
}

/**
 * Update a single document in a collection
 * @async
 * @param {string} collectionName - Name of the collection
 * @param {Object} filter - Filter criteria to find the document
 * @param {Object} update - Update operations to perform
 * @param {Object} [options={}] - Additional options for the update operation
 * @returns {Promise<import('mongodb').UpdateResult>} Result of the update operation
 */
async function updateOne(collectionName, filter, update, options = {}) {
  const collection = getCollection(collectionName);
  return await collection.updateOne(filter, update, options);
}

/**
 * Update multiple documents in a collection
 * @async
 * @param {string} collectionName - Name of the collection
 * @param {Object} filter - Filter criteria to find documents
 * @param {Object} update - Update operations to perform
 * @param {Object} [options={}] - Additional options for the update operation
 * @returns {Promise<import('mongodb').UpdateResult>} Result of the update operation
 */
async function updateMany(collectionName, filter, update, options = {}) {
  const collection = getCollection(collectionName);
  return await collection.updateMany(filter, update, options);
}

/**
 * Delete a single document from a collection
 * @async
 * @param {string} collectionName - Name of the collection
 * @param {Object} filter - Filter criteria to find the document
 * @param {Object} [options={}] - Additional options for the delete operation
 * @returns {Promise<import('mongodb').DeleteResult>} Result of the delete operation
 */
async function deleteOne(collectionName, filter, options = {}) {
  const collection = getCollection(collectionName);
  return await collection.deleteOne(filter, options);
}

/**
 * Delete multiple documents from a collection
 * @async
 * @param {string} collectionName - Name of the collection
 * @param {Object} filter - Filter criteria to find documents
 * @param {Object} [options={}] - Additional options for the delete operation
 * @returns {Promise<import('mongodb').DeleteResult>} Result of the delete operation
 */
async function deleteMany(collectionName, filter, options = {}) {
  const collection = getCollection(collectionName);
  return await collection.deleteMany(filter, options);
}

module.exports = {
  initializeDb,
  getConnectionInfo,
  closeConnection,
  getCollection,
  insertOne,
  insertMany,
  findOne,
  findMany,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany,
};
