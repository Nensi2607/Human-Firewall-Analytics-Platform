const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["Admin", "Manager", "Employee"],
      default: "Employee",
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    designation: {
      type: String,
      default: "",
    },

    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },

    latestRiskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    trainingCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    lastLogin: {
      type: Date,
    },

    accountStatus: {
      type: String,
      enum: ["Active", "Inactive", "Blocked"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);