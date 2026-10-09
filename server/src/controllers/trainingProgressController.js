const mongoose = require("mongoose");
const Training = require("../models/Training");
const TrainingProgress = require("../models/TrainingProgress");
const { calculateTrainingProgress } = require("../services/trainingProgressService");
const { KNOWLEDGE_CHECK_PASS_PERCENT } = require("../config/trainingConfig");

const progressFields = "userId trainingId progress completed completedAt openedLessons completedLessons knowledgeCheckAttempts knowledgeCheckScore knowledgeCheckPassed knowledgeCheckCompletedAt lastActivityAt legacyProgressValue legacyCompletedValue legacyCompletedAt legacyCapturedAt";

const findOwnedProgress = (employeeId, trainingId) =>
	TrainingProgress.findOne({ userId: employeeId, trainingId }).select(progressFields).lean();

const ensureProgressRecord = async (employeeId, trainingId) => {
	const record = await findOwnedProgress(employeeId, trainingId);
	if (record) return record;
	try {
		return await TrainingProgress.create({
			userId: employeeId,
			trainingId,
			progress: 0,
			completed: false,
			openedLessons: [],
			completedLessons: [],
			knowledgeCheckAttempts: 0,
			knowledgeCheckPassed: false,
			lastActivityAt: new Date(),
		});
	} catch (error) {
		if (error.code !== 11000) throw error;
		return findOwnedProgress(employeeId, trainingId);
	}
};

const saveDerivedProgress = async (record, training) => {
	const calculated = calculateTrainingProgress(record, training);
	const completedAt = calculated.completed
		? record.knowledgeCheckCompletedAt || record.completedAt || new Date()
		: null;
	const hasLegacyState = !record.legacyCapturedAt && (
		record.completed === true ||
		(Number.isFinite(record.progress) && record.progress > 0) ||
		record.completedAt
	);
	const preserveLegacy = hasLegacyState ? {
		legacyProgressValue: Number.isFinite(record.progress) ? record.progress : null,
		legacyCompletedValue: record.completed === true,
		legacyCompletedAt: record.completedAt || null,
		legacyCapturedAt: new Date(),
	} : {};
	return TrainingProgress.findByIdAndUpdate(
		record._id,
		{ $set: { ...preserveLegacy, progress: calculated.progress, completed: calculated.completed, completedAt } },
		{ new: true, runValidators: true }
	).select(progressFields).lean();
};

const updateLessonState = (field, message) => async (req, res, next) => {
	try {
		const { trainingId, lessonIndex: rawLessonIndex } = req.params;
		const lessonIndex = Number(rawLessonIndex);
		if (!mongoose.Types.ObjectId.isValid(trainingId) || !Number.isInteger(lessonIndex) || lessonIndex < 0) {
			return res.status(400).json({ success: false, message: "A valid training and lesson are required." });
		}
		const training = await Training.findById(trainingId).select("lessons knowledgeCheck").lean();
		if (!training) return res.status(404).json({ success: false, message: "Training not found." });
		if (!training.lessons?.[lessonIndex]) return res.status(404).json({ success: false, message: "Lesson not found." });

		const record = await ensureProgressRecord(req.user._id, trainingId);
		const openedLessons = new Set(record.openedLessons || []);
		if (field === "completedLessons" && !openedLessons.has(lessonIndex)) {
			return res.status(400).json({ success: false, message: "Open the lesson before marking it finished." });
		}
		const updated = await TrainingProgress.findByIdAndUpdate(
			record._id,
			{
				$addToSet: { [field]: lessonIndex, ...(field === "completedLessons" ? { openedLessons: lessonIndex } : {}) },
				$set: { lastActivityAt: new Date() },
			},
			{ new: true, runValidators: true }
		).select(progressFields).lean();
		const saved = await saveDerivedProgress(updated, training);
		return res.status(200).json({ success: true, data: calculateTrainingProgress(saved, training), message });
	} catch (error) {
		return next(error);
	}
};

exports.getTrainingProgress = async (req, res, next) => {
	try {
		const [records, trainings] = await Promise.all([
			TrainingProgress.find({ userId: req.user._id }).select(progressFields).sort({ updatedAt: -1 }).lean(),
			Training.find({}).select("lessons knowledgeCheck").lean(),
		]);
		const trainingById = new Map(trainings.map((training) => [String(training._id), training]));
		const progress = records.map((record) => {
			const training = trainingById.get(String(record.trainingId));
			return training ? calculateTrainingProgress(record, training) : record;
		});
		return res.status(200).json({ success: true, data: progress });
	} catch (error) {
		return next(error);
	}
};

exports.openLesson = updateLessonState("openedLessons", "Lesson opened.");
exports.completeLesson = updateLessonState("completedLessons", "Lesson marked as finished.");

exports.updateTrainingProgress = async (req, res, next) => {
	try {
		const { trainingId } = req.params;
		if (!mongoose.Types.ObjectId.isValid(trainingId)) {
			return res.status(400).json({ success: false, message: "Invalid training ID." });
		}
		const training = await Training.findById(trainingId).select("lessons knowledgeCheck").lean();
		if (!training) return res.status(404).json({ success: false, message: "Training not found." });
		const record = await findOwnedProgress(req.user._id, trainingId);
		const data = record
			? calculateTrainingProgress(record, training)
			: calculateTrainingProgress({}, training);
		return res.status(200).json({ success: true, data });
	} catch (error) {
		return next(error);
	}
};

exports.getKnowledgeCheck = async (req, res, next) => {
	try {
		const { trainingId } = req.params;
		if (!mongoose.Types.ObjectId.isValid(trainingId)) {
			return res.status(400).json({ success: false, message: "Invalid training ID." });
		}
		const training = await Training.findById(trainingId)
			.select("knowledgeCheck.questions.question knowledgeCheck.questions.options")
			.lean();
		if (!training) return res.status(404).json({ success: false, message: "Training not found." });
		return res.status(200).json({ success: true, data: training.knowledgeCheck?.questions || [] });
	} catch (error) {
		return next(error);
	}
};

exports.submitKnowledgeCheck = async (req, res, next) => {
	try {
		const { trainingId } = req.params;
		const { answers } = req.body || {};
		if (!mongoose.Types.ObjectId.isValid(trainingId) || !Array.isArray(answers)) {
			return res.status(400).json({ success: false, message: "A valid training and answer list are required." });
		}
		const training = await Training.findById(trainingId)
			.select("lessons knowledgeCheck.questions.question knowledgeCheck.questions.options +knowledgeCheck.questions.correctAnswer")
			.lean();
		if (!training) return res.status(404).json({ success: false, message: "Training not found." });
		const questions = training.knowledgeCheck?.questions || [];
		if (!questions.length || answers.length !== questions.length || answers.some((answer, index) =>
			!Number.isInteger(answer) || answer < 0 || answer >= questions[index].options.length
		)) {
			return res.status(400).json({ success: false, message: "Select one valid answer for every knowledge-check question." });
		}
		const existingRecord = await findOwnedProgress(req.user._id, trainingId);
		if (!training.lessons?.length || new Set(existingRecord?.completedLessons || []).size !== training.lessons.length) {
			return res.status(400).json({ success: false, message: "Finish every lesson before taking the knowledge check." });
		}
		const record = existingRecord || await ensureProgressRecord(req.user._id, trainingId);
		const correct = questions.reduce((count, question, index) =>
			count + (answers[index] === question.correctAnswer ? 1 : 0), 0);
		const score = Math.round((correct / questions.length) * 100);
		const passedThisAttempt = score >= KNOWLEDGE_CHECK_PASS_PERCENT;
		const knowledgeCheckPassed = record.knowledgeCheckPassed === true || passedThisAttempt;
		const knowledgeCheckCompletedAt = passedThisAttempt
			? new Date()
			: record.knowledgeCheckCompletedAt || null;
		const updated = await TrainingProgress.findByIdAndUpdate(
			record._id,
			{
				$set: {
					knowledgeCheckAttempts: (record.knowledgeCheckAttempts || 0) + 1,
					knowledgeCheckScore: score,
					knowledgeCheckPassed,
					knowledgeCheckCompletedAt,
					lastActivityAt: new Date(),
				},
			},
			{ new: true, runValidators: true }
		).select(progressFields).lean();
		const saved = await saveDerivedProgress(updated, training);
		return res.status(200).json({
			success: true,
			data: {
				...calculateTrainingProgress(saved, training),
				attemptScore: score,
				correctAnswers: correct,
				totalQuestions: questions.length,
				passedThisAttempt,
				passPercent: KNOWLEDGE_CHECK_PASS_PERCENT,
			},
		});
	} catch (error) {
		return next(error);
	}
};