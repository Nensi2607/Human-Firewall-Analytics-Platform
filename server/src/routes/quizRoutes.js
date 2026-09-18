const express = require("express");
const {
	getQuizzes,
	getQuiz,
	createQuiz,
	updateQuiz,
	deleteQuiz,
} = require("../controllers/quizController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router
	.route("/")
	.get(protect, authorize("employee", "admin"), getQuizzes)
	.post(protect, authorize("admin"), createQuiz);

router
	.route("/:id")
	.get(protect, authorize("employee", "admin"), getQuiz)
	.put(protect, authorize("admin"), updateQuiz)
	.delete(protect, authorize("admin"), deleteQuiz);

module.exports = router;
