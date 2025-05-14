/**
 * Question Model
 * @module models/questionModel
 */

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

/**
 * Schema for question documents
 * @type {mongoose.Schema}
 */
const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    options: {
      type: [String],
      required: [true, 'Options are required'],
      validate: {
        validator: function (options) {
          return options.length === 4 && options.every(option => option.trim().length > 0);
        },
        message: 'Options must be an array of exactly 4 non-empty strings',
      },
    },
    correctAnswer: {
      type: Number,
      required: [true, 'Correct answer index is required'],
      min: [0, 'Correct answer index must be at least 0'],
      max: [3, 'Correct answer index must be at most 3'],
      validate: {
        validator: function (value) {
          return Number.isInteger(value);
        },
        message: 'Correct answer must be an integer',
      },
    },
    explanation: {
      type: String,
      required: [true, 'Explanation is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: 'Difficulty must be one of: easy, medium, hard',
      },
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
    },
    topic_id: {
      type: ObjectId,
      ref: 'Topic',
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      trim: true,
    },
    language_id: {
      type: ObjectId,
      ref: 'Language',
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
    },
    position_id: {
      type: ObjectId,
      ref: 'Position',
    },
    positionLevel: {
      type: Number,
      required: [true, 'Position level is required'],
      min: [1, 'Position level must be at least 1'],
      validate: {
        validator: function (value) {
          return Number.isInteger(value);
        },
        message: 'Position level must be an integer',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Question model
 * @type {mongoose.Model}
 */
const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
