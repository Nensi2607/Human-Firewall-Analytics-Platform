const express = require("express");
const {
	getMyPhishingAttempts,
	reportMyPhishingAttempt,
	trackOpenPixel,
	trackPhishingAttempt,
} = require("../controllers/phishingAttemptController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/attempts/me", protect, authorize("employee"), getMyPhishingAttempts);
router.patch("/attempts/:attemptId/report", protect, authorize("employee"), reportMyPhishingAttempt);
router.get("/track/:token", trackPhishingAttempt);
router.get("/pixel/:token", trackOpenPixel);

module.exports = router;
