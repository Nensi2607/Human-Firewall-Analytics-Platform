const express = require("express");
const {
	getTrainings,
	getKnowledgeCheck,
	createTraining,
	updateTraining,
	deleteTraining,
} = require("../controllers/trainingController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("employee", "admin"), getTrainings);
router.get("/:trainingId/knowledge-check", protect, authorize("employee"), getKnowledgeCheck);
router.post("/", protect, authorize("admin"), createTraining);
router.put("/:id", protect, authorize("admin"), updateTraining);
router.delete("/:id", protect, authorize("admin"), deleteTraining);

module.exports = router;
