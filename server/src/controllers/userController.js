const mongoose = require("mongoose");
const User = require("../models/User");
const Department = require("../models/Department");
const QuizResult = require("../models/QuizResult");
const Training = require("../models/Training");
const TrainingProgress = require("../models/TrainingProgress");
const PhishingAttempt = require("../models/PhishingAttempt");
const PhishingAwarenessResult = require("../models/PhishingAwarenessResult");
const RiskAssessment = require("../models/RiskAssessment");
const AIPrediction = require("../models/AIPrediction");
const PhishingCampaign = require("../models/PhishingCampaign");
const Notification = require("../models/Notification");
const { buildEmployeeDetail } = require("../services/employeeDetailService");

// ==========================================
// Get Current Logged-in User Profile
// ==========================================
exports.getCurrentUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-passwordHash")
      .populate("departmentId", "departmentName");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// Get All Users
// ==========================================
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-passwordHash")
      .populate("departmentId", "departmentName");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// Get User By ID
// ==========================================
exports.getUser = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID.",
      });
    }

    const user = await User.findById(req.params.id)
      .select("-passwordHash")
      .populate("departmentId", "departmentName");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.getEmployeeDetail = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID.",
      });
    }

    const [employee, departments, quizResults, trainingProgress, trainings, quizzes, phishingAttempts, phishingAwareness, riskAssessment, prediction] = await Promise.all([
      User.findById(req.params.id)
        .select("-passwordHash")
        .populate("departmentId", "departmentName")
        .lean(),
      Department.find().select("_id departmentName").sort({ departmentName: 1 }).lean(),
      QuizResult.find({ userId: req.params.id })
        .select("quizId percentage correctAnswers totalQuestions submittedAt completedAt")
        .populate("quizId", "title")
        .sort({ completedAt: -1, submittedAt: -1 })
        .lean(),
      TrainingProgress.find({ userId: req.params.id })
        .select("trainingId progress completed completedAt")
        .populate("trainingId", "title")
        .lean(),
      Training.find().select("_id title").lean(),
      QuizResult.aggregate([
        {
          $match: { userId: new mongoose.Types.ObjectId(req.params.id) },
        },
        {
          $project: { _id: 1 },
        },
      ]),
      PhishingAttempt.find({ userId: req.params.id })
        .select("campaignId sentAt clicked clickedAt emailOpened emailOpenedAt reported reportedAt credentialsEntered")
        .populate("campaignId", "title")
        .sort({ sentAt: -1 })
        .lean(),
      PhishingAwarenessResult.findOne({ userId: req.params.id })
        .select("totalScenarios correctAnswers score completedAt")
        .lean(),
      RiskAssessment.findOne({ userId: req.params.id })
        .select("finalRiskScore riskLevel trainingScore quizScore phishingScore securityAwarenessScore assessedAt")
        .lean(),
      AIPrediction.findOne({ userId: req.params.id })
        .select("predictedRisk confidence modelVersion generatedAt")
        .sort({ generatedAt: -1 })
        .lean(),
    ]);

    if (!employee || employee.role !== "employee") {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const details = buildEmployeeDetail({
      employee,
      quizResults,
      trainingProgress,
      trainings,
      quizzes: quizzes.map((quiz) => ({ _id: quiz._id, title: quiz.title })),
      phishingAttempts,
      phishingAwareness,
      riskAssessment,
      prediction,
    });

    res.status(200).json({
      success: true,
      data: {
        ...details,
        departments,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// Update User
// ==========================================
exports.updateUser = async (req, res, next) => {
  try {
    const allowedFields = [
      "firstName",
      "lastName",
      "email",
      "departmentId",
      "designation",
      "status",
    ];
    const body = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(req.params.id) ||
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      Object.keys(body).length === 0 ||
      Object.keys(body).some((field) => !allowedFields.includes(field))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee update.",
      });
    }

    const input = {};
    for (const field of ["firstName", "lastName", "designation"]) {
      if (body[field] === undefined) continue;
      if (typeof body[field] !== "string") {
        return res.status(400).json({
          success: false,
          message: `Invalid ${field}.`,
        });
      }
      const value = body[field].trim();
      const maxLength = field === "designation" ? 120 : 80;
      if ((field !== "designation" && !value) || value.length > maxLength) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${field}.`,
        });
      }
      input[field] = value;
    }

    if (body.email !== undefined) {
      if (typeof body.email !== "string") {
        return res.status(400).json({ success: false, message: "Invalid email." });
      }
      const email = body.email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: "Invalid email." });
      }
      const existingEmail = await User.exists({
        email,
        _id: { $ne: req.params.id },
      });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "That email address is already in use.",
        });
      }
      input.email = email;
    }

    if (body.departmentId !== undefined) {
      if (body.departmentId === null || body.departmentId === "") {
        input.departmentId = null;
      } else if (
        !mongoose.Types.ObjectId.isValid(body.departmentId) ||
        !(await Department.exists({ _id: body.departmentId }))
      ) {
        return res.status(400).json({
          success: false,
          message: "Select a valid department.",
        });
      } else {
        input.departmentId = body.departmentId;
      }
    }

    if (body.status !== undefined) {
      if (!["active", "inactive"].includes(body.status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be active or inactive.",
        });
      }
      input.status = body.status;
    }

    if (Object.keys(input).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid employee fields were provided.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      input,
      {
        new: true,
        runValidators: true,
      }
    )
      .select("-passwordHash")
      .populate("departmentId", "departmentName");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// Delete User
// ==========================================
exports.deleteUser = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID.",
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.updateMyProfile = async (req, res, next) => {
  try {
    const allowedFields = ["firstName", "lastName", "designation", "profileImage"];
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).length === 0 ||
      Object.keys(body).some((field) => !allowedFields.includes(field))) {
      return res.status(400).json({ success: false, message: "Only first name, last name, designation, and profile image may be updated." });
    }

    const input = {};
    for (const field of ["firstName", "lastName", "designation"]) {
      if (body[field] === undefined) continue;
      if (typeof body[field] !== "string") {
        return res.status(400).json({ success: false, message: `Invalid ${field}.` });
      }
      const value = body[field].trim();
      const maxLength = field === "designation" ? 120 : 80;
      if ((field !== "designation" && !value) || value.length > maxLength) {
        return res.status(400).json({ success: false, message: `Invalid ${field}.` });
      }
      input[field] = value;
    }

    if (body.profileImage !== undefined) {
      if (typeof body.profileImage !== "string" || body.profileImage.trim().length > 2048) {
        return res.status(400).json({ success: false, message: "Profile image must be a valid HTTP(S) URL or empty." });
      }
      const profileImage = body.profileImage.trim();
      if (profileImage) {
        try {
          const imageUrl = new URL(profileImage);
          if (!["http:", "https:"].includes(imageUrl.protocol) || imageUrl.username || imageUrl.password) throw new Error("Invalid URL");
        } catch {
          return res.status(400).json({ success: false, message: "Profile image must be a valid HTTP(S) URL or empty." });
        }
      }
      input.profileImage = profileImage;
    }

    if (!Object.keys(input).length) {
      return res.status(400).json({ success: false, message: "No editable profile fields were provided." });
    }
    const user = await User.findByIdAndUpdate(req.user._id, input, { new: true, runValidators: true })
      .select("firstName lastName email role departmentId designation profileImage status createdAt")
      .populate("departmentId", "departmentName");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return next(error);
  }
};

exports.changeMyPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};
    if (Object.keys(req.body || {}).some((field) => !["currentPassword", "newPassword", "confirmPassword"].includes(field))) {
      return res.status(400).json({ success: false, message: "Only password fields are accepted." });
    }
    if (typeof currentPassword !== "string" || typeof newPassword !== "string" || typeof confirmPassword !== "string") {
      return res.status(400).json({ success: false, message: "Current, new, and confirmed passwords are required." });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "New password and confirmation do not match." });
    }
    if (newPassword.length < 12 || !/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      return res.status(400).json({ success: false, message: "New password must be at least 12 characters and include uppercase, lowercase, number, and symbol characters." });
    }

    const user = await User.findById(req.user._id).select("+passwordHash");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: "Current password is incorrect." });
    }
    if (await user.comparePassword(newPassword)) {
      return res.status(400).json({ success: false, message: "Choose a password different from your current password." });
    }

    user.passwordHash = newPassword;
    await user.save();
    return res.status(200).json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    return next(error);
  }
};

exports.getMyAdminSummary = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Administrator access is required." });
    }
    const [totalEmployees, activeCampaigns, unreadNotifications] = await Promise.all([
      User.countDocuments({ role: "employee" }),
      PhishingCampaign.countDocuments({ status: "running" }),
      Notification.countDocuments({ userId: req.user._id, isRead: false }),
    ]);
    return res.status(200).json({
      success: true,
      data: { totalEmployees, activeCampaigns, unreadNotifications },
    });
  } catch (error) {
    return next(error);
  }
};