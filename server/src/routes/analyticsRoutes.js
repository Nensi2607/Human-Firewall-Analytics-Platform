const express = require("express");

const {
  getOverview,
  getRiskDistribution,
  getDepartmentRisk,
  getEmployeeRisk,
  getMLPredictions,
} = require("../controllers/analyticsController");

const { protect, authorize } = require("../middleware/authMiddleware");
const { analyticsFilterMiddleware } = require("../middleware/analyticsFilterMiddleware");

const router = express.Router();

router.use(protect, authorize("admin"), analyticsFilterMiddleware);

router.get(
  "/overview",
  getOverview
);

router.get(
  "/risk-distribution",
  getRiskDistribution
);

router.get(
  "/department-risk",
  getDepartmentRisk
);

router.get(
  "/employee-risk",
  getEmployeeRisk
);

router.get(
<<<<<<< Updated upstream
=======
  "/employee-risk-breakdown",
  getEmployeeRiskBreakdown
);

router.get(
  "/quiz-performance",
  getQuizPerformance
);

router.get(
  "/phishing-performance",
  getPhishingPerformance
);

router.get(
  "/training-performance",
  getTrainingPerformance
);

router.get(
  "/department-comparison",
  getDepartmentComparison
);

router.get(
>>>>>>> Stashed changes
  "/ml-predictions",
  getMLPredictions
);

module.exports = router;