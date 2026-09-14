const RiskAssessment = require("../models/RiskAssessment");
const { calculateRiskAssessment } = require("../services/riskAssessmentService");

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
		const assessment = await calculateRiskAssessment(req.user._id);

		res.status(200).json({
			success: true,
			data: assessment,
		});
	} catch (err) {
		next(err);
	}
};
