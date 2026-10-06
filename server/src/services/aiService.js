const PhishingAttempt = require("../models/PhishingAttempt");
const QuizResult = require("../models/QuizResult");
const TrainingProgress = require("../models/TrainingProgress");

const finiteNumber = (value) => {
	if (typeof value !== "number" || !Number.isFinite(value)) return null;
	return value;
};

const getPercentage = (result) => {
	const storedPercentage = finiteNumber(result.percentage);
	if (storedPercentage !== null) {
		return Math.min(100, Math.max(0, storedPercentage));
	}

	const correctAnswers = finiteNumber(result.correctAnswers);
	const totalQuestions = finiteNumber(result.totalQuestions);
	if (correctAnswers === null || totalQuestions === null || totalQuestions <= 0) {
		return null;
	}

	return Math.min(100, Math.max(0, (correctAnswers / totalQuestions) * 100));
};

const average = (values) =>
	values.length ? values.reduce((total, value) => total + value, 0) / values.length : null;

const buildFeaturesForUser = async (userId) => {
	const [quizResults, trainingProgress, phishingAttempts] = await Promise.all([
		QuizResult.find({ userId })
			.select("percentage correctAnswers totalQuestions timeTaken submittedAt completedAt")
			.lean(),
		TrainingProgress.find({ userId })
			.select("progress completed")
			.lean(),
		PhishingAttempt.find({ $or: [{ employeeId: userId }, { userId }] })
			.select("clicked credentialsEntered reported")
			.lean(),
	]);

	const quizPercentages = quizResults.map(getPercentage).filter((value) => value !== null);
	const quizTimes = quizResults
		.map((result) => finiteNumber(result.timeTaken))
		.filter((value) => value !== null && value >= 0);
	const trainingProgressValues = trainingProgress
		.map((record) => finiteNumber(record.progress))
		.filter((value) => value !== null)
		.map((value) => Math.min(100, Math.max(0, value)));
	const completedTrainingCount = trainingProgress.filter(
		(record) => record.completed === true
	).length;
	const clickedCount = phishingAttempts.filter(
		(attempt) => attempt.clicked === true
	).length;

	return {
		quiz_attempt_count: quizResults.length,
		quiz_valid_percentage_count: quizPercentages.length,
		quiz_avg_percentage: average(quizPercentages),
		quiz_best_percentage: quizPercentages.length ? Math.max(...quizPercentages) : null,
		quiz_latest_percentage: getPercentage(
			[...quizResults].sort(
				(left, right) =>
					new Date(right.completedAt || right.submittedAt || 0) -
					new Date(left.completedAt || left.submittedAt || 0)
			)[0] || {}
		),
		quiz_avg_time_taken: average(quizTimes),
		training_record_count: trainingProgress.length,
		training_completed_count: completedTrainingCount,
		training_completion_rate: trainingProgress.length
			? completedTrainingCount / trainingProgress.length
			: null,
		training_avg_progress: average(trainingProgressValues),
		phishing_data_available: phishingAttempts.length > 0,
		phishing_attempt_count: phishingAttempts.length,
		phishing_click_count: clickedCount,
		phishing_click_rate: phishingAttempts.length
			? clickedCount / phishingAttempts.length
			: null,
		phishing_credentials_entered_count: phishingAttempts.filter(
			(attempt) => attempt.credentialsEntered === true
		).length,
		phishing_reported_count: phishingAttempts.filter(
			(attempt) => attempt.reported === true
		).length,
	};
};

module.exports = { buildFeaturesForUser };
