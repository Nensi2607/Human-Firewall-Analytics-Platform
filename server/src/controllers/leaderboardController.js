const mongoose = require("mongoose");
const Department = require("../models/Department");
const { getLeaderboard } = require("../services/leaderboardService");

exports.getLeaderboard = async (req, res, next) => {
	try {
		const { departmentId } = req.query;
		let department = null;

		if (departmentId) {
			if (!mongoose.Types.ObjectId.isValid(departmentId)) {
				return res.status(400).json({
					success: false,
					message: "Invalid department ID.",
				});
			}

			department = await Department.findById(departmentId)
				.select("departmentName")
				.lean();
			if (!department) {
				return res.status(404).json({
					success: false,
					message: "Department not found.",
				});
			}
		}

		const data = await getLeaderboard(departmentId);
		res.status(200).json({
			success: true,
			scope: department
				? { departmentId, departmentName: department.departmentName }
				: { departmentId: null, departmentName: "Company-wide" },
			data,
		});
	} catch (err) {
		next(err);
	}
};