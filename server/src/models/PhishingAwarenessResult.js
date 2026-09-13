const mongoose = require("mongoose");

const phishingAwarenessResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    totalScenarios: {
      type: Number,
      required: true,
      min: 1,
    },
    correctAnswers: {
      type: Number,
      required: true,
      min: 0,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "PhishingAwarenessResult",
  phishingAwarenessResultSchema
);
