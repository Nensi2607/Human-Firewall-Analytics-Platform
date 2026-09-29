const Training = require("../models/Training");
const User = require("../models/User");
const { createNotificationsForUsers } = require("../services/notificationService");

exports.getTrainings = async (req, res, next) => {
	try {
		const trainings = await Training.find()
			.select("_id title description category type resourceURL duration")
			.sort({ createdAt: 1 });

		res.status(200).json({
			success: true,
			data: trainings,
		});
	} catch (err) {
		next(err);
	}
};

exports.createTraining = async (req, res, next) => {
	try {
		const { title, description = "", category = "", type = "other", resourceURL = "", duration } = req.body;
		const allowedTypes = ["video", "pdf", "article", "other"];

		if (
			typeof title !== "string" ||
			!title.trim() ||
			typeof description !== "string" ||
			typeof category !== "string" ||
			!allowedTypes.includes(type) ||
			typeof resourceURL !== "string" ||
			(duration !== undefined && (!Number.isInteger(duration) || duration <= 0))
		) {
			return res.status(400).json({
				success: false,
				message: "Valid training details are required.",
			});
		}

		const training = await Training.create({
			title: title.trim(),
			description: description.trim(),
			category: category.trim(),
			type,
			resourceURL: resourceURL.trim(),
			duration,
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
