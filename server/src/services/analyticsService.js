const getModel = (name) => {
  try {
    return require(`../models/${name}`);
  } catch (error) {
    return null;
  }
};

const User = getModel("User");
const RiskAssessment =
  getModel("RiskAssessment");
const QuizResult = getModel("QuizResult");
const TrainingProgress = getModel("TrainingProgress");
const PhishingAttempt = getModel("PhishingAttempt");
const AIPrediction = getModel("AIPrediction");

const withEmployeeScope = (pipeline, employeeIds, field = "userId") =>
  Array.isArray(employeeIds)
    ? [{ $match: { [field]: { $in: employeeIds } } }, ...pipeline]
    : pipeline;

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

async function getMLServiceStatus() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);

  try {
    const response = await fetch(`${AI_SERVICE_URL}/health`, {
      signal: controller.signal,
    });
    const body = await response.json().catch(() => ({}));

    return {
      available: response.ok && body.model_available === true,
      modelVersion: body.model_version || null,
      message: response.ok ? null : "The ML service health check failed.",
    };
  } catch (error) {
    return {
      available: false,
      modelVersion: null,
      message: "The ML service is unavailable.",
    };
  } finally {
    clearTimeout(timeout);
  }
}


async function getOverview(employeeIds) {
  const employeeQuery = { role: "employee" };
  if (Array.isArray(employeeIds)) employeeQuery._id = { $in: employeeIds };
  const totalEmployees = User
    ? await User.countDocuments(employeeQuery)
    : 0;

  let highRisk = 0;
  let mediumRisk = 0;
  let lowRisk = 0;
  let averageRiskScore = null;

  if (RiskAssessment) {
    const riskData =
      await RiskAssessment.aggregate(withEmployeeScope([
        {
          $group: {
            _id: null,

            averageRiskScore: {
              $avg: "$finalRiskScore",
            },

            highRisk: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      {
                        $toLower:
                          "$riskLevel",
                      },
                      "high",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            mediumRisk: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      {
                        $toLower:
                          "$riskLevel",
                      },
                      "medium",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            lowRisk: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      {
                        $toLower:
                          "$riskLevel",
                      },
                      "low",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ], employeeIds));

    if (riskData.length > 0) {
      highRisk = riskData[0].highRisk || 0;

      mediumRisk =
        riskData[0].mediumRisk || 0;

      lowRisk =
        riskData[0].lowRisk || 0;

      averageRiskScore =
        typeof riskData[0].averageRiskScore === "number"
          ? Math.round(riskData[0].averageRiskScore)
          : null;
    }
  }

  return {
    totalEmployees,
    highRisk,
    mediumRisk,
    lowRisk,
    averageRiskScore,
    phishingFailureRate: null,
  };
}

async function getRiskDistribution(employeeIds) {
  if (!RiskAssessment) {
    return [];
  }

  return RiskAssessment.aggregate(withEmployeeScope([
    {
      $group: {
        _id: "$riskLevel",
        count: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        risk: "$_id",
        count: 1,
      },
    },
  ], employeeIds));
}

async function getDepartmentRisk(employeeIds) {
  if (!RiskAssessment) {
    return [];
  }

  return RiskAssessment.aggregate(withEmployeeScope([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $match: { "user.role": "employee" } },
    {
      $lookup: {
        from: "departments",
        localField: "user.departmentId",
        foreignField: "_id",
        as: "department",
      },
    },
    {
      $unwind: {
        path: "$department",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$department.departmentName",

        averageRisk: {
          $avg: "$finalRiskScore",
        },

        employeeCount: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,

        department: "$_id",

        averageRisk: {
          $round: [
            "$averageRisk",
            2,
          ],
        },

        employeeCount: 1,
      },
    },

    {
      $sort: {
        averageRisk: -1,
      },
    },
  ], employeeIds));
}

async function getEmployeeRisk(employeeIds) {
  if (!RiskAssessment) {
    return [];
  }

  return RiskAssessment.aggregate(withEmployeeScope([
    {
      $sort: {
        finalRiskScore: -1,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $match: { "user.role": "employee" } },
    {
      $lookup: {
        from: "departments",
        localField: "user.departmentId",
        foreignField: "_id",
        as: "department",
      },
    },
    {
      $unwind: {
        path: "$department",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $project: {
        _id: 0,
        employeeId: "$user._id",
        employeeName: {
          $trim: {
            input: {
              $concat: ["$user.firstName", " ", "$user.lastName"],
            },
          },
        },
        department: "$department.departmentName",
        finalRiskScore: 1,
        riskLevel: 1,
        lastAssessment: {
          $ifNull: ["$assessedAt", "$updatedAt"],
        },
      },
    },
  ], employeeIds));
}

async function getEmployeeRiskBreakdown() {
  if (!RiskAssessment) {
    return [];
  }

  return RiskAssessment.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $match: { "user.role": "employee" } },
    {
      $lookup: {
        from: "departments",
        localField: "user.departmentId",
        foreignField: "_id",
        as: "department",
      },
    },
    {
      $unwind: {
        path: "$department",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        employeeId: "$user._id",
        employeeName: {
          $concat: ["$user.firstName", " ", "$user.lastName"],
        },
        department: {
          $ifNull: ["$department.departmentName", "Unassigned"],
        },
        finalRiskScore: 1,
        riskLevel: 1,
        quizScore: { $ifNull: ["$quizScore", 0] },
        phishingScore: { $ifNull: ["$phishingScore", 0] },
        trainingScore: { $ifNull: ["$trainingScore", 0] },
        securityAwarenessScore: {
          $ifNull: ["$securityAwarenessScore", 0],
        },
        assessedAt: { $ifNull: ["$assessedAt", "$updatedAt"] },
      },
    },
    {
      $sort: {
        finalRiskScore: -1,
        employeeName: 1,
      },
    },
  ]);
}

async function getQuizPerformance(employeeIds) {
  if (!QuizResult) {
    return [];
  }

  return QuizResult.aggregate(withEmployeeScope([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $match: { "user.role": "employee" } },
    {
      $lookup: {
        from: "departments",
        localField: "user.departmentId",
        foreignField: "_id",
        as: "department",
      },
    },
    {
      $unwind: {
        path: "$department",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$userId",
        employeeId: { $first: "$user._id" },
        employeeName: {
          $first: {
            $concat: ["$user.firstName", " ", "$user.lastName"],
          },
        },
        department: {
          $first: { $ifNull: ["$department.departmentName", "Unassigned"] },
        },
        totalAttempts: { $sum: 1 },
        averagePercentage: {
          $avg: { $ifNull: ["$percentage", 0] },
        },
        averageScore: {
          $avg: { $ifNull: ["$score", 0] },
        },
        bestScore: { $max: { $ifNull: ["$score", 0] } },
        lastSubmitted: { $max: { $ifNull: ["$submittedAt", "$completedAt"] } },
      },
    },
    {
      $project: {
        _id: 0,
        employeeId: 1,
        employeeName: 1,
        department: 1,
        totalAttempts: 1,
        averagePercentage: { $round: ["$averagePercentage", 2] },
        averageScore: { $round: ["$averageScore", 2] },
        bestScore: 1,
        lastSubmitted: 1,
      },
    },
    {
      $sort: {
        averagePercentage: -1,
        bestScore: -1,
      },
    },
  ], employeeIds));
}

async function getPhishingPerformance(employeeIds) {
  if (!PhishingAttempt) {
    return [];
  }

  return PhishingAttempt.aggregate(withEmployeeScope([
    {
      $lookup: {
        from: "users",
        localField: "employeeId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "departments",
        localField: "user.departmentId",
        foreignField: "_id",
        as: "department",
      },
    },
    {
      $unwind: {
        path: "$department",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$employeeId",
        employeeId: { $first: "$employeeId" },
        employeeName: {
          $first: {
            $concat: [
              { $ifNull: ["$user.firstName", "Unknown"] },
              " ",
              { $ifNull: ["$user.lastName", "User"] },
            ],
          },
        },
        department: {
          $first: { $ifNull: ["$department.departmentName", "Unassigned"] },
        },
        totalAttempts: { $sum: 1 },
        clickedCount: {
          $sum: { $cond: [{ $eq: ["$clicked", true] }, 1, 0] },
        },
        reportedCount: {
          $sum: { $cond: [{ $eq: ["$reported", true] }, 1, 0] },
        },
        linkClickedCount: {
          $sum: { $cond: [{ $eq: ["$linkClicked", true] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        employeeId: 1,
        employeeName: 1,
        department: 1,
        totalAttempts: 1,
        clickedCount: 1,
        reportedCount: 1,
        linkClickedCount: 1,
        clickRate: {
          $round: [
            {
              $multiply: [
                { $divide: ["$clickedCount", { $max: ["$totalAttempts", 1] }] },
                100,
              ],
            },
            2,
          ],
        },
        reportedRate: {
          $round: [
            {
              $multiply: [
                { $divide: ["$reportedCount", { $max: ["$totalAttempts", 1] }] },
                100,
              ],
            },
            2,
          ],
        },
        linkClickRate: {
          $round: [
            {
              $multiply: [
                { $divide: ["$linkClickedCount", { $max: ["$totalAttempts", 1] }] },
                100,
              ],
            },
            2,
          ],
        },
      },
    },
    {
      $sort: {
        clickRate: 1,
        employeeName: 1,
      },
    },
  ], employeeIds, "employeeId"));
}

async function getTrainingPerformance(employeeIds) {
  if (!TrainingProgress) {
    return [];
  }

  return TrainingProgress.aggregate(withEmployeeScope([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $match: { "user.role": "employee" } },
    {
      $lookup: {
        from: "departments",
        localField: "user.departmentId",
        foreignField: "_id",
        as: "department",
      },
    },
    {
      $unwind: {
        path: "$department",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$userId",
        employeeId: { $first: "$user._id" },
        employeeName: {
          $first: {
            $concat: ["$user.firstName", " ", "$user.lastName"],
          },
        },
        department: {
          $first: { $ifNull: ["$department.departmentName", "Unassigned"] },
        },
        totalModules: { $sum: 1 },
        completedModules: {
          $sum: { $cond: [{ $eq: ["$completed", true] }, 1, 0] },
        },
        averageProgress: {
          $avg: { $ifNull: ["$progress", 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        employeeId: 1,
        employeeName: 1,
        department: 1,
        totalModules: 1,
        completedModules: 1,
        averageProgress: { $round: ["$averageProgress", 2] },
        completionRate: {
          $round: [
            {
              $multiply: [
                { $divide: ["$completedModules", { $max: ["$totalModules", 1] }] },
                100,
              ],
            },
            2,
          ],
        },
      },
    },
    {
      $sort: {
        completionRate: -1,
        averageProgress: -1,
      },
    },
  ], employeeIds));
}

async function getDepartmentComparison(employeeIds) {
  if (!RiskAssessment) {
    return [];
  }

  return RiskAssessment.aggregate(withEmployeeScope([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $match: { "user.role": "employee" } },
    {
      $lookup: {
        from: "departments",
        localField: "user.departmentId",
        foreignField: "_id",
        as: "department",
      },
    },
    {
      $unwind: {
        path: "$department",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: { $ifNull: ["$department.departmentName", "Unassigned"] },
        employeeCount: { $sum: 1 },
        averageRiskScore: {
          $avg: "$finalRiskScore",
        },
        averageQuizScore: {
          $avg: "$quizScore",
        },
        averagePhishingScore: {
          $avg: "$phishingScore",
        },
        averageTrainingScore: {
          $avg: "$trainingScore",
        },
        averageAwarenessScore: {
          $avg: "$securityAwarenessScore",
        },
        highRisk: {
          $sum: { $cond: [{ $eq: [{ $toLower: "$riskLevel" }, "high"] }, 1, 0] },
        },
        mediumRisk: {
          $sum: { $cond: [{ $eq: [{ $toLower: "$riskLevel" }, "medium"] }, 1, 0] },
        },
        lowRisk: {
          $sum: { $cond: [{ $eq: [{ $toLower: "$riskLevel" }, "low"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        department: "$_id",
        employeeCount: 1,
        averageRiskScore: { $round: ["$averageRiskScore", 2] },
        averageQuizScore: { $round: ["$averageQuizScore", 2] },
        averagePhishingScore: { $round: ["$averagePhishingScore", 2] },
        averageTrainingScore: { $round: ["$averageTrainingScore", 2] },
        averageAwarenessScore: { $round: ["$averageAwarenessScore", 2] },
        highRisk: 1,
        mediumRisk: 1,
        lowRisk: 1,
      },
    },
    {
      $sort: {
        averageRiskScore: -1,
        employeeCount: -1,
      },
    },
  ], employeeIds));
}

async function getEmployeeRiskBreakdown(employeeIds) {
  if (!RiskAssessment) {
    return [];
  }

  return RiskAssessment.aggregate(withEmployeeScope([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $match: { "user.role": "employee" } },
    {
      $lookup: {
        from: "departments",
        localField: "user.departmentId",
        foreignField: "_id",
        as: "department",
      },
    },
    {
      $unwind: {
        path: "$department",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        employeeId: "$user._id",
        employeeName: {
          $concat: ["$user.firstName", " ", "$user.lastName"],
        },
        department: {
          $ifNull: ["$department.departmentName", "Unassigned"],
        },
        finalRiskScore: 1,
        riskLevel: 1,
        quizScore: { $ifNull: ["$quizScore", 0] },
        phishingScore: { $ifNull: ["$phishingScore", 0] },
        trainingScore: { $ifNull: ["$trainingScore", 0] },
        securityAwarenessScore: {
          $ifNull: ["$securityAwarenessScore", 0],
        },
        assessedAt: { $ifNull: ["$assessedAt", "$updatedAt"] },
      },
    },
    {
      $sort: {
        finalRiskScore: -1,
        employeeName: 1,
      },
    },
  ], employeeIds));
}

async function getQuizPerformance(employeeIds) {
  if (!QuizResult) {
    return [];
  }

  return QuizResult.aggregate(withEmployeeScope([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $match: { "user.role": "employee" } },
    {
      $lookup: {
        from: "departments",
        localField: "user.departmentId",
        foreignField: "_id",
        as: "department",
      },
    },
    {
      $unwind: {
        path: "$department",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $set: {
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
        employeeId: { $first: "$user._id" },
        employeeName: {
          $first: {
            $concat: ["$user.firstName", " ", "$user.lastName"],
          },
        },
        department: {
          $first: { $ifNull: ["$department.departmentName", "Unassigned"] },
        },
        totalAttempts: { $sum: 1 },
        averagePercentage: {
          $avg: "$quizPercentage",
        },
        averageScore: {
          $avg: { $ifNull: ["$score", 0] },
        },
        bestScore: { $max: { $ifNull: ["$score", 0] } },
        lastSubmitted: { $max: { $ifNull: ["$submittedAt", "$completedAt"] } },
      },
    },
    {
      $project: {
        _id: 0,
        employeeId: 1,
        employeeName: 1,
        department: 1,
        totalAttempts: 1,
        averagePercentage: { $round: ["$averagePercentage", 2] },
        averageScore: { $round: ["$averageScore", 2] },
        bestScore: 1,
        lastSubmitted: 1,
      },
    },
    {
      $sort: {
        averagePercentage: -1,
        bestScore: -1,
      },
    },
  ], employeeIds));
}

async function getPhishingPerformance(employeeIds) {
  if (!PhishingAttempt) {
    return [];
  }

  return PhishingAttempt.aggregate(withEmployeeScope([
    {
      $lookup: {
        from: "users",
        localField: "employeeId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "departments",
        localField: "user.departmentId",
        foreignField: "_id",
        as: "department",
      },
    },
    {
      $unwind: {
        path: "$department",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$employeeId",
        employeeId: { $first: "$employeeId" },
        employeeName: {
          $first: {
            $concat: [
              { $ifNull: ["$user.firstName", "Unknown"] },
              " ",
              { $ifNull: ["$user.lastName", "User"] },
            ],
          },
        },
        department: {
          $first: { $ifNull: ["$department.departmentName", "Unassigned"] },
        },
        totalAttempts: { $sum: 1 },
        clickedCount: {
          $sum: { $cond: [{ $eq: ["$clicked", true] }, 1, 0] },
        },
        reportedCount: {
          $sum: { $cond: [{ $eq: ["$reported", true] }, 1, 0] },
        },
        linkClickedCount: {
          $sum: { $cond: [{ $eq: ["$linkClicked", true] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        employeeId: 1,
        employeeName: 1,
        department: 1,
        totalAttempts: 1,
        clickedCount: 1,
        reportedCount: 1,
        linkClickedCount: 1,
        clickRate: {
          $round: [
            {
              $multiply: [
                { $divide: ["$clickedCount", { $max: ["$totalAttempts", 1] }] },
                100,
              ],
            },
            2,
          ],
        },
        reportedRate: {
          $round: [
            {
              $multiply: [
                { $divide: ["$reportedCount", { $max: ["$totalAttempts", 1] }] },
                100,
              ],
            },
            2,
          ],
        },
        linkClickRate: {
          $round: [
            {
              $multiply: [
                { $divide: ["$linkClickedCount", { $max: ["$totalAttempts", 1] }] },
                100,
              ],
            },
            2,
          ],
        },
      },
    },
    {
      $sort: {
        clickRate: 1,
        employeeName: 1,
      },
    },
  ], employeeIds, "employeeId"));
}

async function getTrainingPerformance(employeeIds) {
  if (!TrainingProgress) {
    return [];
  }

  return TrainingProgress.aggregate(withEmployeeScope([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $match: { "user.role": "employee" } },
    {
      $lookup: {
        from: "departments",
        localField: "user.departmentId",
        foreignField: "_id",
        as: "department",
      },
    },
    {
      $unwind: {
        path: "$department",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$userId",
        employeeId: { $first: "$user._id" },
        employeeName: {
          $first: {
            $concat: ["$user.firstName", " ", "$user.lastName"],
          },
        },
        department: {
          $first: { $ifNull: ["$department.departmentName", "Unassigned"] },
        },
        totalModules: { $sum: 1 },
        completedModules: {
          $sum: { $cond: [{ $eq: ["$completed", true] }, 1, 0] },
        },
        averageProgress: {
          $avg: { $ifNull: ["$progress", 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        employeeId: 1,
        employeeName: 1,
        department: 1,
        totalModules: 1,
        completedModules: 1,
        averageProgress: { $round: ["$averageProgress", 2] },
        completionRate: {
          $round: [
            {
              $multiply: [
                { $divide: ["$completedModules", { $max: ["$totalModules", 1] }] },
                100,
              ],
            },
            2,
          ],
        },
      },
    },
    {
      $sort: {
        completionRate: -1,
        averageProgress: -1,
      },
    },
  ], employeeIds));
}

async function getDepartmentComparison(employeeIds) {
  if (!RiskAssessment) {
    return [];
  }

  return RiskAssessment.aggregate(withEmployeeScope([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $match: { "user.role": "employee" } },
    {
      $lookup: {
        from: "departments",
        localField: "user.departmentId",
        foreignField: "_id",
        as: "department",
      },
    },
    {
      $unwind: {
        path: "$department",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: { $ifNull: ["$department.departmentName", "Unassigned"] },
        employeeCount: { $sum: 1 },
        averageRiskScore: {
          $avg: "$finalRiskScore",
        },
        averageQuizScore: {
          $avg: "$quizScore",
        },
        averagePhishingScore: {
          $avg: "$phishingScore",
        },
        averageTrainingScore: {
          $avg: "$trainingScore",
        },
        averageAwarenessScore: {
          $avg: "$securityAwarenessScore",
        },
        highRisk: {
          $sum: { $cond: [{ $eq: [{ $toLower: "$riskLevel" }, "high"] }, 1, 0] },
        },
        mediumRisk: {
          $sum: { $cond: [{ $eq: [{ $toLower: "$riskLevel" }, "medium"] }, 1, 0] },
        },
        lowRisk: {
          $sum: { $cond: [{ $eq: [{ $toLower: "$riskLevel" }, "low"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        department: "$_id",
        employeeCount: 1,
        averageRiskScore: { $round: ["$averageRiskScore", 2] },
        averageQuizScore: { $round: ["$averageQuizScore", 2] },
        averagePhishingScore: { $round: ["$averagePhishingScore", 2] },
        averageTrainingScore: { $round: ["$averageTrainingScore", 2] },
        averageAwarenessScore: { $round: ["$averageAwarenessScore", 2] },
        highRisk: 1,
        mediumRisk: 1,
        lowRisk: 1,
      },
    },
    {
      $sort: {
        averageRiskScore: -1,
        employeeCount: -1,
      },
    },
  ], employeeIds));
}

async function getMLPredictions(employeeIds) {
  const modelStatus = await getMLServiceStatus();

  if (!AIPrediction) {
    return {
      modelStatus,
      totalPredictions: 0,
      lowPredictions: 0,
      mediumPredictions: 0,
      highPredictions: 0,
      averageConfidence: null,
      latestPredictions: [],
    };
  }

  const [summary] = await AIPrediction.aggregate(withEmployeeScope([
    {
      $group: {
        _id: null,
        totalPredictions: { $sum: 1 },
        lowPredictions: {
          $sum: { $cond: [{ $eq: ["$predictedRisk", "Low"] }, 1, 0] },
        },
        mediumPredictions: {
          $sum: { $cond: [{ $eq: ["$predictedRisk", "Medium"] }, 1, 0] },
        },
        highPredictions: {
          $sum: { $cond: [{ $eq: ["$predictedRisk", "High"] }, 1, 0] },
        },
        averageConfidence: { $avg: "$confidence" },
      },
    },
  ], employeeIds));

  const latestPredictions = await AIPrediction.aggregate(withEmployeeScope([
    { $sort: { generatedAt: -1, _id: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        userId: 1,
        employeeName: {
          $trim: {
            input: { $concat: [{ $ifNull: ["$user.firstName", ""] }, " ", { $ifNull: ["$user.lastName", ""] }] },
          },
        },
        predictedRisk: 1,
        confidence: 1,
        modelVersion: 1,
        generatedAt: 1,
      },
    },
  ], employeeIds));

  return {
    modelStatus,
    totalPredictions: summary?.totalPredictions || 0,
    lowPredictions: summary?.lowPredictions || 0,
    mediumPredictions: summary?.mediumPredictions || 0,
    highPredictions: summary?.highPredictions || 0,
    averageConfidence:
      typeof summary?.averageConfidence === "number"
        ? summary.averageConfidence
        : null,
    latestPredictions,
  };
}

module.exports = {
  getOverview,
  getRiskDistribution,
  getDepartmentRisk,
  getEmployeeRisk,
  getEmployeeRiskBreakdown,
  getQuizPerformance,
  getPhishingPerformance,
  getTrainingPerformance,
  getDepartmentComparison,
  getMLPredictions,
};