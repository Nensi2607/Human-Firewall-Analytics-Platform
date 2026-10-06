const test = require("node:test");
const assert = require("node:assert/strict");

const {
	buildAdminPhishingNotification,
} = require("../src/services/notificationService");

test("builds the requested admin phishing event messages", () => {
	assert.deepEqual(buildAdminPhishingNotification({
		employeeName: "Alicia Chen",
		campaignName: "Quarterly Security Test",
		event: "opened",
	}), {
		title: "Phishing simulation opened",
		message: "Employee Alicia Chen opened a phishing simulation email (Campaign: Quarterly Security Test)",
		type: "info",
	});

	assert.deepEqual(buildAdminPhishingNotification({
		employeeName: "Alicia Chen",
		campaignName: "Quarterly Security Test",
		event: "clicked",
	}), {
		title: "Phishing simulation link clicked",
		message: "Employee Alicia Chen clicked a phishing simulation link (Campaign: Quarterly Security Test)",
		type: "alert",
	});

	assert.deepEqual(buildAdminPhishingNotification({
		employeeName: "Alicia Chen",
		campaignName: "Quarterly Security Test",
		event: "reported",
	}), {
		title: "Phishing simulation reported",
		message: "Employee Alicia Chen reported a phishing simulation as suspicious (Campaign: Quarterly Security Test)",
		type: "success",
	});
});
