const express = require("express");

const {
  getOverview,
  getRiskDistribution,
  getDepartmentRisk,
  getEmployeeRisk,
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

module.exports = router;