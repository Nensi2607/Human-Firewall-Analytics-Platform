const express = require("express");

const router = express.Router();

const {
  getAllQuizzes,
  getQuizById,
  createQuiz,
} = require("../controllers/quizController");

router.get("/", getAllQuizzes);

router.get("/:id", getQuizById);

router.post("/", createQuiz);

module.exports = router;