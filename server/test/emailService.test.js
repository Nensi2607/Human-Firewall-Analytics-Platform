const test = require("node:test");
const assert = require("node:assert/strict");

const { renderEmailTemplate } = require("../src/controllers/phishingCampaignController");
const { formatSenderAddress, validateSenderName } = require("../src/services/emailService");

test("formats the sender name with the authenticated SMTP address", () => {
	assert.equal(
		formatSenderAddress("IT Support", "noreply@example.com"),
		'"IT Support" <noreply@example.com>',
	);
});

test("rejects display names that would allow a different email address", () => {
	assert.throws(() => validateSenderName("hr@example.com"), /display name/i);
	assert.throws(() => validateSenderName("Security Team\nBcc: attacker@example.com"), /display name/i);
	assert.equal(validateSenderName("Security Team"), "Security Team");
});

test("embeds the existing token in a tracking pixel", () => {
	const html = renderEmailTemplate("Visit {{TRACKING_LINK}}", "https://example.test/api/phishing/track/abc123");
	assert.match(html, /<img src="https:\/\/example\.test\/api\/phishing\/pixel\/abc123"/);
});
