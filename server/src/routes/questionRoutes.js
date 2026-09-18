const express = require("express");
const {
	getQuestionsByQuiz,
	createQuestion,
	updateQuestion,
	deleteQuestion,
} = require("../controllers/questionController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router
	.route("/quiz/:quizId")
	.get(protect, authorize("employee", "admin"), getQuestionsByQuiz)
	.post(protect, authorize("admin"), createQuestion);

router
	.route("/:id")
	.put(protect, authorize("admin"), updateQuestion)
	.delete(protect, authorize("admin"), deleteQuestion);

module.exports = router;
