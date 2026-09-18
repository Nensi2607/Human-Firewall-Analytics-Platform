const express = require("express");
const { trackPhishingAttempt } = require("../controllers/phishingAttemptController");

const router = express.Router();

router.get("/track/:token", trackPhishingAttempt);

module.exports = router;
