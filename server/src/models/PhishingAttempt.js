const mongoose = require("mongoose");

const phishingAttemptSchema = new mongoose.Schema({

  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PhishingCampaign"
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  emailOpened: Boolean,

  emailOpenedAt: Date,

  linkClicked: Boolean,

  linkClickedAt: Date,

  credentialsEntered: Boolean,

  credentialsEnteredAt: Date,

  reported: Boolean,

  reportedAt: Date

}, { timestamps: true });

module.exports = mongoose.model("PhishingAttempt", phishingAttemptSchema);