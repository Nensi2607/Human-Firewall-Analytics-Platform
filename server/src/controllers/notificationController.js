const mongoose = require("mongoose");
const Notification = require("../models/Notification");

exports.getNotifications = async (req, res, next) => {
	try {
		const [notifications, unreadCount] = await Promise.all([
			Notification.find({ userId: req.user._id })
				.select("title message type isRead createdAt")
				.sort({ createdAt: -1 })
				.limit(100)
				.lean(),
			Notification.countDocuments({ userId: req.user._id, isRead: false }),
		]);

		res.status(200).json({
			success: true,
			data: notifications,
			unreadCount,
		});
	} catch (err) {
		next(err);
	}
};

exports.markNotificationRead = async (req, res, next) => {
	try {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return res.status(400).json({
				success: false,
				message: "Invalid notification ID.",
			});
		}

		const notification = await Notification.findOneAndUpdate(
			{ _id: req.params.id, userId: req.user._id },
			{ $set: { isRead: true } },
			{ new: true }
		).select("title message type isRead createdAt");

		if (!notification) {
			return res.status(404).json({
				success: false,
				message: "Notification not found.",
			});
		}

		res.status(200).json({ success: true, data: notification });
	} catch (err) {
		next(err);
	}
};

exports.markAllNotificationsRead = async (req, res, next) => {
	try {
		const result = await Notification.updateMany(
			{ userId: req.user._id, isRead: false },
			{ $set: { isRead: true } }
		);

		res.status(200).json({
			success: true,
			modifiedCount: result.modifiedCount,
		});
	} catch (err) {
		next(err);
	}
};
