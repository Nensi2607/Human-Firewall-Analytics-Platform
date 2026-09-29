const express = require("express");
const { getTrainings, createTraining } = require("../controllers/trainingController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("employee", "admin"), getTrainings);
router.post("/", protect, authorize("admin"), createTraining);

module.exports = router;
