const mongoose = require("mongoose");

const aiPredictionSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  predictedRisk: {
    type: String,
    enum: ["Low", "Medium", "High"],
    required: true,
  },

  confidence: {
    type: Number,
    min: 0,
    max: 1,
    required: true,
  },

  modelVersion: {
    type: String,
    required: true,
  },

  generatedAt: {
    type: Date,
    default: Date.now,
  },

}, { timestamps: true });

module.exports = mongoose.model("AIPrediction", aiPredictionSchema);