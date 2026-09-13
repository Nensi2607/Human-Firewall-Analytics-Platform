const User = require("../models/User");
const Department = require("../models/Department");
const QuizResult = require("../models/QuizResult");
const Training = require("../models/Training");
const TrainingProgress = require("../models/TrainingProgress");
const PhishingAwarenessResult = require("../models/PhishingAwarenessResult");
const RiskAssessment = require("../models/RiskAssessment");
const { calculateRiskAssessment } = require("../services/riskAssessmentService");

// ==========================================
// Admin Dashboard
// ==========================================
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const totalEmployees = await User.countDocuments({
      role: "employee",
    });

    const totalAdmins = await User.countDocuments({
      role: "admin",
    });

    const totalDepartments = await Department.countDocuments();

    const activeEmployees = await User.countDocuments({
      role: "employee",
      status: "active",
    });

    const inactiveEmployees = await User.countDocuments({
      role: "employee",
      status: "inactive",
    });
    const riskData = await RiskAssessment.aggregate([
      {
        $group: {
          _id: null,
          averageRiskScore: { $avg: "$finalRiskScore" },
        },
      },
    ]);
    const averageRiskScore =
      riskData.length &&
      typeof riskData[0].averageRiskScore === "number"
        ? Math.round(riskData[0].averageRiskScore)
        : null;

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        totalAdmins,
        totalDepartments,
        activeEmployees,
        inactiveEmployees,
        averageRiskScore,
        completedTrainings: 0,
        pendingTrainings: 0,
      },
    });

  } catch (err) {
    next(err);
  }
};

// ==========================================
// Employee Dashboard
// ==========================================
exports.getEmployeeDashboard = async (req, res, next) => {
  try {

    const user = await User.findById(req.user._id)
      .populate("departmentId", "departmentName");
    const quizzesCompleted = await QuizResult.countDocuments({
      userId: req.user._id,
    });
    const latestQuizResult = await QuizResult.findOne({
      userId: req.user._id,
    })
      .select("percentage correctAnswers totalQuestions submittedAt quizId")
      .sort({ submittedAt: -1, completedAt: -1 })
      .lean();
    const trainings = await Training.find().select("_id");
    const trainingIds = trainings.map((training) => training._id);
    const completedTrainingIds = trainingIds.length
      ? await TrainingProgress.distinct("trainingId", {
          userId: req.user._id,
          completed: true,
          trainingId: { $in: trainingIds },
        })
      : [];
    const completedTrainings = completedTrainingIds.length;
    const pendingTrainings = Math.max(
      trainingIds.length - completedTrainings,
      0
    );
    const phishingAwareness = await PhishingAwarenessResult.findOne({
      userId: req.user._id,
    }).select("totalScenarios correctAnswers score completedAt");
    const riskAssessment = await calculateRiskAssessment(req.user._id);
    const [trainingProgress, quizResults] = await Promise.all([
      TrainingProgress.find({
        userId: req.user._id,
        completed: true,
      })
        .select("trainingId completedAt")
        .populate("trainingId", "title")
        .sort({ completedAt: -1 })
        .limit(5)
        .lean(),
      QuizResult.find({ userId: req.user._id })
        .select(
          "score totalQuestions correctAnswers percentage submittedAt completedAt"
        )
        .sort({ completedAt: -1, submittedAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const trainingActivities = trainingProgress
      .filter((progress) => progress.completedAt && progress.trainingId)
      .map((progress) => ({
        type: "training",
        title: `Completed ${progress.trainingId.title} training`,
        status: "Completed",
        completedAt: progress.completedAt,
      }));

    const quizActivities = quizResults
      .map((result) => ({
        type: "quiz",
        title: "Completed security quiz",
        score: result.percentage ?? result.score,
        detail: `${result.correctAnswers} / ${result.totalQuestions} correct`,
        completedAt: result.completedAt || result.submittedAt,
      }))
      .filter((activity) => activity.completedAt);

    const phishingActivities = phishingAwareness?.completedAt
      ? [
          {
            type: "phishing",
            title: "Completed Phishing Awareness challenge",
            score: phishingAwareness.score,
            detail: `${phishingAwareness.correctAnswers} / ${phishingAwareness.totalScenarios} correct`,
            completedAt: phishingAwareness.completedAt,
          },
        ]
      : [];

    const recentActivities = [
      ...trainingActivities,
      ...quizActivities,
      ...phishingActivities,
    ]
      .sort(
        (firstActivity, secondActivity) =>
          new Date(secondActivity.completedAt) -
          new Date(firstActivity.completedAt)
      )
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        employee: user,
        completedTrainings,
        pendingTrainings,
        quizzesCompleted,
        latestQuizResult,
        riskScore: riskAssessment?.finalRiskScore ?? null,
        securityAwarenessScore:
          riskAssessment?.securityAwarenessScore ?? null,
        finalRiskScore: riskAssessment?.finalRiskScore ?? null,
        riskLevel: riskAssessment?.riskLevel ?? null,
        riskAssessment,
        phishingAwareness,
        recentActivities,
      },
    });

  } catch (err) {
    next(err);
  }
};