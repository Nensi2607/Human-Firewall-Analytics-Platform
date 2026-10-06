const mongoose = require("mongoose");
const Department = require("../models/Department");
const User = require("../models/User");
const Quiz = require("../models/Quiz");
const PhishingCampaign = require("../models/PhishingCampaign");

const getDepartmentInput = (body, requireName = false) => {
  const allowedFields = ["departmentName", "description", "manager", "status"];
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).length === 0 ||
    Object.keys(body).some((field) => !allowedFields.includes(field))
  ) {
    return null;
  }

  const input = {};
  if (requireName || body.departmentName !== undefined) {
    if (typeof body.departmentName !== "string") return null;
    const departmentName = body.departmentName.trim();
    if (!departmentName || departmentName.length > 120) return null;
    input.departmentName = departmentName;
  }
  if (body.description !== undefined) {
    if (typeof body.description !== "string" || body.description.length > 500) {
      return null;
    }
    input.description = body.description.trim();
  }
  if (body.manager !== undefined) {
    if (
      body.manager !== null &&
      body.manager !== "" &&
      !mongoose.Types.ObjectId.isValid(body.manager)
    ) {
      return null;
    }
    input.manager = body.manager || null;
  }
  if (body.status !== undefined) {
    if (!["active", "inactive"].includes(body.status)) return null;
    input.status = body.status;
  }

  return Object.keys(input).length > 0 ? input : null;
};

const isValidManager = async (managerId) =>
  !managerId || Boolean(await User.exists({ _id: managerId }));

// ==========================================
// Create Department
// ==========================================
exports.createDepartment = async (req, res, next) => {
  try {
    const input = getDepartmentInput(req.body, true);
    if (!input || !(await isValidManager(input.manager))) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid department name and manager.",
      });
    }

    const existingDepartment = await Department.findOne({
      departmentName: input.departmentName,
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: "Department already exists",
      });
    }

    const department = await Department.create(input);

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department,
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// Get All Departments
// ==========================================
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate(
      "manager",
      "firstName lastName email"
    );

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// Get Department By ID
// ==========================================
exports.getDepartment = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID.",
      });
    }

    const department = await Department.findById(req.params.id).populate(
      "manager",
      "firstName lastName email"
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// Update Department
// ==========================================
exports.updateDepartment = async (req, res, next) => {
  try {
    const input = getDepartmentInput(req.body);
    if (
      !mongoose.Types.ObjectId.isValid(req.params.id) ||
      !input ||
      !(await isValidManager(input.manager))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid department update.",
      });
    }

    if (input.departmentName) {
      const existingDepartment = await Department.exists({
        departmentName: input.departmentName,
        _id: { $ne: req.params.id },
      });
      if (existingDepartment) {
        return res.status(409).json({
          success: false,
          message: "Department already exists.",
        });
      }
    }

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      input,
      {
        new: true,
        runValidators: true,
      }
    ).populate("manager", "firstName lastName email");

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: department,
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// Delete Department
// ==========================================
exports.deleteDepartment = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID.",
      });
    }

    const [hasEmployees, hasQuizzes, hasCampaigns] = await Promise.all([
      User.exists({ departmentId: req.params.id }),
      Quiz.exists({ targetDepartments: req.params.id }),
      PhishingCampaign.exists({ targetDepartments: req.params.id }),
    ]);
    if (hasEmployees || hasQuizzes || hasCampaigns) {
      return res.status(409).json({
        success: false,
        message: "This department is still referenced by employees, quizzes, or campaigns. Deactivate it instead.",
      });
    }

    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// Assign Manager
// ==========================================
exports.assignManager = async (req, res, next) => {
  try {
    const { managerId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(req.params.id) ||
      (managerId &&
        (!mongoose.Types.ObjectId.isValid(managerId) ||
          !(await User.exists({ _id: managerId }))))
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid department and manager.",
      });
    }

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    department.manager = managerId || null;

    await department.save();

    const updatedDepartment = await Department.findById(
      department._id
    ).populate("manager", "firstName lastName email");

    res.status(200).json({
      success: true,
      message: "Manager assigned successfully",
      data: updatedDepartment,
    });
  } catch (err) {
    next(err);
  }
};