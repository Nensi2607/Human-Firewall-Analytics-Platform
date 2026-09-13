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

  totalQuestions: {
    type: Number,
    required: true,
  },

  correctAnswers: {
    type: Number,
    required: true,
  },

  percentage: Number,

  timeTaken: Number,

  submittedAt: {
    type: Date,
    default: Date.now,
  },

  completedAt: {
    type: Date,
    default: Date.now,
  }

});

module.exports = mongoose.model("QuizResult", quizResultSchema);