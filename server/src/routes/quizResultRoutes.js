const express = require("express");
const {
	getMyQuizResults,
	submitQuizResult,
} = require("../controllers/quizResultController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", protect, authorize("employee"), getMyQuizResults);

router.post(
	"/",
	protect,
	authorize("employee", "admin"),
	submitQuizResult
);

module.exports = router;
