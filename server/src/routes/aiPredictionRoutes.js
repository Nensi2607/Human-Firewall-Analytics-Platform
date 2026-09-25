const express = require("express");
const { predictAndSave } = require("../controllers/aiPredictionController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/predict", protect, authorize("employee", "admin"), predictAndSave);

module.exports = router;