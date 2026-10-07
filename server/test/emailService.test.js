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

test("replaces the tracking marker with a clickable anchor containing the token", () => {
	const html = renderEmailTemplate("Visit {{TRACKING_LINK}}", "https://example.test/api/phishing/track/abc123");
	assert.match(html, /<a\s+href="https:\/\/example\.test\/api\/phishing\/track\/abc123"\s+style="color:#1a73e8; font-weight:600; text-decoration:underline;">\s*Verify your account\s*<\/a>/);
	assert.doesNotMatch(html, /<p>https:\/\/example\.test\/api\/phishing\/track\/abc123<\/p>/);
});

test("uses a default body when the campaign template is empty or lacks the marker", () => {
	const emptyHtml = renderEmailTemplate("", "https://example.test/api/phishing/track/abc123");
	const bareUrlHtml = renderEmailTemplate("https://example.test/api/phishing/track", "https://example.test/api/phishing/track/abc123");
	assert.match(emptyHtml, /<a href="https:\/\/example\.test\/api\/phishing\/track\/abc123"/);
	assert.match(emptyHtml, /Verify your account/);
	assert.match(bareUrlHtml, /<a href="https:\/\/example\.test\/api\/phishing\/track\/abc123"/);
	assert.doesNotMatch(bareUrlHtml, /<p>https:\/\/example\.test\/api\/phishing\/track<\/p>/);
});
