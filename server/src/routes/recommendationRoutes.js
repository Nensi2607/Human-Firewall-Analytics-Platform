const express = require("express");
const {
	getMyRecommendations,
	getAdminRecommendations,
	dismissAdminRecommendation,
	getRecommendations,
	updateRecommendationStatus,
} = require("../controllers/recommendationController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", protect, authorize("employee"), getMyRecommendations);
router.get("/admin", protect, authorize("admin"), getAdminRecommendations);
router.patch("/admin/:id/dismiss", protect, authorize("admin"), dismissAdminRecommendation);
router.get("/", protect, authorize("employee", "admin"), getRecommendations);
router.patch(
	"/:id/status",
	protect,
	authorize("employee", "admin"),
	updateRecommendationStatus
);

module.exports = router;
