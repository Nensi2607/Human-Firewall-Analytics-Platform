const mongoose = require("mongoose");
const User = require("../models/User");
const Department = require("../models/Department");

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