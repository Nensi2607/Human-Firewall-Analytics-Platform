const PhishingAttempt = require("../models/PhishingAttempt");
const QuizResult = require("../models/QuizResult");
const Recommendation = require("../models/Recommendation");
const AIPrediction = require("../models/AIPrediction");
const Training = require("../models/Training");
const TrainingProgress = require("../models/TrainingProgress");
const { createUserNotification } = require("./notificationService");

const buildRecommendations = ({
	riskScore,
	latestQuiz,
	latestPhishingAttempt,
	latestPrediction,
	incompleteTrainingCount,
}) => {
	const recommendations = [];
	const riskScoreSnapshot = Number.isFinite(riskScore) ? riskScore : null;
	const quizPercentage =
		typeof latestQuiz?.percentage === "number" &&
		Number.isFinite(latestQuiz.percentage)
			? latestQuiz.percentage
			: typeof latestQuiz?.correctAnswers === "number" &&
				latestQuiz.totalQuestions > 0
				? (latestQuiz.correctAnswers / latestQuiz.totalQuestions) * 100
				: null;

	if (quizPercentage !== null && quizPercentage < 70) {
		recommendations.push({
			riskScoreSnapshot,
			title: "Review your recent quiz topics",
			description: `Your latest quiz score was ${Math.round(quizPercentage)}%. Review the missed topics and retry the related learning material.`,
			priority: "medium",
		});
	}

	if (
		latestPhishingAttempt &&
		(latestPhishingAttempt.clicked ||
			latestPhishingAttempt.linkClicked ||
			latestPhishingAttempt.credentialsEntered)
	) {
		recommendations.push({
			riskScoreSnapshot,
			title: "Review phishing-awareness training",
			description:
				"A recent phishing simulation link was opened. Refresh your knowledge of suspicious links and verify unexpected messages before interacting with them.",
			priority: "high",
		});
	}

	if (incompleteTrainingCount > 0) {
		recommendations.push({
			riskScoreSnapshot,
			title: "Complete available security training",
			description: `You have ${incompleteTrainingCount} available training ${incompleteTrainingCount === 1 ? "module" : "modules"} not marked complete. Continue with the remaining material.`,
			priority: "low",
		});
	}

	if (latestPrediction?.predictedRisk === "High") {
		recommendations.push({
			riskScoreSnapshot,
			title: "Review your highest-risk security behaviors",
			description:
			"The latest baseline model prediction is High risk. Review your quiz, training, and phishing activity with your security administrator.",
			priority: "high",
		});
	} else if (latestPrediction?.predictedRisk === "Medium") {
		recommendations.push({
			riskScoreSnapshot,
			title: "Strengthen your security habits",
			description:
			"The latest baseline model prediction is Medium risk. Continue assigned training and review recent security activity.",
			priority: "medium",
		});
	}

	return recommendations;
};

const generateRecommendations = async (userId, riskScore) => {
	const [latestQuiz, latestPhishingAttempt, latestPrediction, availableTrainings] =
		await Promise.all([
			QuizResult.findOne({ userId })
				.select("percentage correctAnswers totalQuestions completedAt submittedAt")
				.sort({ completedAt: -1, submittedAt: -1 })
				.lean(),
			PhishingAttempt.findOne({ userId })
				.select("clicked linkClicked credentialsEntered sentAt")
				.sort({ sentAt: -1 })
				.lean(),
			AIPrediction.findOne({ userId })
				.select("predictedRisk confidence modelVersion generatedAt")
				.sort({ generatedAt: -1 })
				.lean(),
			Training.find().select("_id").lean(),
		]);

	const availableTrainingIds = availableTrainings.map((training) => training._id);
	const completedTrainingIds = availableTrainingIds.length
		? await TrainingProgress.distinct("trainingId", {
				userId,
				completed: true,
				trainingId: { $in: availableTrainingIds },
			})
		: [];
	const completedTrainingIdSet = new Set(
		completedTrainingIds.map((trainingId) => trainingId.toString())
	);
	const incompleteTrainingCount = availableTrainingIds.filter(
		(trainingId) => !completedTrainingIdSet.has(trainingId.toString())
	).length;

	const decisions = buildRecommendations({
		riskScore,
		latestQuiz,
		latestPhishingAttempt,
		latestPrediction,
		incompleteTrainingCount,
	});

	const savedRecommendations = [];
	for (const decision of decisions) {
		const existingRecommendation = await Recommendation.exists({
			userId,
			title: decision.title,
			status: { $in: ["pending", "in-progress"] },
		});
		const recommendation = await Recommendation.findOneAndUpdate(
			{
				userId,
				title: decision.title,
				status: { $in: ["pending", "in-progress"] },
			},
			{
				$set: {
					...decision,
					userId,
					status: "pending",
				},
			},
			{
				new: true,
				upsert: true,
				runValidators: true,
				setDefaultsOnInsert: true,
			}
		);
		savedRecommendations.push(recommendation);
		if (!existingRecommendation) {
			await createUserNotification({
				userId,
				title: "New security recommendation",
				message: decision.title,
				type: "info",
			});
		}
	}

	return savedRecommendations;
};

module.exports = { buildRecommendations, generateRecommendations };