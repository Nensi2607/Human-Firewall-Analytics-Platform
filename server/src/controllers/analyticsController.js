const analyticsService = require("../services/analyticsService");

async function getOverview(req, res) {
  try {
    const data =
      await analyticsService.getOverview();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Analytics overview error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch analytics overview",
    });
  }
}

async function getRiskDistribution(
  req,
  res
) {
  try {
    const data =
      await analyticsService.getRiskDistribution();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Risk distribution error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch risk distribution",
    });
  }
}

async function getDepartmentRisk(
  req,
  res
) {
  try {
    const data =
      await analyticsService.getDepartmentRisk();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Department risk error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch department risk",
    });
  }
}

async function getEmployeeRisk(
  req,
  res
) {
  try {
    const data =
      await analyticsService.getEmployeeRisk();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Employee risk error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch employee risk",
    });
  }
}

async function getMLPredictions(req, res) {
  try {
    const data = await analyticsService.getMLPredictions();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("ML prediction analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ML prediction analytics",
    });
  }
}

module.exports = {
  getOverview,
  getRiskDistribution,
  getDepartmentRisk,
  getEmployeeRisk,
  getMLPredictions,
};