const mongoose = require("mongoose");

const phishingCampaignSchema = new mongoose.Schema({

  title: String,

  emailSubject: String,

  emailTemplate: String,

  targetDepartments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  }],

  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  targetAll: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    enum: [
      "draft",
      "scheduled",
      "running",
      "completed",
      "cancelled"
    ]
  },

  launchDate: Date,

  launchedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("PhishingCampaign", phishingCampaignSchema);