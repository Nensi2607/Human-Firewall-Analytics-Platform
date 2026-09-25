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
const AIPrediction = getModel("AIPrediction");

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


async function getOverview() {
  const totalEmployees = User
    ? await User.countDocuments({ role: "employee" })
    : 0;

  let highRisk = 0;
  let mediumRisk = 0;
  let lowRisk = 0;
  let averageRiskScore = null;

  if (RiskAssessment) {
    const riskData =
      await RiskAssessment.aggregate([
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
      ]);

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

async function getRiskDistribution() {
  if (!RiskAssessment) {
    return [];
  }

  return RiskAssessment.aggregate([
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
  ]);
}

async function getDepartmentRisk() {
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
  ]);
}

async function getEmployeeRisk() {
  if (!RiskAssessment) {
    return [];
  }

  return RiskAssessment.aggregate([
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
  ]);
}

async function getMLPredictions() {
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

  const [summary] = await AIPrediction.aggregate([
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
  ]);

  const latestPredictions = await AIPrediction.aggregate([
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
  ]);

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
  getMLPredictions,
};