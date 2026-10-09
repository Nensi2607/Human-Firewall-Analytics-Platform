const express = require("express");
const {
	getTrainingProgress,
	updateTrainingProgress,
	openLesson,
	completeLesson,
	submitKnowledgeCheck,
} = require("../controllers/trainingProgressController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("employee", "admin"), getTrainingProgress);
router.post("/:trainingId/lessons/:lessonIndex/open", protect, authorize("employee"), openLesson);
router.post("/:trainingId/lessons/:lessonIndex/complete", protect, authorize("employee"), completeLesson);
router.post("/:trainingId/knowledge-check", protect, authorize("employee"), submitKnowledgeCheck);
router.post(
	"/:trainingId",
	protect,
	authorize("employee"),
	updateTrainingProgress
);

module.exports = router;
