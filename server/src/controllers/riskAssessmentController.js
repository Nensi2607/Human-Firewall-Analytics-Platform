const RiskAssessment = require("../models/RiskAssessment");
const { calculateRiskAssessment } = require("../services/riskAssessmentService");
const { getEmployeeRecommendations } = require("../services/recommendationService");
const { createUserNotification } = require("../services/notificationService");
const { generatePredictionForUser } = require("../services/predictionService");

exports.getRiskAssessment = async (req, res, next) => {
	try {
		const assessment = await RiskAssessment.findOne({
			userId: req.user._id,
		})
			.select(
				"trainingScore quizScore phishingScore securityAwarenessScore finalRiskScore riskLevel assessedAt"
			)
			.lean();

		res.status(200).json({
			success: true,
			data: assessment,
		});
	} catch (err) {
		next(err);
	}
};

exports.calculateCurrentRiskAssessment = async (req, res, next) => {
	try {
		const previousAssessment = await RiskAssessment.findOne({
			userId: req.user._id,
		}).select("riskLevel").lean();
		const assessment = await calculateRiskAssessment(req.user._id);
		if (
			previousAssessment?.riskLevel &&
			assessment?.riskLevel &&
			previousAssessment.riskLevel !== assessment.riskLevel
		) {
			await createUserNotification({
				userId: req.user._id,
				title: "Risk status changed",
				message: `Your Human Risk status changed from ${previousAssessment.riskLevel} to ${assessment.riskLevel}.`,
				type: assessment.riskLevel === "High" ? "alert" : "info",
			});
		}
		const recommendations = assessment
			? await getEmployeeRecommendations(req.user)
			: [];
		let prediction = null;
		if (assessment) {
			try {
				prediction = await generatePredictionForUser(req.user._id);
			} catch (predictionError) {
				console.warn("AI prediction unavailable during risk calculation:", predictionError.message);
			}
		}

		res.status(200).json({
			success: true,
			data: assessment,
			recommendations,
			prediction,
		});
	} catch (err) {
		next(err);
	}
};
