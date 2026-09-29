const express = require("express");
const { getLeaderboard } = require("../controllers/leaderboardController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("employee", "admin"), getLeaderboard);

module.exports = router;