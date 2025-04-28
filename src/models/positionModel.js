/**
 * Position Model
 * @module models/positionModel
 */

const mongoose = require('mongoose');

/**
 * Schema for position documents
 * @type {mongoose.Schema}
 */
const positionSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'Position slug is required'],
      trim: true,
      unique: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: [true, 'Position title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Position description is required'],
      trim: true,
    },
    instruction: {
      type: String,
      required: [true, 'Position instruction is required'],
      trim: true,
    },
    level: {
      type: Number,
      required: [true, 'Position level is required'],
      min: [1, 'Level must be at least 1'],
    },
    is_active: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Position model
 * @type {mongoose.Model}
 */
const Position = mongoose.model('Position', positionSchema);

module.exports = Position;