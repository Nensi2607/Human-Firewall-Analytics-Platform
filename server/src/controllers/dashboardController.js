const User = require("../models/User");
const Department = require("../models/Department");

// ==========================================
// Admin Dashboard
// ==========================================
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const totalEmployees = await User.countDocuments({
      role: "employee",
    });

    const totalAdmins = await User.countDocuments({
      role: "admin",
    });

    const totalDepartments = await Department.countDocuments();

    const activeEmployees = await User.countDocuments({
      role: "employee",
      status: "active",
    });

    const inactiveEmployees = await User.countDocuments({
      role: "employee",
      status: "inactive",
    });

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        totalAdmins,
        totalDepartments,
        activeEmployees,
        inactiveEmployees,
        averageRiskScore: 0,
        completedTrainings: 0,
        pendingTrainings: 0,
      },
    });

  } catch (err) {
    next(err);
  }
};

// ==========================================
// Employee Dashboard
// ==========================================
exports.getEmployeeDashboard = async (req, res, next) => {
  try {

    const user = await User.findById(req.user._id)
      .populate("departmentId", "departmentName");

    res.status(200).json({
      success: true,
      data: {
        employee: user,
        completedTrainings: 0,
        pendingTrainings: 0,
        quizzesCompleted: 0,
        riskScore: 0,
      },
    });

  } catch (err) {
    next(err);
  }
};