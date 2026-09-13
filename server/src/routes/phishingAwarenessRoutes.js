const express = require("express");
const {
  submitAwarenessResult,
  getAwarenessResult,
} = require("../controllers/phishingAwarenessController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorize("employee", "admin"), submitAwarenessResult);
router.get("/", protect, authorize("employee", "admin"), getAwarenessResult);

module.exports = router;
