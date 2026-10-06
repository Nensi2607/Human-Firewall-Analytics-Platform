const RiskAssessment = require("../models/RiskAssessment");
const Training = require("../models/Training");
const TrainingProgress = require("../models/TrainingProgress");
const QuizResult = require("../models/QuizResult");
const PhishingAwarenessResult = require("../models/PhishingAwarenessResult");
const PhishingAttempt = require("../models/PhishingAttempt");

/*
 * Prototype weighting only: the current risk-score weighting and formula are
 * placeholders for prototyping. The final weighting and formula are a team
 * decision and have not yet been finalized.
 */
const calculateRiskAssessment = async (userId) => {
  const [trainingRecords, latestQuiz, phishingResult, latestPhishingAttempt] = await Promise.all([
      Training.find().select("_id").lean(),
      QuizResult.findOne({ userId })
        .select(
          "score percentage correctAnswers totalQuestions completedAt submittedAt"
        )
        .sort({ completedAt: -1, submittedAt: -1 })
        .lean(),
      PhishingAwarenessResult.findOne({ userId })
        .select("score correctAnswers totalScenarios completedAt")
        .lean(),
      PhishingAttempt.findOne({ userId })
        .select("clicked emailOpened reported sentAt")
        .sort({ sentAt: -1 })
        .lean(),
    ]);
  const availableTrainingIds = trainingRecords.map((training) => training._id);
  const completedTrainingIds = availableTrainingIds.length
    ? await TrainingProgress.distinct("trainingId", {
        userId,
        completed: true,
        trainingId: { $in: availableTrainingIds },
      })
    : [];
  const availableTrainings = availableTrainingIds.length;

  const components = [];

  if (availableTrainings > 0) {
    components.push({
      score: Math.min(
        Math.round((completedTrainingIds.length / availableTrainings) * 100),
        100
      ),
      weight: 0.4,
    });
  }

  if (latestQuiz) {
    const quizScore =
      typeof latestQuiz.percentage === "number"
        ? latestQuiz.percentage
        : latestQuiz.totalQuestions > 0
        ? Math.round(
            (latestQuiz.correctAnswers / latestQuiz.totalQuestions) * 100
          )
        : latestQuiz.score;

    if (typeof quizScore === "number" && Number.isFinite(quizScore)) {
      components.push({ score: Math.min(Math.max(quizScore, 0), 100), weight: 0.35 });
    }
  }

  const phishingScores = [];

  if (
    phishingResult &&
    typeof phishingResult.score === "number" &&
    Number.isFinite(phishingResult.score)
  ) {
    phishingScores.push(phishingResult.score);
  }

  if (latestPhishingAttempt) {
    // Placeholder weighting pending final team decision: reporting a suspicious
    // email is treated as the safest outcome (100), opening without reporting
    // or clicking is treated as a moderate outcome (60), and clicking is
    // treated as the highest-risk outcome (0).
    const phishingSignalScore = latestPhishingAttempt.reported
      ? 100
      : latestPhishingAttempt.clicked
      ? 0
      : latestPhishingAttempt.emailOpened
      ? 60
      : 100;

    phishingScores.push(phishingSignalScore);
  }

  if (phishingScores.length > 0) {
    components.push({
      score: Math.round(
        phishingScores.reduce((total, score) => total + score, 0) /
          phishingScores.length
      ),
      weight: 0.25,
    });
  }

  if (components.length === 0) {
    return null;
  }

  const totalWeight = components.reduce(
    (weight, component) => weight + component.weight,
    0
  );
  const securityAwarenessScore = Math.round(
    components.reduce(
      (score, component) => score + component.score * component.weight,
      0
    ) / totalWeight
  );
  const finalRiskScore = 100 - securityAwarenessScore;
  const riskLevel =
    finalRiskScore <= 30
      ? "Low"
      : finalRiskScore <= 60
      ? "Medium"
      : "High";

  return RiskAssessment.findOneAndUpdate(
    { userId },
    {
      $set: {
        userId,
        trainingScore:
          components.find((component) => component.weight === 0.4)?.score ?? null,
        quizScore:
          components.find((component) => component.weight === 0.35)?.score ?? null,
        phishingScore:
          components.find((component) => component.weight === 0.25)?.score ?? null,
        securityAwarenessScore,
        finalRiskScore,
        riskLevel,
        assessedAt: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  )
    .select(
      "userId trainingScore quizScore phishingScore securityAwarenessScore finalRiskScore riskLevel assessedAt"
    )
    .lean();
};

module.exports = { calculateRiskAssessment };
