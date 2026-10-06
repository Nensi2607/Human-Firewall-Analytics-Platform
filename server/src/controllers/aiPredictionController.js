const User = require("../models/User");
const mongoose = require("mongoose");
const { generatePredictionForUser } = require("../services/predictionService");

exports.predictAndSave = async (req, res, next) => {
	try {
		const requestedEmployeeId = req.body?.employeeId || req.body?.userId;
		if (
			requestedEmployeeId &&
			(!mongoose.Types.ObjectId.isValid(requestedEmployeeId) ||
				req.user.role !== "admin")
		) {
			return res.status(403).json({
				success: false,
				message: "Only administrators can request a prediction for another employee.",
			});
		}

		const employeeId = requestedEmployeeId || req.user._id;
		const employee = await User.findOne({ _id: employeeId, role: "employee" })
			.select("_id")
			.lean();

		if (!employee) {
			return res.status(400).json({
				success: false,
				message: "A valid employee target is required.",
			});
		}

		const prediction = await generatePredictionForUser(employee._id);

		return res.status(201).json({
			success: true,
			data: {
				id: prediction._id,
				userId: prediction.userId,
				predictedRisk: prediction.predictedRisk,
				confidence: prediction.confidence,
				modelVersion: prediction.modelVersion,
				generatedAt: prediction.generatedAt,
			},
		});
	} catch (error) {
		if (error.name === "AbortError") {
			return res.status(503).json({
				success: false,
				message: "The ML service did not respond in time; no prediction was saved.",
			});
		}
		if (error.statusCode) {
			return res.status(error.statusCode).json({
				success: false,
				message: error.message,
				error: error.code,
			});
		}
		if (error instanceof TypeError && error.message.toLowerCase().includes("fetch")) {
			return res.status(503).json({
				success: false,
				message: "The ML service is unavailable; no prediction was saved.",
			});
		}
		next(error);
	}
};