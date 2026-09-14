const express = require("express");
const {
	getRiskAssessment,
	calculateCurrentRiskAssessment,
} = require("../controllers/riskAssessmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("employee", "admin"), getRiskAssessment);
router.post(
	"/calculate",
	protect,
	authorize("employee", "admin"),
	calculateCurrentRiskAssessment
);

module.exports = router;
