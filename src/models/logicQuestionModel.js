/**
 * Logic Question Model
 * @module models/logicQuestionModel
 */

const mongoose = require('mongoose');

/**
 * Schema for choice objects within logic questions
 * @type {mongoose.Schema}
 */
const choiceSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Choice text is required'],
      trim: true,
    },
    is_correct: {
      type: Boolean,
      required: [true, 'Correctness flag is required'],
    },
  },
  { _id: false }
);

/**
 * Schema for logic question documents
 * @type {mongoose.Schema}
 */
const logicQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    level: {
      type: Number,
      required: [true, 'Difficulty level is required'],
      min: 1,
      max: 6,
      validate: {
        validator: Number.isInteger,
        message: 'Level must be an integer',
      },
    },
    tag_ids: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'LogicTag',
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'At least one tag is required',
      },
    },
    type: {
      type: String,
      required: [true, 'Question type is required'],
      enum: ['multiple_choice', 'open_question'],
    },
    choices: {
      type: [choiceSchema],
      validate: {
        validator: function (v) {
          // Choices are required only for multiple_choice type
          if (this.type === 'multiple_choice') {
            return v && v.length > 0 && v.some(choice => choice.is_correct);
          }
          return true;
        },
        message:
          'Multiple choice questions must have at least one choice with at least one correct answer',
      },
    },
    answer_explanation: {
      type: String,
      required: [true, 'Answer explanation is required'],
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
    collection: 'logic_questions', // Set the collection name explicitly
  }
);

// Create indexes for faster lookups
logicQuestionSchema.index({ level: 1 });
logicQuestionSchema.index({ tag_ids: 1 });
logicQuestionSchema.index({ type: 1 });

/**
 * Logic Question model
 * @type {mongoose.Model}
 */
const LogicQuestion = mongoose.model('LogicQuestion', logicQuestionSchema);

module.exports = LogicQuestion;
