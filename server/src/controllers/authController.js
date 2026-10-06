const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// ===============================
// Register User
// ===============================
exports.register = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      departmentId,
      designation,
    } = req.body;

    // Check if user already exists
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      passwordHash: password,
      role: "employee",
      departmentId,
      designation,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    next(err);
  }
};

// ===============================
// Login User
// ===============================
exports.login = async (req, res, next) => {
  try {

    const { email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status === "inactive") {
      return res.status(403).json({
        success: false,
        message: "This account is inactive. Contact your administrator.",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    next(err);
  }
};

// ===============================
// Get Current User
// ===============================
exports.getMe = async (req, res, next) => {

  try {

    res.status(200).json({
      success: true,
      user: req.user,
    });

  } catch (err) {
    next(err);
  }

};

// ===============================
// Forgot Password
// ===============================
exports.forgotPassword = async (req, res, next) => {
  try {
    res.status(501).json({
      success: false,
      message: "Password recovery is not configured. Contact your administrator.",
    });
  } catch (err) {
    next(err);
  }
};

// ===============================
// Reset Password
// ===============================
exports.resetPassword = async (req, res, next) => {
  try {
    res.status(501).json({
      success: false,
      message: "Password recovery is not configured. Contact your administrator.",
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res) => {

    res.status(200).json({
        success:true,
        message:"Logged out successfully"
    });

}