const mongoose = require("mongoose");

const trainingSchema = new mongoose.Schema({

  title: String,

  description: String,

  category: String,

  type: {
    type: String,
    enum: ["video","pdf","article","other"]
  },

  resourceURL: String,

  duration: Number,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("Training", trainingSchema);