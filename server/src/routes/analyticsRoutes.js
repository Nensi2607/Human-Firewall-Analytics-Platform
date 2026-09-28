const express = require("express");

const {
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
} = require("../controllers/analyticsController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/overview",
  protect,
  authorize("admin"),
  getOverview
);

router.get(
  "/risk-distribution",
  protect,
  authorize("admin"),
  getRiskDistribution
);

router.get(
  "/department-risk",
  protect,
  authorize("admin"),
  getDepartmentRisk
);

router.get(
  "/employee-risk",
  protect,
  authorize("admin"),
  getEmployeeRisk
);

router.get(
  "/employee-risk-breakdown",
  protect,
  authorize("admin"),
  getEmployeeRiskBreakdown
);

router.get(
  "/quiz-performance",
  protect,
  authorize("admin"),
  getQuizPerformance
);

router.get(
  "/phishing-performance",
  protect,
  authorize("admin"),
  getPhishingPerformance
);

router.get(
  "/training-performance",
  protect,
  authorize("admin"),
  getTrainingPerformance
);

router.get(
  "/department-comparison",
  protect,
  authorize("admin"),
  getDepartmentComparison
);

router.get(
  "/ml-predictions",
  protect,
  authorize("admin"),
  getMLPredictions
);

module.exports = router;