const mongoose = require("mongoose");
const User = require("../models/User");
const { getEmployeeProgress } = require("../services/employeeProgressService");

exports.getEmployeeProgress = async (req, res, next) => {
	try {
		const requestedEmployeeId = req.query.employeeId;
		let employeeId = req.user._id;

		if (req.user.role === "admin") {
			if (!requestedEmployeeId || !mongoose.Types.ObjectId.isValid(requestedEmployeeId)) {
				return res.status(400).json({
					success: false,
					message: "A valid employeeId is required for administrators.",
				});
			}
			employeeId = requestedEmployeeId;
		} else if (
			requestedEmployeeId &&
			requestedEmployeeId !== req.user._id.toString()
		) {
			return res.status(403).json({
				success: false,
				message: "Employees can only view their own progress.",
			});
		}

		const employee = await User.findOne({ _id: employeeId, role: "employee" })
			.select("firstName lastName email departmentId")
			.lean();

		if (!employee) {
			return res.status(404).json({
				success: false,
				message: "Employee not found.",
			});
		}

		const progress = await getEmployeeProgress(employee);
		res.status(200).json({
			success: true,
			data: {
				employee: {
					_id: employee._id,
					firstName: employee.firstName,
					lastName: employee.lastName,
					email: employee.email,
				},
				...progress,
			},
		});
	} catch (err) {
		next(err);
	}
};