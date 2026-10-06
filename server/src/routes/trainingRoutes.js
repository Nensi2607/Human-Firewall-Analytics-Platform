const express = require("express");
const {
	getTrainings,
	createTraining,
	updateTraining,
	deleteTraining,
} = require("../controllers/trainingController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("employee", "admin"), getTrainings);
router.post("/", protect, authorize("admin"), createTraining);
router.put("/:id", protect, authorize("admin"), updateTraining);
router.delete("/:id", protect, authorize("admin"), deleteTraining);

module.exports = router;
