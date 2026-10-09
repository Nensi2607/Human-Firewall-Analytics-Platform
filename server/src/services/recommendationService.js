const User = require("../models/User");
const Department = require("../models/Department");
const Quiz = require("../models/Quiz");
const QuizResult = require("../models/QuizResult");
const Training = require("../models/Training");
const TrainingProgress = require("../models/TrainingProgress");
const PhishingAttempt = require("../models/PhishingAttempt");
const RiskAssessment = require("../models/RiskAssessment");
const AIPrediction = require("../models/AIPrediction");
const Recommendation = require("../models/Recommendation");
const analyticsService = require("./analyticsService");
const config = require("../config/recommendationConfig");
const { buildEmployeeRecommendations, buildAdminRecommendations } = require("./recommendationRules");

const ACTIVE_STATUSES = ["pending", "in-progress"];
const PRIORITY_ORDER = {
  overdue: 0,
  high: 1,
  "due-soon": 2,
  medium: 3,
  remaining: 4,
  low: 5,
  positive: 6,
};

const cleanUpdate = (recommendation, status) => Object.fromEntries(
  Object.entries({ ...recommendation, status, resolvedAt: null }).filter(([, value]) => value !== undefined)
);

const escalatePriority = (priority, createdAt, now) => {
  const ageDays = Math.floor((now - new Date(createdAt)) / (24 * 60 * 60 * 1000));
  if (ageDays < config.RECOMMENDATION_ESCALATION_DAYS) return priority;
  if (priority === "low") return "medium";
  if (priority === "medium") return "high";
  return priority;
};

async function synchronizeRecommendations(recommendations, audience, userId = null) {
  const now = new Date();
  const scope = { audience, ...(userId ? { userId } : {}) };
  const activeKeys = recommendations.map((item) => item.recommendationKey);

  for (const item of recommendations) {
    let existing = await Recommendation.findOne({ recommendationKey: item.recommendationKey }).lean();
    if (["dismissed", "completed"].includes(existing?.status)) continue;

    const isReactivated = existing?.status === "resolved";
    const unresolvedSince = isReactivated
      ? now
      : existing?.unresolvedSince || existing?.createdAt || now;
    const recommendation = {
      ...item,
      ...(audience === "admin" && existing
        ? { priority: escalatePriority(item.priority, unresolvedSince, now) }
        : {}),
    };
    const status = isReactivated ? "pending" : existing?.status || "pending";
    const update = {
      $set: {
        ...cleanUpdate(recommendation, status),
        unresolvedSince,
      },
    };
    try {
      await Recommendation.findOneAndUpdate(
        { recommendationKey: recommendation.recommendationKey },
        update,
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      );
    } catch (error) {
      if (error.code !== 11000) throw error;
      existing = await Recommendation.findOne({ recommendationKey: recommendation.recommendationKey }).lean();
      if (!existing || ["dismissed", "completed"].includes(existing.status)) continue;
      await Recommendation.findOneAndUpdate(
        { recommendationKey: recommendation.recommendationKey },
        {
          $set: {
            ...cleanUpdate(recommendation, existing.status),
            unresolvedSince: existing.unresolvedSince || existing.createdAt || now,
          },
        },
        { new: true, runValidators: true }
      );
    }
  }

  await Recommendation.updateMany(
    { ...scope, status: { $in: ACTIVE_STATUSES }, recommendationKey: { $nin: activeKeys } },
    { $set: { status: "resolved", resolvedAt: now, unresolvedSince: null } }
  );

  return Recommendation.find({ ...scope, status: { $in: ACTIVE_STATUSES } })
    .populate("userId", "firstName lastName email")
    .populate("departmentId", "departmentName")
    .lean()
    .then((records) => records.sort((left, right) =>
      (PRIORITY_ORDER[left.priority] ?? 99) - (PRIORITY_ORDER[right.priority] ?? 99) ||
      new Date(left.dueDate || left.createdAt) - new Date(right.dueDate || right.createdAt)
    ));
}

async function getEmployeeRecommendations(employee) {
  const employeeId = employee._id;
  const quizAssignmentFilters = [
    { targetAll: true },
    { targetUsers: employeeId },
  ];
  if (employee.departmentId) quizAssignmentFilters.push({ targetDepartments: employee.departmentId });

  const [quizzes, quizResults, trainings, trainingProgress, phishingAttempts] = await Promise.all([
    Quiz.find({ $or: quizAssignmentFilters }).lean(),
    QuizResult.find({ userId: employeeId }).select("quizId percentage correctAnswers totalQuestions").lean(),
    Training.find({}).select("title createdAt lessons knowledgeCheck.questions.question").lean(),
    TrainingProgress.find({ userId: employeeId }).select("trainingId progress completed").lean(),
    PhishingAttempt.find({ $or: [{ userId: employeeId }, { employeeId }] })
      .sort({ sentAt: -1, createdAt: -1 })
      .limit(1)
      .lean(),
  ]);

  const recommendations = buildEmployeeRecommendations({
    employee,
    quizzes,
    quizResults,
    trainings,
    trainingProgress,
    latestPhishingAttempt: phishingAttempts[0] || null,
  });
  return synchronizeRecommendations(recommendations, "employee", employeeId);
}

async function getAdminRecommendations() {
  const employees = await User.find({ role: "employee" })
    .populate("departmentId", "departmentName")
    .lean();
  const employeeIds = employees.map((employee) => employee._id);
  const employeeFilter = employeeIds.length ? { $in: employeeIds } : { $in: [] };

  const [departments, riskAssessments, quizzes, quizResults, trainings, trainingProgress, phishingAttempts, modelStatus] = await Promise.all([
    Department.find({}).lean(),
    RiskAssessment.find({ userId: employeeFilter }).lean(),
    Quiz.find({}).select("title category").lean(),
    QuizResult.find({ userId: employeeFilter }).populate("quizId", "title category").lean(),
    Training.find({}).select("title createdAt lessons knowledgeCheck.questions.question").lean(),
    TrainingProgress.find({ userId: employeeFilter }).lean(),
    employeeIds.length
      ? PhishingAttempt.find({ $or: [{ userId: employeeFilter }, { employeeId: employeeFilter }] }).lean()
      : [],
    analyticsService.getMLPredictions().catch(() => null),
  ]);

  const modelAvailable = modelStatus?.modelStatus?.available === true;
  const predictions = new Map();
  if (modelAvailable && employeeIds.length) {
    const storedPredictions = await AIPrediction.find({ userId: employeeFilter })
      .sort({ generatedAt: -1, _id: -1 })
      .lean();
    storedPredictions.forEach((prediction) => {
      const userId = String(prediction.userId);
      if (!predictions.has(userId)) predictions.set(userId, prediction);
    });
  }

  const recommendations = buildAdminRecommendations({
    employees,
    departments,
    riskAssessments,
    quizzes,
    quizResults,
    trainings,
    trainingProgress,
    phishingAttempts,
    predictions,
    modelAvailable,
  });
  return synchronizeRecommendations(recommendations, "admin");
}

module.exports = { getEmployeeRecommendations, getAdminRecommendations, synchronizeRecommendations };