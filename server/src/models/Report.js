const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({

  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  reportType: {
    type: String,
    enum: [
      "risk",
      "training",
      "phishing",
      "user",
      "department",
      "overall"
    ]
  },

  filters: Object,

  generatedDate: Date,

  fileURL: String

}, { timestamps: true });

module.exports = mongoose.model("Report", reportSchema);