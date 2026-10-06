const Notification = require("../models/Notification");
const User = require("../models/User");

const buildAdminPhishingNotification = ({ employeeName, campaignName, event }) => {
	const notificationMap = {
		opened: {
			title: "Phishing simulation opened",
			message: `Employee ${employeeName} opened a phishing simulation email (Campaign: ${campaignName})`,
			type: "info",
		},
		clicked: {
			title: "Phishing simulation link clicked",
			message: `Employee ${employeeName} clicked a phishing simulation link (Campaign: ${campaignName})`,
			type: "alert",
		},
		reported: {
			title: "Phishing simulation reported",
			message: `Employee ${employeeName} reported a phishing simulation as suspicious (Campaign: ${campaignName})`,
			type: "success",
		},
	};

	if (!notificationMap[event]) {
		throw new Error(`Unsupported phishing notification event: ${event}`);
	}

	return notificationMap[event];
};

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

const createAdminPhishingNotification = async ({ employee, campaign, event }) => {
	const adminIds = await User.find({ role: "admin", status: "active" })
		.select("_id")
		.lean();

	if (adminIds.length === 0) {
		return [];
	}

	const notification = buildAdminPhishingNotification({
		employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
		campaignName: campaign.title,
		event,
	});

	return createNotificationsForUsers(
		adminIds.map((admin) => admin._id),
		notification
	);
};

module.exports = {
	createUserNotification,
	createNotificationsForUsers,
	buildAdminPhishingNotification,
	createAdminPhishingNotification,
};