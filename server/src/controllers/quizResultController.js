const QuizResult = require("../models/QuizResult");
const Question = require("../models/Question");
const mongoose = require("mongoose");

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
