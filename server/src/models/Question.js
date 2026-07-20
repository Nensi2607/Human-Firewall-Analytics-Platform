const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({

  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true
  },

  question: {
    type: String,
    required: true
  },

  options: [{
    type: String
  }],

  correctAnswer: String,

  explanation: String

}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);