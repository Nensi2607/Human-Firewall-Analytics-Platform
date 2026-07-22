const Department = require("../models/Department");

// ==========================================
// Create Department
// ==========================================
exports.createDepartment = async (req, res, next) => {
  try {
    const existingDepartment = await Department.findOne({
      departmentName: req.body.departmentName,
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: "Department already exists",
      });
    }

    const department = await Department.create(req.body);

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
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
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

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    department.manager = managerId;

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