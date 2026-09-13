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

  completedAt: Date

}, { timestamps: true });

trainingProgressSchema.index(
  { userId: 1, trainingId: 1 },
  { unique: true }
);

module.exports = mongoose.model("TrainingProgress", trainingProgressSchema);