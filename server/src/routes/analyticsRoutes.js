const express = require("express");

const {
  getOverview,
  getRiskDistribution,
  getDepartmentRisk,
  getEmployeeRisk,
} = require("../controllers/analyticsController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/overview",
  protect,
  getOverview
);

router.get(
  "/risk-distribution",
  protect,
  getRiskDistribution
);

router.get(
  "/department-risk",
  protect,
  getDepartmentRisk
);

router.get(
  "/employee-risk",
  protect,
  getEmployeeRisk
);

module.exports = router;