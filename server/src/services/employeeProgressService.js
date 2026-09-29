const Quiz = require("../models/Quiz");
const QuizResult = require("../models/QuizResult");
const Training = require("../models/Training");
const TrainingProgress = require("../models/TrainingProgress");

const getId = (value) => value?.toString();

const percentage = (value, total) =>
	total > 0 ? Math.round((value / total) * 100) : null;

const buildEmployeeProgress = ({
	trainings,
	trainingProgress,
	quizzes,
	completedQuizIds,
}) => {
	const progressByTrainingId = new Map(
		trainingProgress.map((record) => [getId(record.trainingId), record])
	);
	const completedQuizIdSet = new Set(completedQuizIds.map(getId));
	const trainingProgressValues = trainings.map((training) => {
		const record = progressByTrainingId.get(getId(training._id));
		if (record?.completed) return 100;
		if (typeof record?.progress !== "number" || !Number.isFinite(record.progress)) {
			return 0;
		}
		return Math.min(100, Math.max(0, record.progress));
	});
	const completedTrainingCount = trainings.filter(
		(training) => progressByTrainingId.get(getId(training._id))?.completed
	).length;
	const completedQuizCount = quizzes.filter((quiz) =>
		completedQuizIdSet.has(getId(quiz._id))
	).length;
	const trainingProgressTotal = trainingProgressValues.reduce(
		(total, value) => total + value,
		0
	);
	const engagementActivities = trainings.length + quizzes.length;
	const engagementProgress = trainingProgressTotal + completedQuizCount * 100;

	return {
		training: {
			completed: completedTrainingCount,
			total: trainings.length,
			completionPercentage: trainings.length
				? Math.round((trainingProgressTotal / trainings.length) * 10) / 10
				: null,
		},
		quizzes: {
			completed: completedQuizCount,
			total: quizzes.length,
			completionPercentage: percentage(completedQuizCount, quizzes.length),
		},
		overallEngagementPercentage: percentage(
			engagementProgress,
			engagementActivities * 100
		),
	};
};

const getEmployeeProgress = async (employee) => {
	const quizAssignmentFilters = [
		{ targetAll: true },
		{ targetUsers: employee._id },
	];
	if (employee.departmentId) {
		quizAssignmentFilters.push({ targetDepartments: employee.departmentId });
	}

	const [trainings, quizzes] = await Promise.all([
		Training.find().select("_id").lean(),
		Quiz.find({ $or: quizAssignmentFilters }).select("_id title").lean(),
	]);
	const trainingIds = trainings.map((training) => training._id);
	const quizIds = quizzes.map((quiz) => quiz._id);

	const [trainingProgress, completedQuizIds] = await Promise.all([
		trainingIds.length
			? TrainingProgress.find({
					userId: employee._id,
					trainingId: { $in: trainingIds },
				})
					.select("trainingId progress completed")
					.lean()
			: [],
		quizIds.length
			? QuizResult.distinct("quizId", {
					userId: employee._id,
					quizId: { $in: quizIds },
				})
			: [],
	]);

	return buildEmployeeProgress({
		trainings,
		trainingProgress,
		quizzes,
		completedQuizIds,
	});
};

module.exports = { buildEmployeeProgress, getEmployeeProgress };