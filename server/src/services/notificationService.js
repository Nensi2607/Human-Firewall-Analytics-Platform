const Notification = require("../models/Notification");

const createUserNotification = async ({ userId, title, message, type = "info" }) => {
	try {
		return await Notification.create({ userId, title, message, type });
	} catch (err) {
		console.error("Failed to save in-app notification:", err);
		return null;
	}
};

const createNotificationsForUsers = async (userIds, notification) => {
	const uniqueUserIds = [...new Set(userIds.filter(Boolean).map(String))];
	if (uniqueUserIds.length === 0) {
		return [];
	}

	try {
		return await Notification.insertMany(
			uniqueUserIds.map((userId) => ({ ...notification, userId }))
		);
	} catch (err) {
		console.error("Failed to save in-app notifications:", err);
		return [];
	}
};

module.exports = { createUserNotification, createNotificationsForUsers };