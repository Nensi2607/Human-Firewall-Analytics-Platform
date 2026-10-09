const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  body: { type: [String], required: true },
  keyTakeaways: { type: [String], required: true },
  realWorldExample: String,
  redFlags: [String],
}, { _id: false });

const knowledgeCheckQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true, select: false },
}, { _id: false });

const knowledgeCheckSchema = new mongoose.Schema({
  questions: { type: [knowledgeCheckQuestionSchema], default: [] },
}, { _id: false });

const trainingSchema = new mongoose.Schema({

  title: String,

  description: String,

  category: String,

  difficulty: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Beginner",
  },

  estimatedMinutes: {
    type: Number,
    min: 1,
  },

  lessons: {
    type: [lessonSchema],
    default: [],
  },

  knowledgeCheck: {
    type: knowledgeCheckSchema,
    default: () => ({ questions: [] }),
  },

  type: {
    type: String,
    enum: ["video","pdf","article","other"]
  },

  resourceURL: String,

  duration: Number,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("Training", trainingSchema);