const mongoose = require("mongoose");

const aiPredictionSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  predictedRisk: Number,

  confidence: Number,

  modelVersion: String,

  generatedAt: Date

}, { timestamps: true });

module.exports = mongoose.model("AIPrediction", aiPredictionSchema);