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

const sendPhishingEmail = async ({ to, subject, html }) => {
	const result = await transporter.sendMail({
		from: process.env.MAIL_FROM || process.env.SMTP_USER || "hfap@example.test",
		to,
		subject,
		html,
	});

	if (!process.env.SMTP_HOST) {
		console.log("Phishing simulation email preview:", result.message.toString());
	}

	return result;
};

module.exports = { sendPhishingEmail };
