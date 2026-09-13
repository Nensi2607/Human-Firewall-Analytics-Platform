const QuizResult = require("../models/QuizResult");
const mongoose = require("mongoose");

exports.submitQuizResult = async (req, res, next) => {
	try {
		const {
			quizId,
			score,
			totalQuestions,
			correctAnswers,
		} = req.body;

		if (
			!Number.isInteger(totalQuestions) ||
			totalQuestions <= 0 ||
			!Number.isInteger(correctAnswers) ||
			correctAnswers < 0 ||
			correctAnswers > totalQuestions ||
			!Number.isInteger(score) ||
			score !== correctAnswers
		) {
			return res.status(400).json({
				success: false,
				message: "Invalid quiz result.",
			});
		}

		const percentage = Math.round(
			(correctAnswers / totalQuestions) * 100
		);

		const result = await QuizResult.create({
			userId: req.user._id,
			quizId:
				quizId && mongoose.Types.ObjectId.isValid(quizId)
					? quizId
					: undefined,
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
