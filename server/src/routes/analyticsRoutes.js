const express = require("express");

const {
  getOverview,
  getRiskDistribution,
  getDepartmentRisk,
  getEmployeeRisk,
} = require("../controllers/analyticsController");

const router = express.Router();

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

module.exports = router;