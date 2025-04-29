/**
 * Language Model
 * @module models/languageModel
 */

const mongoose = require('mongoose');

/**
 * Schema for language documents
 * @type {mongoose.Schema}
 */
const languageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Language name is required'],
      trim: true,
      unique: true,
    },
    designed_by: {
      type: String,
      required: [true, 'Designer information is required'],
      trim: true,
    },
    first_appeared: {
      type: Number,
      required: [true, 'First appearance year is required'],
      min: [1940, 'Year must be at least 1940'],
    },
    paradigm: {
      type: [String],
      required: [true, 'At least one paradigm is required'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one paradigm must be specified',
      },
    },
    usage: {
      type: String,
      required: [true, 'Usage information is required'],
      trim: true,
    },
    popularity_rank: {
      type: Number,
      required: [true, 'Popularity rank is required'],
      min: [1, 'Rank must be at least 1'],
    },
    type_system: {
      type: String,
      required: [true, 'Type system information is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Pre-save middleware to generate slug from name if not provided
 */
languageSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  }
  next();
});

/**
 * Language model
 * @type {mongoose.Model}
 */
const Language = mongoose.model('Language', languageSchema);

module.exports = Language;
