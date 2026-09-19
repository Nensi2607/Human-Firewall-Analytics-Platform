const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

  category: String,

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "easy",
  },

  duration: Number,

  targetDepartments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  }],

  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],

  targetAll: {
    type: Boolean,
    default: false,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }

}, { timestamps: true });

module.exports = mongoose.model("Quiz", quizSchema);