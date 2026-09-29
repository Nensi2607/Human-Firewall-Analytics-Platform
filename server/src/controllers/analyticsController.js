const analyticsService = require("../services/analyticsService");

async function getOverview(req, res) {
  try {
    const data =
      await analyticsService.getOverview(req.analyticsEmployeeIds);

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
      await analyticsService.getRiskDistribution(req.analyticsEmployeeIds);

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
      await analyticsService.getDepartmentRisk(req.analyticsEmployeeIds);

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
      await analyticsService.getEmployeeRisk(req.analyticsEmployeeIds);

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

async function getEmployeeRiskBreakdown(req, res) {
  try {
    const data = await analyticsService.getEmployeeRiskBreakdown(req.analyticsEmployeeIds);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Employee risk breakdown error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee risk breakdown",
    });
  }
}

async function getQuizPerformance(req, res) {
  try {
    const data = await analyticsService.getQuizPerformance(req.analyticsEmployeeIds);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Quiz performance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quiz performance",
    });
  }
}

async function getPhishingPerformance(req, res) {
  try {
    const data = await analyticsService.getPhishingPerformance(req.analyticsEmployeeIds);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Phishing performance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch phishing performance",
    });
  }
}

async function getTrainingPerformance(req, res) {
  try {
    const data = await analyticsService.getTrainingPerformance(req.analyticsEmployeeIds);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Training performance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch training performance",
    });
  }
}

async function getDepartmentComparison(req, res) {
  try {
    const data = await analyticsService.getDepartmentComparison(req.analyticsEmployeeIds);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Department comparison error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch department comparison",
    });
  }
}

async function getMLPredictions(req, res) {
  try {
    const data = await analyticsService.getMLPredictions(req.analyticsEmployeeIds);

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
  getEmployeeRiskBreakdown,
  getQuizPerformance,
  getPhishingPerformance,
  getTrainingPerformance,
  getDepartmentComparison,
  getMLPredictions,
};