const express = require("express");
const { getEmployeeProgress } = require("../controllers/employeeProgressController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("employee", "admin"), getEmployeeProgress);

module.exports = router;