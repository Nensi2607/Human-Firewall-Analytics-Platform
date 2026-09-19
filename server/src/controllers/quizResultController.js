const QuizResult = require("../models/QuizResult");
const Question = require("../models/Question");
const mongoose = require("mongoose");

exports.getMyQuizResults = async (req, res, next) => {
	try {
		const results = await QuizResult.find({ userId: req.user._id })
			.select("quizId score totalQuestions correctAnswers percentage submittedAt completedAt")
			.populate("quizId", "title category difficulty")
			.sort({ submittedAt: -1 })
			.lean();

		res.status(200).json({
			success: true,
			count: results.length,
			data: results,
		});
	} catch (err) {
		next(err);
	}
};

exports.submitQuizResult = async (req, res, next) => {
	try {
		const { quizId, answers } = req.body;

		if (
			!quizId ||
			!mongoose.Types.ObjectId.isValid(quizId) ||
			!Array.isArray(answers)
		) {
			return res.status(400).json({
				success: false,
				message: "A valid quiz ID and answers array are required.",
			});
		}

		const questions = await Question.find({ quizId })
			.select("correctAnswer")
			.sort({ _id: 1 })
			.lean();

		if (questions.length === 0 || answers.length !== questions.length) {
			return res.status(400).json({
				success: false,
				message: "The submitted answers do not match the quiz questions.",
			});
		}

		const score = questions.reduce(
			(total, question, index) =>
				total + (answers[index] === question.correctAnswer ? 1 : 0),
			0
		);
		const totalQuestions = questions.length;
		const correctAnswers = score;
		const percentage = Math.round(
			(correctAnswers / totalQuestions) * 100
		);

		const result = await QuizResult.create({
			userId: req.user._id,
			quizId,
			score,
			totalQuestions,
			correctAnswers,
			percentage,
		});

		res.status(201).json({
			success: true,
			data: result,
		});
	} catch (err) {
		next(err);
	}
};
