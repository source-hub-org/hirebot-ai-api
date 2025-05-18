/**
 * Candidate Schema
 * @module models/candidateSchema
 */

const mongoose = require('mongoose');
const candidateModel = require('./candidateModel');

// Create a schema based on the existing candidate model definition
const candidateSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      default: candidateModel.defaultValues.full_name,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone_number: {
      type: String,
      default: candidateModel.defaultValues.phone_number,
    },
    gender: {
      type: String,
      default: candidateModel.defaultValues.gender,
    },
    birthday: {
      type: String,
      default: candidateModel.defaultValues.birthday,
    },
    location: {
      type: String,
      default: candidateModel.defaultValues.location,
    },
    education_level: {
      type: String,
      default: candidateModel.defaultValues.education_level,
    },
    major: {
      type: String,
      default: candidateModel.defaultValues.major,
    },
    years_of_experience: {
      type: Number,
      default: candidateModel.defaultValues.years_of_experience,
    },
    current_position: {
      type: String,
      default: candidateModel.defaultValues.current_position,
    },
    skills: {
      type: [String],
      default: candidateModel.defaultValues.skills,
    },
    programming_languages: {
      type: [String],
      default: candidateModel.defaultValues.programming_languages,
    },
    preferred_stack: {
      type: String,
      default: candidateModel.defaultValues.preferred_stack,
    },
    interview_level: {
      type: String,
      default: candidateModel.defaultValues.interview_level,
    },
    assigned_topics: {
      type: [String],
      default: candidateModel.defaultValues.assigned_topics,
    },
    interview_score: {
      type: Number,
      default: candidateModel.defaultValues.interview_score,
    },
    interview_feedback: {
      type: String,
      default: candidateModel.defaultValues.interview_feedback,
    },
    interview_date: {
      type: String,
      default: candidateModel.defaultValues.interview_date,
    },
    interviewer_name: {
      type: String,
      default: candidateModel.defaultValues.interviewer_name,
    },
    cv_url: {
      type: String,
      default: candidateModel.defaultValues.cv_url,
    },
    portfolio_url: {
      type: String,
      default: candidateModel.defaultValues.portfolio_url,
    },
    linkedin_url: {
      type: String,
      default: candidateModel.defaultValues.linkedin_url,
    },
    status: {
      type: String,
      default: candidateModel.defaultValues.status,
    },
  },
  {
    timestamps: true,
    collection: candidateModel.collectionName, // Use the same collection name
  }
);

// Create the Mongoose model
const Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = Candidate;
