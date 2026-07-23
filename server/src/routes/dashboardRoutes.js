const express = require("express");

const {
  getAdminDashboard,
  getEmployeeDashboard,
} = require("../controllers/dashboardController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/admin",
  protect,
  authorize("admin"),
  getAdminDashboard
);

router.get(
  "/employee",
  protect,
  authorize("employee", "admin"),
  getEmployeeDashboard
);

module.exports = router;