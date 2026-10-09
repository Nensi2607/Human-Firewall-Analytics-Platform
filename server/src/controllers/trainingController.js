const mongoose = require("mongoose");
const Training = require("../models/Training");
const TrainingProgress = require("../models/TrainingProgress");
const User = require("../models/User");
const { createNotificationsForUsers } = require("../services/notificationService");
const { calculateTrainingProgress } = require("../services/trainingProgressService");
const { KNOWLEDGE_CHECK_PASS_PERCENT } = require("../config/trainingConfig");

const getTrainingInput = (body, requireTitle = false) => {
	const allowedFields = ["title", "description", "category", "type", "resourceURL", "duration", "difficulty", "estimatedMinutes"];
	if (
		!body ||
		typeof body !== "object" ||
		Array.isArray(body) ||
		Object.keys(body).length === 0 ||
		Object.keys(body).some((field) => !allowedFields.includes(field))
	) {
		return null;
	}

	const input = {};
	if (requireTitle || body.title !== undefined) {
		if (typeof body.title !== "string") return null;
		const title = body.title.trim();
		if (!title || title.length > 160) return null;
		input.title = title;
	}
	for (const [field, maxLength] of [["description", 2000], ["category", 120]]) {
		if (body[field] === undefined) continue;
		if (typeof body[field] !== "string" || body[field].length > maxLength) return null;
		input[field] = body[field].trim();
	}
	if (body.type !== undefined) {
		if (!["video", "pdf", "article", "other"].includes(body.type)) return null;
		input.type = body.type;
	}
	if (body.resourceURL !== undefined) {
		if (typeof body.resourceURL !== "string") return null;
		const resourceURL = body.resourceURL.trim();
		if (resourceURL) {
			try {
				if (!["http:", "https:"].includes(new URL(resourceURL).protocol)) return null;
			} catch {
				return null;
			}
		}
		input.resourceURL = resourceURL;
	}
	if (body.duration !== undefined) {
		if (!Number.isInteger(body.duration) || body.duration < 1 || body.duration > 1440) return null;
		input.duration = body.duration;
	}
	if (body.difficulty !== undefined) {
		if (!["Beginner", "Intermediate", "Advanced"].includes(body.difficulty)) return null;
		input.difficulty = body.difficulty;
	}
	if (body.estimatedMinutes !== undefined) {
		if (!Number.isInteger(body.estimatedMinutes) || body.estimatedMinutes < 1 || body.estimatedMinutes > 1440) return null;
		input.estimatedMinutes = body.estimatedMinutes;
	}
	return Object.keys(input).length ? input : null;
};

exports.getTrainings = async (req, res, next) => {
	try {
		const trainings = await Training.find()
			.select("_id title description category type resourceURL duration difficulty estimatedMinutes lessons knowledgeCheck.questions.question knowledgeCheck.questions.options createdAt")
			.sort({ createdAt: 1 })
			.lean();
		let data = trainings.map((training) => ({
			...training,
			knowledgeCheckPassPercent: KNOWLEDGE_CHECK_PASS_PERCENT,
		}));
		if (req.user.role === "admin" && trainings.length) {
			const [employeeCount, records] = await Promise.all([
				User.countDocuments({ role: "employee" }),
				TrainingProgress.find({ trainingId: { $in: trainings.map((training) => training._id) } })
					.select("userId trainingId progress completed completedAt openedLessons completedLessons knowledgeCheckAttempts knowledgeCheckScore knowledgeCheckPassed knowledgeCheckCompletedAt lastActivityAt legacyProgressValue legacyCompletedValue legacyCompletedAt legacyCapturedAt")
					.lean(),
			]);
			const recordsByTraining = new Map();
			records.forEach((record) => {
				const id = String(record.trainingId);
				recordsByTraining.set(id, [...(recordsByTraining.get(id) || []), record]);
			});
			data = data.map((training) => {
				const trainingRecords = recordsByTraining.get(String(training._id)) || [];
				const progressStates = trainingRecords.map((record) => calculateTrainingProgress(record, training));
				const completed = progressStates.filter((record) => record.completed).length;
				const started = progressStates.filter((record) =>
					record.openedLessons.length > 0 || record.completedLessons.length > 0 || record.knowledgeCheckAttempts > 0 || record.legacyCompletion || record.legacyProgress || record.progress > 0
				).length;
				return {
					...training,
					progressSummary: {
						notStarted: Math.max(0, employeeCount - started),
						inProgress: Math.max(0, started - completed),
						completed,
					},
				};
			});
		}

		res.status(200).json({
			success: true,
			data,
		});
	} catch (err) {
		next(err);
	}
};

exports.getKnowledgeCheck = async (req, res, next) => {
	try {
		if (!mongoose.Types.ObjectId.isValid(req.params.trainingId)) {
			return res.status(400).json({ success: false, message: "Invalid training ID." });
		}
		const training = await Training.findById(req.params.trainingId)
			.select("knowledgeCheck.questions.question knowledgeCheck.questions.options")
			.lean();
		if (!training) return res.status(404).json({ success: false, message: "Training not found." });
		return res.status(200).json({ success: true, data: training.knowledgeCheck?.questions || [] });
	} catch (error) {
		return next(error);
	}
};

exports.createTraining = async (req, res, next) => {
	try {
		const input = getTrainingInput(req.body, true);

		if (!input) {
			return res.status(400).json({
				success: false,
				message: "Valid training details are required.",
			});
		}

		const training = await Training.create({
			description: "",
			category: "",
			type: "other",
			resourceURL: "",
			...input,
			createdBy: req.user._id,
		});
		const employees = await User.find({ role: "employee", status: "active" })
			.select("_id")
			.lean();

		await createNotificationsForUsers(
			employees.map((employee) => employee._id),
			{
				title: "New training assigned",
				message: `${training.title} is now available in your training list.`,
				type: "info",
			}
		);

		res.status(201).json({ success: true, data: training });
	} catch (err) {
		next(err);
	}
};

exports.updateTraining = async (req, res, next) => {
	try {
		const input = getTrainingInput(req.body);
		if (!mongoose.Types.ObjectId.isValid(req.params.id) || !input) {
			return res.status(400).json({ success: false, message: "Invalid training update." });
		}

		const training = await Training.findByIdAndUpdate(req.params.id, input, {
			new: true,
			runValidators: true,
		});
		if (!training) {
			return res.status(404).json({ success: false, message: "Training not found." });
		}
		return res.status(200).json({ success: true, data: training });
	} catch (err) {
		next(err);
	}
};

exports.deleteTraining = async (req, res, next) => {
	try {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return res.status(400).json({ success: false, message: "Invalid training ID." });
		}

		if (await TrainingProgress.exists({ trainingId: req.params.id })) {
			return res.status(409).json({
				success: false,
				message: "This training has employee progress records and cannot be deleted.",
			});
		}

		const training = await Training.findByIdAndDelete(req.params.id);
		if (!training) {
			return res.status(404).json({ success: false, message: "Training not found." });
		}
		return res.status(200).json({ success: true, message: "Training deleted." });
	} catch (err) {
		next(err);
	}
};
