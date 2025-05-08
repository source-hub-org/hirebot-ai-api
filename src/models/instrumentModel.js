/**
 * Instrument Model
 * @module models/instrumentModel
 */

const mongoose = require('mongoose');

/**
 * Schema for instrument documents
 * @type {mongoose.Schema}
 */
const instrumentSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: [true, 'Question ID is required'],
      trim: true,
      unique: true,
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Question type is required'],
      enum: {
        values: ['scale', 'multiple-choice', 'open-ended', 'boolean'],
        message: 'Type must be one of: scale, multiple-choice, open-ended, boolean',
      },
      trim: true,
    },
    options: {
      type: [String],
      validate: {
        validator: function (options) {
          // Options are required for scale and multiple-choice types
          if (['scale', 'multiple-choice'].includes(this.type)) {
            return (
              options && options.length > 0 && options.every(option => option.trim().length > 0)
            );
          }
          return true;
        },
        message: 'Options are required for scale and multiple-choice question types',
      },
    },
    tags: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'InstrumentTag',
      validate: {
        validator: function (tags) {
          return tags && tags.length > 0;
        },
        message: 'At least one tag is required',
      },
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
    collection: 'instruments', // Set the collection name explicitly
  }
);

/**
 * Instrument model
 * @type {mongoose.Model}
 */
const Instrument = mongoose.model('Instrument', instrumentSchema);

module.exports = Instrument;
