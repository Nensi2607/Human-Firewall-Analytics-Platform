const mongoose = require("mongoose");

const phishingAttemptSchema = new mongoose.Schema({

  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PhishingCampaign",
    required: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  sentAt: {
    type: Date,
    required: true,
    default: Date.now,
  },

  expiresAt: {
    type: Date,
    default: null,
  },

  clicked: {
    type: Boolean,
    default: false,
  },

  clickedAt: {
    type: Date,
    default: null,
  },

  emailOpened: Boolean,

  emailOpenedAt: Date,

  linkClicked: {
    type: Boolean,
    default: false,
  },

  linkClickedAt: {
    type: Date,
    default: null,
  },

  credentialsEntered: Boolean,

  credentialsEnteredAt: Date,

  reported: Boolean,

  reportedAt: Date

}, { timestamps: true });

phishingAttemptSchema.index({ campaignId: 1, employeeId: 1 }, { unique: true });

module.exports = mongoose.model("PhishingAttempt", phishingAttemptSchema);