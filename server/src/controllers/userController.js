const User = require("../models/User");

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
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
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