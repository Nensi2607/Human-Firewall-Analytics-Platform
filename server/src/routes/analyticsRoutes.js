const express = require("express");

const {
  getOverview,
  getRiskDistribution,
  getDepartmentRisk,
  getEmployeeRisk,
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
  "/ml-predictions",
  protect,
  authorize("admin"),
  getMLPredictions
);

module.exports = router;