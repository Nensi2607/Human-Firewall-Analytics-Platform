const Question = require("../models/Question");
const asyncHandler = require("../utils/asyncHandler");

// GET all questions of a quiz
exports.getQuestionsByQuiz = asyncHandler(async (req, res) => {
  const questions = await Question.find({
    quizId: req.params.quizId,
  });

  res.status(200).json({
    success: true,
    count: questions.length,
    data: questions,
  });
});

// CREATE question
exports.createQuestion = asyncHandler(async (req, res) => {
  const question = await Question.create(req.body);

  res.status(201).json({
    success: true,
    data: question,
  });
});

// DELETE question
exports.deleteQuestion = asyncHandler(async (req, res) => {
  await Question.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Question deleted",
  });
});