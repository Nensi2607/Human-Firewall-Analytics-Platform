const express = require("express");
const {
	createCampaign,
	getCampaigns,
	launchCampaign,
	getCampaignStats,
} = require("../controllers/phishingCampaignController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/campaigns", protect, authorize("admin"), createCampaign);
router.get("/campaigns", protect, authorize("admin"), getCampaigns);
router.post("/campaigns/:id/launch", protect, authorize("admin"), launchCampaign);
router.get("/campaigns/:id/stats", protect, authorize("admin"), getCampaignStats);

module.exports = router;
