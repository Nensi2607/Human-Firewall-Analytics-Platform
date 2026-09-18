const mongoose = require("mongoose");
const Training = require("../models/Training");
const TrainingProgress = require("../models/TrainingProgress");

exports.getTrainingProgress = async (req, res, next) => {
	try {
		const progress = await TrainingProgress.find({ userId: req.user._id })
			.select("trainingId progress completed completedAt")
			.sort({ updatedAt: -1 });

		res.status(200).json({
			success: true,
			data: progress,
		});
	} catch (err) {
		next(err);
	}
};

exports.updateTrainingProgress = async (req, res, next) => {
	try {
		const { trainingId } = req.params;
		const { progress, completed } = req.body;

		if (!mongoose.Types.ObjectId.isValid(trainingId)) {
			return res.status(400).json({
				success: false,
				message: "Invalid training ID.",
			});
		}

		if (
			typeof progress !== "number" ||
			!Number.isFinite(progress) ||
			progress < 0 ||
			progress > 100 ||
			typeof completed !== "boolean" ||
			(completed && progress !== 100)
		) {
			return res.status(400).json({
				success: false,
				message: "Progress must be between 0 and 100, and completed requires 100% progress.",
			});
		}

		const training = await Training.exists({ _id: trainingId });

		if (!training) {
			return res.status(404).json({
				success: false,
				message: "Training not found.",
			});
		}

		const isCompleted = completed;
		const savedProgress = await TrainingProgress.findOneAndUpdate(
			{
				userId: req.user._id,
				trainingId,
			},
			{
				$set: {
					progress: isCompleted ? 100 : progress,
					completed: isCompleted,
					completedAt: isCompleted ? new Date() : null,
				},
			},
			{
				new: true,
				upsert: true,
				runValidators: true,
				setDefaultsOnInsert: true,
			}
		);

		res.status(200).json({
			success: true,
			data: savedProgress,
		});
	} catch (err) {
		next(err);
	}
};
