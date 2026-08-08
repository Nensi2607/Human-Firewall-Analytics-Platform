const express = require("express");

const router = express.Router();

const {
  getQuestionsByQuiz,
  createQuestion,
  deleteQuestion,
} = require("../controllers/questionController");

router.get("/:quizId", getQuestionsByQuiz);

router.post("/", createQuestion);

router.delete("/:id", deleteQuestion);

module.exports = router;