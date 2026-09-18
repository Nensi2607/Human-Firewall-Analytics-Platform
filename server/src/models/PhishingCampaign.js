const mongoose = require("mongoose");

const phishingCampaignSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true,
    trim: true,
  },

  emailSubject: {
    type: String,
    required: true,
    trim: true,
  },

  emailTemplate: {
    type: String,
    required: true,
  },

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
    ],
    default: "draft",
  },

  launchDate: Date,

  launchedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("PhishingCampaign", phishingCampaignSchema);