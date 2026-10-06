const express = require("express");
const {
	getRecommendations,
	updateRecommendationStatus,
} = require("../controllers/recommendationController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("employee", "admin"), getRecommendations);
router.patch(
	"/:id/status",
	protect,
	authorize("employee", "admin"),
	updateRecommendationStatus
);

module.exports = router;
