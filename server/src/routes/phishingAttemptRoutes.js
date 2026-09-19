const express = require("express");
const {
	getMyPhishingAttempts,
	trackPhishingAttempt,
} = require("../controllers/phishingAttemptController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/attempts/me", protect, authorize("employee"), getMyPhishingAttempts);
router.get("/track/:token", trackPhishingAttempt);

module.exports = router;
