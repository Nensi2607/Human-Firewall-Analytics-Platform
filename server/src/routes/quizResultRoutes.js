const express = require("express");
const { submitQuizResult } = require("../controllers/quizResultController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
	"/",
	protect,
	authorize("employee", "admin"),
	submitQuizResult
);

module.exports = router;
