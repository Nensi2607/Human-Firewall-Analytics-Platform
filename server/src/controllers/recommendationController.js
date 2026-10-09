const mongoose = require("mongoose");
const Recommendation = require("../models/Recommendation");
const User = require("../models/User");
const recommendationService = require("../services/recommendationService");

const resolveTargetUserId = async (req) => {
	const requestedUserId = req.query.employeeId;
	if (!requestedUserId) return req.user._id;
	if (req.user.role !== "admin" || !mongoose.Types.ObjectId.isValid(requestedUserId)) {
		const error = new Error("Only administrators can request recommendations for an employee.");
		error.statusCode = 403;
		throw error;
	}

	const employee = await User.exists({ _id: requestedUserId, role: "employee" });
	if (!employee) {
		const error = new Error("Employee not found.");
		error.statusCode = 404;
		throw error;
	}
	return requestedUserId;
};

exports.getRecommendations = async (req, res, next) => {
	try {
		const query = req.user.role === "admin" && !req.query.employeeId
			? { audience: { $in: ["employee", "admin"] } }
			: req.user.role === "employee"
				? {
					userId: req.user._id,
					$or: [{ audience: "employee" }, { audience: { $exists: false } }],
				}
				: {
					userId: await resolveTargetUserId(req),
					audience: { $in: ["employee", "admin"] },
				};
		const recommendations = await Recommendation.find(query)
			.populate("userId", "firstName lastName email")
			.sort({ priority: -1, updatedAt: -1 })
			.lean();
		res.status(200).json({ success: true, data: recommendations });
	} catch (error) {
		next(error);
	}
};

exports.getMyRecommendations = async (req, res, next) => {
	try {
		const recommendations = await recommendationService.getEmployeeRecommendations(req.user);
		res.status(200).json({ success: true, data: recommendations });
	} catch (error) {
		next(error);
	}
};

exports.getAdminRecommendations = async (req, res, next) => {
	try {
		const recommendations = await recommendationService.getAdminRecommendations();
		res.status(200).json({ success: true, data: recommendations });
	} catch (error) {
		next(error);
	}
};

exports.dismissAdminRecommendation = async (req, res, next) => {
	try {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return res.status(400).json({ success: false, message: "A valid recommendation ID is required." });
		}
		const recommendation = await Recommendation.findOneAndUpdate(
			{ _id: req.params.id, audience: "admin" },
			{ $set: { status: "dismissed" } },
			{ new: true, runValidators: true }
		).lean();
		if (!recommendation) {
			return res.status(404).json({ success: false, message: "Admin recommendation not found." });
		}
		res.status(200).json({ success: true, data: recommendation });
	} catch (error) {
		next(error);
	}
};

exports.updateRecommendationStatus = async (req, res, next) => {
	try {
		const allowedStatuses = ["pending", "in-progress", "completed", "dismissed"];
		if (!mongoose.Types.ObjectId.isValid(req.params.id) || !allowedStatuses.includes(req.body?.status)) {
			return res.status(400).json({ success: false, message: "A valid recommendation and status are required." });
		}

		const filter = req.user.role === "admin"
			? { _id: req.params.id }
			: {
				_id: req.params.id,
				userId: req.user._id,
				$or: [{ audience: "employee" }, { audience: { $exists: false } }],
			};
		const recommendation = await Recommendation.findOneAndUpdate(
			filter,
			{ $set: { status: req.body.status } },
			{ new: true, runValidators: true }
		).lean();

		if (!recommendation) {
			return res.status(404).json({ success: false, message: "Recommendation not found." });
		}
		res.status(200).json({ success: true, data: recommendation });
	} catch (error) {
		next(error);
	}
};
