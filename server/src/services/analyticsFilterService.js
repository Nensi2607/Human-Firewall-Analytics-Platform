const RiskAssessment = require("../models/RiskAssessment");
const QuizResult = require("../models/QuizResult");
const Training = require("../models/Training");
const TrainingProgress = require("../models/TrainingProgress");
const PhishingAttempt = require("../models/PhishingAttempt");
const User = require("../models/User");

const intersectIds = (currentIds, matchingIds) => {
	const matchingSet = new Set(matchingIds.map((id) => id.toString()));
	return currentIds.filter((id) => matchingSet.has(id.toString()));
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const resolveAnalyticsEmployeeIds = async (filters) => {
	const hasFilters = Object.values(filters).some((value) => value !== undefined);
	if (!hasFilters) return null;

	const employeeQuery = { role: "employee" };
	if (filters.departmentId) employeeQuery.departmentId = filters.departmentId;
	if (filters.employee) {
		const search = new RegExp(escapeRegex(filters.employee), "i");
		employeeQuery.$or = [
			{ firstName: search },
			{ lastName: search },
			{ email: search },
			{
				$expr: {
					$regexMatch: {
						input: {
							$concat: [
								{ $ifNull: ["$firstName", ""] },
								" ",
								{ $ifNull: ["$lastName", ""] },
							],
						},
						regex: escapeRegex(filters.employee),
						options: "i",
					},
				},
			},
		];
	}

	let employeeIds = await User.distinct("_id", employeeQuery);
	if (filters.riskLevel) {
		const matchingIds = await RiskAssessment.distinct("userId", {
			riskLevel: filters.riskLevel,
		});
		employeeIds = intersectIds(employeeIds, matchingIds);
	}

	if (
		filters.minQuizPercentage !== undefined ||
		filters.maxQuizPercentage !== undefined
	) {
		const matchingQuizAverages = await QuizResult.aggregate([
			{ $match: { userId: { $in: employeeIds } } },
			{
				$project: {
					userId: 1,
					quizPercentage: {
						$ifNull: [
							"$percentage",
							{
								$cond: [
									{ $gt: ["$totalQuestions", 0] },
									{
										$multiply: [
											{ $divide: ["$correctAnswers", "$totalQuestions"] },
											100,
										],
									},
										0,
								],
							},
						],
					},
				},
			},
			{
				$group: {
					_id: "$userId",
					averagePercentage: { $avg: "$quizPercentage" },
				},
			},
			{
				$match: {
					averagePercentage: {
						...(filters.minQuizPercentage === undefined
							? {}
							: { $gte: filters.minQuizPercentage }),
						...(filters.maxQuizPercentage === undefined
							? {}
							: { $lte: filters.maxQuizPercentage }),
					},
				},
			},
		]);
		employeeIds = intersectIds(
			employeeIds,
			matchingQuizAverages.map((item) => item._id)
		);
	}

	if (filters.trainingStatus) {
		const totalTrainingCount = await Training.countDocuments();
		const trainingProgress = await TrainingProgress.aggregate([
			{
				$match: {
					userId: { $in: employeeIds },
				},
			},
			{
				$lookup: {
					from: "trainings",
					localField: "trainingId",
					foreignField: "_id",
					as: "training",
				},
			},
			{ $unwind: "$training" },
			{
				$group: {
					_id: "$userId",
					startedCount: { $sum: 1 },
					completedCount: {
						$sum: { $cond: [{ $eq: ["$completed", true] }, 1, 0] },
					},
				},
			},
		]);
		const progressByEmployee = new Map(
			trainingProgress.map((item) => [item._id.toString(), item])
		);
		employeeIds = employeeIds.filter((employeeId) => {
			const progress = progressByEmployee.get(employeeId.toString());
			if (filters.trainingStatus === "not-started") {
				return !progress || progress.startedCount === 0;
			}
			if (filters.trainingStatus === "completed") {
				return totalTrainingCount > 0 &&
					(progress?.completedCount || 0) >= totalTrainingCount;
			}
			return Boolean(progress?.startedCount) &&
				(progress?.completedCount || 0) < totalTrainingCount;
		});
	}

	if (filters.phishingResult) {
		const phishingByEmployee = await PhishingAttempt.aggregate([
			{
				$match: {
					$or: [
						{ employeeId: { $in: employeeIds } },
						{ employeeId: { $exists: false }, userId: { $in: employeeIds } },
					],
				},
			},
			{
				$group: {
					_id: { $ifNull: ["$employeeId", "$userId"] },
					attemptCount: { $sum: 1 },
					clickedCount: {
						$sum: {
							$cond: [
								{
									$or: [
										{ $eq: ["$clicked", true] },
										{ $eq: ["$linkClicked", true] },
										{ $eq: ["$credentialsEntered", true] },
									],
								},
								1,
								0,
							],
						},
					},
					reportedCount: {
						$sum: { $cond: [{ $eq: ["$reported", true] }, 1, 0] },
					},
				},
			},
		]);
		const phishingByUserId = new Map(
			phishingByEmployee.map((item) => [item._id.toString(), item])
		);
		employeeIds = employeeIds.filter((employeeId) => {
			const result = phishingByUserId.get(employeeId.toString());
			if (filters.phishingResult === "no-attempt") return !result;
			if (filters.phishingResult === "clicked") return Boolean(result?.clickedCount);
			if (filters.phishingResult === "reported") return Boolean(result?.reportedCount);
			return Boolean(result?.attemptCount) && result.clickedCount === 0;
		});
	}

	return employeeIds;
};

module.exports = { resolveAnalyticsEmployeeIds };