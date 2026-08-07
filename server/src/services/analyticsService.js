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

const PhishingAttempt =
  getModel("PhishingAttempt");

async function getOverview() {
  const totalEmployees = User
    ? await User.countDocuments()
    : 0;

  let highRisk = 0;
  let mediumRisk = 0;
  let lowRisk = 0;
  let averageRiskScore = 0;

  if (RiskAssessment) {
    const riskData =
      await RiskAssessment.aggregate([
        {
          $group: {
            _id: null,

            averageRiskScore: {
              $avg: "$riskScore",
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

      averageRiskScore = Math.round(
        riskData[0].averageRiskScore || 0
      );
    }
  }

  let phishingFailureRate = 0;

  if (PhishingAttempt) {
    const phishingData =
      await PhishingAttempt.aggregate([
        {
          $group: {
            _id: null,

            total: {
              $sum: 1,
            },

            failed: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      {
                        $eq: [
                          "$status",
                          "failed",
                        ],
                      },
                      {
                        $eq: [
                          "$result",
                          "failed",
                        ],
                      },
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

    if (phishingData.length > 0) {
      const total =
        phishingData[0].total || 0;

      const failed =
        phishingData[0].failed || 0;

      phishingFailureRate =
        total > 0
          ? Math.round(
              (failed / total) * 100
            )
          : 0;
    }
  }

  return {
    totalEmployees,
    highRisk,
    mediumRisk,
    lowRisk,
    averageRiskScore,
    phishingFailureRate,
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
      $group: {
        _id: "$department",

        averageRisk: {
          $avg: "$riskScore",
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
        riskScore: -1,
      },
    },

    {
      $project: {
        _id: 1,

        name: 1,

        employeeName: 1,

        employeeId: 1,

        department: 1,

        riskScore: 1,

        riskLevel: 1,

        lastAssessment: {
          $ifNull: [
            "$updatedAt",
            "$createdAt",
          ],
        },
      },
    },
  ]);
}

module.exports = {
  getOverview,
  getRiskDistribution,
  getDepartmentRisk,
  getEmployeeRisk,
};