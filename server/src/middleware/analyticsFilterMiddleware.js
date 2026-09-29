const mongoose = require("mongoose");
const { resolveAnalyticsEmployeeIds } = require("../services/analyticsFilterService");

const allowedRiskLevels = new Set(["Low", "Medium", "High"]);
const allowedTrainingStatuses = new Set(["completed", "in-progress", "not-started"]);
const allowedPhishingResults = new Set(["clicked", "reported", "no-click", "no-attempt"]);

const parsePercentage = (value) => {
	if (value === undefined) return undefined;
	if (typeof value !== "string" || value.trim() === "") return null;
	const percentage = Number(value);
	return Number.isFinite(percentage) && percentage >= 0 && percentage <= 100
		? percentage
		: null;
};

exports.analyticsFilterMiddleware = async (req, res, next) => {
	try {
		const {
			employee,
			departmentId,
			riskLevel,
			minQuizPercentage,
			maxQuizPercentage,
			trainingStatus,
			phishingResult,
		} = req.query;
		const minimumQuiz = parsePercentage(minQuizPercentage);
		const maximumQuiz = parsePercentage(maxQuizPercentage);
		const invalid =
			(employee !== undefined &&
				(typeof employee !== "string" || employee.trim().length > 100)) ||
			(departmentId !== undefined &&
				(typeof departmentId !== "string" ||
					!mongoose.Types.ObjectId.isValid(departmentId))) ||
			(riskLevel !== undefined && !allowedRiskLevels.has(riskLevel)) ||
			minimumQuiz === null ||
			maximumQuiz === null ||
			(minimumQuiz !== undefined &&
				maximumQuiz !== undefined &&
				minimumQuiz > maximumQuiz) ||
			(trainingStatus !== undefined &&
				!allowedTrainingStatuses.has(trainingStatus)) ||
			(phishingResult !== undefined &&
				!allowedPhishingResults.has(phishingResult));

		if (invalid) {
			return res.status(400).json({
				success: false,
				message: "One or more analytics filters are invalid.",
			});
		}

		req.analyticsEmployeeIds = await resolveAnalyticsEmployeeIds({
			employee: employee?.trim() || undefined,
			departmentId,
			riskLevel,
			minQuizPercentage: minimumQuiz,
			maxQuizPercentage: maximumQuiz,
			trainingStatus,
			phishingResult,
		});
		next();
	} catch (error) {
		next(error);
	}
};