const express = require("express");
const {
	getTrainingProgress,
	updateTrainingProgress,
} = require("../controllers/trainingProgressController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("employee", "admin"), getTrainingProgress);
router.post(
	"/:trainingId",
	protect,
	authorize("employee", "admin"),
	updateTrainingProgress
);

module.exports = router;
