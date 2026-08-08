const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/quizzes
exports.getAllQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find();

  res.status(200).json({
    success: true,
    count: quizzes.length,
    data: quizzes,
  });
});

// GET /api/quizzes/:id
exports.getQuizById = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "Quiz not found",
    });
  }

  const questions = await Question.find({
    quizId: req.params.id,
  });

  res.status(200).json({
    success: true,
    quiz,
    questions,
  });
});

// POST /api/quizzes
exports.createQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.create(req.body);

  res.status(201).json({
    success: true,
    message: "Quiz created successfully",
    data: quiz,
  });
});