/**
 * Job Model
 * @module models/jobModel
 */

const mongoose = require('mongoose');

/**
 * Job Schema
 * @type {mongoose.Schema}
 */
const jobSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    payload: {
      type: Object,
      required: true,
    },
    status: {
      type: String,
      enum: ['new', 'pending', 'processing', 'done', 'failed'],
      default: 'new',
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  }
);

/**
 * Job Model
 * @type {mongoose.Model}
 */
const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
