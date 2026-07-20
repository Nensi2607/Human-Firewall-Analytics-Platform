const mongoose = require("mongoose");

const riskAssessmentSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  quizScore: Number,

  phishingScore: Number,

  trainingScore: Number,

  passwordScore: Number,

  finalRiskScore: Number,

  riskLevel: {
    type: String,
    enum: ["Low","Medium","High"]
  },

  assessedAt: Date

}, { timestamps: true });

module.exports = mongoose.model("RiskAssessment", riskAssessmentSchema);