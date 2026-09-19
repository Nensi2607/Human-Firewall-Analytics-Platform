const Quiz = require("../models/Quiz");
const User = require("../models/User");
const Department = require("../models/Department");
const mongoose = require("mongoose");
const allowedFields = [
	"title",
	"description",
	"category",
	"difficulty",
	"duration",
	"targetUsers",
	"targetDepartments",
	"targetAll",
];

const validateQuizInput = (body, requireTitle = false) => {
	if (!body || Object.keys(body).some((field) => !allowedFields.includes(field))) {
		return null;
	}

	const input = {};

	if (requireTitle || body.title !== undefined) {
		if (typeof body.title !== "string" || !body.title.trim()) {
			return null;
		}
		input.title = body.title.trim();
	}

	for (const field of ["description", "category"]) {
		if (body[field] !== undefined) {
			if (typeof body[field] !== "string") {
				return null;
			}
			input[field] = body[field].trim();
		}
	}

	if (body.difficulty !== undefined) {
		if (!["easy", "medium", "hard"].includes(body.difficulty)) {
			return null;
		}
		input.difficulty = body.difficulty;
	}

	if (body.duration !== undefined) {
		if (!Number.isInteger(body.duration) || body.duration <= 0) {
			return null;
		}
		input.duration = body.duration;
	}

	if (body.targetUsers !== undefined) {
		if (!Array.isArray(body.targetUsers) || !body.targetUsers.every((id) => mongoose.Types.ObjectId.isValid(id))) {
			return null;
		}
		input.targetUsers = body.targetUsers;
	}

	if (body.targetDepartments !== undefined) {
		if (!Array.isArray(body.targetDepartments) || !body.targetDepartments.every((id) => mongoose.Types.ObjectId.isValid(id))) {
			return null;
		}
		input.targetDepartments = body.targetDepartments;
	}

	if (body.targetAll !== undefined) {
		if (typeof body.targetAll !== "boolean") {
			return null;
		}
		input.targetAll = body.targetAll;
	}

	return Object.keys(input).length > 0 ? input : null;
};

exports.getQuizzes = async (req, res, next) => {
	try {
		const query = req.user.role === "admin"
			? {}
			: {
				$or: [
					{ targetAll: true },
					{ targetUsers: req.user._id },
					{ targetDepartments: req.user.departmentId },
				],
			};
		const quizzes = await Quiz.find(query).sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			count: quizzes.length,
			data: quizzes,
		});
	} catch (err) {
		next(err);
	}
};

exports.getQuiz = async (req, res, next) => {
	try {
		const quiz = await Quiz.findById(req.params.id);

		if (!quiz) {
			return res.status(404).json({
				success: false,
				message: "Quiz not found.",
			});
		}

		res.status(200).json({
			success: true,
			data: quiz,
		});
	} catch (err) {
		next(err);
	}
};

exports.createQuiz = async (req, res, next) => {
	try {
		const input = validateQuizInput(req.body, true);

		if (!input || (!input.targetAll && !input.targetUsers?.length && !input.targetDepartments?.length)) {
			return res.status(400).json({
				success: false,
				message: "Quiz input and at least one assignment target are required.",
			});
		}

		const [users, departments] = await Promise.all([
			User.countDocuments({ _id: { $in: input.targetUsers || [] }, role: "employee" }),
			Department.countDocuments({ _id: { $in: input.targetDepartments || [] } }),
		]);

		if (users !== (input.targetUsers || []).length || departments !== (input.targetDepartments || []).length) {
			return res.status(400).json({
				success: false,
				message: "One or more quiz assignment targets were not found.",
			});
		}

		const quiz = await Quiz.create({
			...input,
			createdBy: req.user._id,
		});

		res.status(201).json({
			success: true,
			data: quiz,
		});
	} catch (err) {
		next(err);
	}
};

exports.updateQuiz = async (req, res, next) => {
	try {
		const input = validateQuizInput(req.body);

		if (!input) {
			return res.status(400).json({
				success: false,
				message: "Invalid quiz input.",
			});
		}

		const quiz = await Quiz.findByIdAndUpdate(req.params.id, input, {
			new: true,
			runValidators: true,
		});

		if (!quiz) {
			return res.status(404).json({
				success: false,
				message: "Quiz not found.",
			});
		}

		res.status(200).json({
			success: true,
			data: quiz,
		});
	} catch (err) {
		next(err);
	}
};

exports.deleteQuiz = async (req, res, next) => {
	try {
		const quiz = await Quiz.findByIdAndDelete(req.params.id);

		if (!quiz) {
			return res.status(404).json({
				success: false,
				message: "Quiz not found.",
			});
		}

		res.status(200).json({
			success: true,
			message: "Quiz deleted.",
		});
	} catch (err) {
		next(err);
	}
};
