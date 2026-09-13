const express = require("express");
const { getTrainings } = require("../controllers/trainingController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("employee", "admin"), getTrainings);

module.exports = router;
