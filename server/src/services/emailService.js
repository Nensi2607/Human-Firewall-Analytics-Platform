const nodemailer = require("nodemailer");

const createTransporter = () => {
	if (process.env.SMTP_HOST) {
		return nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: Number(process.env.SMTP_PORT || 587),
			secure: process.env.SMTP_SECURE === "true",
			auth: process.env.SMTP_USER
				? {
						user: process.env.SMTP_USER,
						pass: process.env.SMTP_PASSWORD,
					}
				: undefined,
		});
	}

	return nodemailer.createTransport({ jsonTransport: true });
};

const transporter = createTransporter();

const validateSenderName = (senderName) => {
	if (typeof senderName !== "string" || !senderName.trim()) {
		throw new Error("Sender display name is required.");
	}

	if (/[@<>\r\n]/.test(senderName) || senderName.includes("\0")) {
		throw new Error("Sender display name must not contain email addresses or control characters.");
	}

	return senderName.trim();
};

const formatSenderAddress = (senderName, smtpUser) => {
	return `"${validateSenderName(senderName)}" <${smtpUser}>`;
};

const verifyTransporter = async () => {
	try {
		await transporter.verify();
		console.log("[SUCCESS] SMTP connected and ready to send");
	} catch (error) {
		console.log(`[ERROR] SMTP connection failed: ${error.message}`);
	}
};

const sendPhishingEmail = async ({ to, subject, html, senderName }) => {
	const smtpUser = process.env.SMTP_USER;
	const result = await transporter.sendMail({
		from: formatSenderAddress(senderName, smtpUser),
		to,
		subject,
		html,
	});

	return result;
};

module.exports = { sendPhishingEmail, verifyTransporter, validateSenderName, formatSenderAddress };
