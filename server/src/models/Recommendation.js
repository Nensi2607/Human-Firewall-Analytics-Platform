const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  recommendationKey: {
    type: String,
    trim: true,
  },

  audience: {
    type: String,
    enum: ["employee", "admin"],
  },

  recommendationType: String,

  entityType: String,

  entityId: mongoose.Schema.Types.ObjectId,

  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },

  departmentName: String,

  riskScoreSnapshot: Number,

  title: String,

  description: String,

  reason: String,

  suggestedAction: String,

  actionLabel: String,

  actionUrl: String,

  dueDate: Date,

  resolvedAt: Date,

  unresolvedSince: Date,

  priority: {
    type: String,
    enum: ["low", "medium", "high", "overdue", "due-soon", "remaining", "positive"]
  },

  status: {
    type: String,
    enum: [
      "pending",
      "in-progress",
      "completed",
      "dismissed",
      "resolved"
    ],
    default: "pending",
  }

}, { timestamps: true });

recommendationSchema.index(
  { recommendationKey: 1 },
  { unique: true, partialFilterExpression: { recommendationKey: { $type: "string" } } }
);
recommendationSchema.index({ audience: 1, userId: 1, status: 1 });

module.exports = mongoose.model("Recommendation", recommendationSchema);