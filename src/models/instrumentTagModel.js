/**
 * Instrument Tag Model
 * @module models/instrumentTagModel
 */

const mongoose = require('mongoose');

/**
 * Schema for instrument tag documents
 * @type {mongoose.Schema}
 */
const instrumentTagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Tag description is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: false,
      transform: (doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
    toObject: { virtuals: false },
    id: false, // Disable the virtual id getter
    collection: 'instrument_tags', // Set the collection name explicitly
  }
);

/**
 * Instrument Tag model
 * @type {mongoose.Model}
 */
const InstrumentTag = mongoose.model('InstrumentTag', instrumentTagSchema);

module.exports = InstrumentTag;
