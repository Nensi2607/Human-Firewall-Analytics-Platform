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

module.exports = {
  getOverview,
  getRiskDistribution,
  getDepartmentRisk,
  getEmployeeRisk,
};