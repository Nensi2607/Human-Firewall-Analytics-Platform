const QuizResult = require("../models/QuizResult");
const Training = require("../models/Training");
const TrainingProgress = require("../models/TrainingProgress");
const User = require("../models/User");

const roundToOneDecimal = (value) => Math.round(value * 10) / 10;

const buildLeaderboard = ({
	employees,
	quizAverages,
	completedTrainingCounts,
	totalTrainingCount,
}) => {
	const quizAverageByUser = new Map(
		quizAverages.map((item) => [item._id.toString(), item.averageQuizPercentage])
	);
	const completedTrainingByUser = new Map(
		completedTrainingCounts.map((item) => [item._id.toString(), item.completedCount])
	);

	const rows = employees.map((employee) => {
		const averageQuizPercentage = roundToOneDecimal(
			quizAverageByUser.get(employee._id.toString()) || 0
		);
		const completedTrainings =
			completedTrainingByUser.get(employee._id.toString()) || 0;
		const trainingCompletionPercentage = totalTrainingCount
			? roundToOneDecimal((completedTrainings / totalTrainingCount) * 100)
			: 0;

		// Placeholder ranking formula: (average quiz percentage + training completion percentage) / 2; pending a final team decision.
		const leaderboardScore = roundToOneDecimal(
			(averageQuizPercentage + trainingCompletionPercentage) / 2
		);

		return {
			userId: employee._id,
			name: `${employee.firstName} ${employee.lastName}`.trim(),
			department: employee.departmentId?.departmentName || "Unassigned",
			averageQuizPercentage,
			completedTrainings,
			totalTrainings: totalTrainingCount,
			trainingCompletionPercentage,
			leaderboardScore,
		};
	});

	rows.sort((left, right) =>
		right.leaderboardScore - left.leaderboardScore ||
		right.averageQuizPercentage - left.averageQuizPercentage ||
		left.name.localeCompare(right.name)
	);

	return rows.map((row, index) => ({ ...row, rank: index + 1 }));
};

const getLeaderboard = async (departmentId) => {
	const employeeQuery = { role: "employee", status: "active" };
	if (departmentId) employeeQuery.departmentId = departmentId;

	const [employees, totalTrainingCount] = await Promise.all([
		User.find(employeeQuery)
			.select("firstName lastName departmentId")
			.populate("departmentId", "departmentName")
			.sort({ firstName: 1, lastName: 1 })
			.lean(),
		Training.countDocuments(),
	]);
	const employeeIds = employees.map((employee) => employee._id);

	if (employeeIds.length === 0) return [];

	const [quizAverages, completedTrainingCounts] = await Promise.all([
		QuizResult.aggregate([
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
									null,
								],
							},
						],
					},
				},
			},
			{ $match: { quizPercentage: { $ne: null } } },
			{
				$group: {
					_id: "$userId",
					averageQuizPercentage: { $avg: "$quizPercentage" },
				},
			},
		]),
		TrainingProgress.aggregate([
			{
				$match: {
					userId: { $in: employeeIds },
					completed: true,
				},
			},
			{
				$group: {
					_id: "$userId",
					completedCount: { $sum: 1 },
				},
			},
		]),
	]);

	return buildLeaderboard({
		employees,
		quizAverages,
		completedTrainingCounts,
		totalTrainingCount,
	});
};

module.exports = { buildLeaderboard, getLeaderboard };