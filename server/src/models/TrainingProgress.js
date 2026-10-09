const mongoose = require("mongoose");

const trainingProgressSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  trainingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Training"
  },

  progress: Number,

  completed: Boolean,

  completedAt: Date,

  openedLessons: {
    type: [Number],
    default: [],
  },

  completedLessons: {
    type: [Number],
    default: [],
  },

  knowledgeCheckAttempts: {
    type: Number,
    default: 0,
    min: 0,
  },

  knowledgeCheckScore: Number,

  knowledgeCheckPassed: {
    type: Boolean,
    default: false,
  },

  knowledgeCheckCompletedAt: Date,

  lastActivityAt: Date,

  legacyProgressValue: Number,

  legacyCompletedValue: Boolean,

  legacyCompletedAt: Date,

  legacyCapturedAt: Date,

}, { timestamps: true });

trainingProgressSchema.index(
  { userId: 1, trainingId: 1 },
  { unique: true }
);

module.exports = mongoose.model("TrainingProgress", trainingProgressSchema);