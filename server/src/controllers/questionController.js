const Question = require("../models/Question");
const Quiz = require("../models/Quiz");
const QuizResult = require("../models/QuizResult");
const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const { findAccessibleQuiz } = require("../services/quizAccessService");

const validateQuestionInput = (body, requireAllFields = false) => {
  const allowedFields = ["question", "options", "correctAnswer", "explanation"];

  if (!body || Object.keys(body).some((field) => !allowedFields.includes(field))) {
    return null;
  }

  const input = {};

  if (requireAllFields || body.question !== undefined) {
    if (typeof body.question !== "string" || !body.question.trim()) {
      return null;
    }
    input.question = body.question.trim();
  }

  if (requireAllFields || body.options !== undefined) {
    if (
      !Array.isArray(body.options) ||
      body.options.length < 2 ||
      body.options.some(
        (option) => typeof option !== "string" || !option.trim()
      )
    ) {
      return null;
    }
    input.options = body.options.map((option) => option.trim());
  }

  if (requireAllFields || body.correctAnswer !== undefined) {
    if (
      typeof body.correctAnswer !== "string" ||
      !body.correctAnswer.trim()
    ) {
      return null;
    }
    input.correctAnswer = body.correctAnswer.trim();
  }

  if (body.explanation !== undefined) {
    if (typeof body.explanation !== "string") {
      return null;
    }
    input.explanation = body.explanation.trim();
  }

  if (
    input.options &&
    input.correctAnswer &&
    !input.options.includes(input.correctAnswer)
  ) {
    return null;
  }

  return Object.keys(input).length > 0 ? input : null;
};

// GET all questions of a quiz
exports.getQuestionsByQuiz = asyncHandler(async (req, res) => {
  const quiz = await findAccessibleQuiz(req.params.quizId, req.user);

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "Quiz not found.",
    });
  }

  const query = Question.find({ quizId: quiz._id }).sort({ _id: 1 });

  if (req.user.role !== "admin") {
    query.select("-correctAnswer");
  }

  const questions = await query;

  res.status(200).json({
    success: true,
    count: questions.length,
    data: questions,
  });
});

// CREATE question
exports.createQuestion = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.quizId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid quiz ID",
    });
  }

  const quiz = await Quiz.findById(req.params.quizId).select("_id");
  const input = validateQuestionInput(req.body, true);

  if (!quiz || !input) {
    return res.status(400).json({
      success: false,
      message: !quiz ? "Quiz not found" : "Invalid question input",
    });
  }

  if (await QuizResult.exists({ quizId: quiz._id })) {
    return res.status(409).json({
      success: false,
      message: "Questions cannot be changed after employees have submitted this quiz.",
    });
  }

  const question = await Question.create({
    ...input,
    quizId: req.params.quizId,
  });

  res.status(201).json({
    success: true,
    data: question,
  });
});

// UPDATE question
exports.updateQuestion = asyncHandler(async (req, res) => {
  const input = validateQuestionInput(req.body);

  if (!input) {
    return res.status(400).json({
      success: false,
      message: "Invalid question input",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid question ID.",
    });
  }

  const existingQuestion = await Question.findById(req.params.id);

  if (!existingQuestion) {
    return res.status(404).json({
      success: false,
      message: "Question not found",
    });
  }

  if (await QuizResult.exists({ quizId: existingQuestion.quizId })) {
    return res.status(409).json({
      success: false,
      message: "Questions cannot be changed after employees have submitted this quiz.",
    });
  }

  const mergedInput = {
    question: input.question ?? existingQuestion.question,
    options: input.options ?? existingQuestion.options,
    correctAnswer: input.correctAnswer ?? existingQuestion.correctAnswer,
    explanation: input.explanation ?? existingQuestion.explanation,
  };
  const validatedInput = validateQuestionInput(mergedInput, true);

  if (!validatedInput) {
    return res.status(400).json({
      success: false,
      message: "Question options and correct answer must match.",
    });
  }

  const question = await Question.findByIdAndUpdate(
    req.params.id,
    validatedInput,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: question,
  });
});

// DELETE question
exports.deleteQuestion = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid question ID.",
    });
  }

  const existingQuestion = await Question.findById(req.params.id).select("quizId");
  if (!existingQuestion) {
    return res.status(404).json({
      success: false,
      message: "Question not found",
    });
  }

  if (await QuizResult.exists({ quizId: existingQuestion.quizId })) {
    return res.status(409).json({
      success: false,
      message: "Questions cannot be changed after employees have submitted this quiz.",
    });
  }

  const question = await Question.findByIdAndDelete(req.params.id);

  if (!question) {
    return res.status(404).json({
      success: false,
      message: "Question not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Question deleted",
  });
});