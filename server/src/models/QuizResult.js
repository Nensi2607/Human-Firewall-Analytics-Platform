const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz"
  },

  score: Number,

  percentage: Number,

  timeTaken: Number,

  submittedAt: Date

});

module.exports = mongoose.model("QuizResult", quizResultSchema);