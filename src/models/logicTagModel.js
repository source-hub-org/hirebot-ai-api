/**
 * Logic Tag Model
 * @module models/logicTagModel
 */

const mongoose = require('mongoose');

/**
 * Schema for logic tag documents
 * @type {mongoose.Schema}
 */
const logicTagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: [true, 'Tag slug is required'],
      trim: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
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
    collection: 'logic_tags', // Set the collection name explicitly
  }
);

/**
 * Logic Tag model
 * @type {mongoose.Model}
 */
const LogicTag = mongoose.model('LogicTag', logicTagSchema);

module.exports = LogicTag;
