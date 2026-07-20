const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  title: String,

  description: String,

  priority: {
    type: String,
    enum: ["low","medium","high"]
  },

  status: {
    type: String,
    enum: [
      "pending",
      "in-progress",
      "completed",
      "dismissed"
    ]
  }

}, { timestamps: true });

module.exports = mongoose.model("Recommendation", recommendationSchema);