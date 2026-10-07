const mongoose = require("mongoose");
const PhishingAttempt = require("../models/PhishingAttempt");
const User = require("../models/User");
const {
	createAdminPhishingNotification,
	createUserNotification,
} = require("../services/notificationService");
const { calculateRiskAssessment } = require("../services/riskAssessmentService");

const refreshEmployeeRisk = async (userId) => {
	await calculateRiskAssessment(userId);
};

exports.getMyPhishingAttempts = async (req, res, next) => {
	try {
		const attempts = await PhishingAttempt.find({ userId: req.user._id })
			.select("campaignId sentAt expiresAt clicked clickedAt linkClicked linkClickedAt reported reportedAt")
			.populate("campaignId", "title status launchDate")
			.sort({ sentAt: -1 })
			.lean();

		res.status(200).json({
			success: true,
			count: attempts.length,
			data: attempts,
		});
	} catch (err) {
		next(err);
	}
};

exports.reportMyPhishingAttempt = async (req, res, next) => {
	try {
		if (!mongoose.Types.ObjectId.isValid(req.params.attemptId)) {
			return res.status(400).json({
				success: false,
				message: "Invalid simulation attempt ID.",
			});
		}

		const attempt = await PhishingAttempt.findOneAndUpdate(
			{ _id: req.params.attemptId, userId: req.user._id },
			{ $set: { reported: true, reportedAt: new Date() } },
			{ new: true }
		)
			.select("campaignId sentAt expiresAt clicked clickedAt linkClicked linkClickedAt reported reportedAt")
			.populate("campaignId", "title launchedBy")
			.lean();

		if (!attempt) {
			return res.status(404).json({
				success: false,
				message: "Simulation attempt not found.",
			});
		}

		if (attempt.campaignId?.launchedBy) {
			await createUserNotification({
				userId: attempt.campaignId.launchedBy,
				title: "Phishing simulation reported",
				message: `An employee reported the ${attempt.campaignId.title} simulation message.`,
				type: "info",
			});
		}

		const employee = await User.findById(req.user._id).select("firstName lastName").lean();
		const campaign = attempt.campaignId;
		await Promise.all([
			createAdminPhishingNotification({
				employee,
				campaign,
				event: "reported",
			}),
			createUserNotification({
				userId: req.user._id,
				title: "Phishing simulation reported",
				message: `You reported the ${campaign.title} simulation message as suspicious.`,
				type: "success",
			}),
			refreshEmployeeRisk(req.user._id),
		]);

		return res.status(200).json({ success: true, data: attempt });
	} catch (err) {
		next(err);
	}
};

const getAwarenessUrl = () =>
	process.env.PHISHING_AWARENESS_URL ||
	`${process.env.CLIENT_URL || "http://localhost:5173"}/phishing-awareness`;

exports.trackPhishingAttempt = async (req, res, next) => {
	try {
		console.log("[phishing-click] incoming token:", req.params.token);
		const attempt = await PhishingAttempt.findOne({ token: req.params.token });

		if (!attempt || (attempt.expiresAt && attempt.expiresAt <= new Date())) {
			return res.redirect(getAwarenessUrl());
		}

		if (!attempt.clicked) {
			const clickedAt = new Date();
			const updateResult = await PhishingAttempt.updateOne(
				{ _id: attempt._id, clicked: false },
				{
					$set: {
						clicked: true,
						clickedAt,
						linkClicked: true,
						linkClickedAt: clickedAt,
					},
				}
			);

			if (updateResult.modifiedCount > 0) {
				const employee = await User.findById(attempt.userId).select("firstName lastName").lean();
				const campaign = await PhishingAttempt.populate(attempt, "campaignId");
				await Promise.all([
					createAdminPhishingNotification({
						employee,
						campaign: campaign.campaignId,
						event: "clicked",
					}),
					createUserNotification({
						userId: attempt.userId,
						title: "Phishing simulation link clicked",
						message: `You clicked the ${campaign.campaignId.title} simulation link.`,
						type: "alert",
					}),
					refreshEmployeeRisk(attempt.userId),
				]);
			}
		}

		return res.redirect(getAwarenessUrl());
	} catch (err) {
		next(err);
	}
};

exports.trackOpenPixel = async (req, res, next) => {
	try {
		const attempt = await PhishingAttempt.findOne({ token: req.params.token });

		if (attempt && !attempt.emailOpened) {
			const updateResult = await PhishingAttempt.updateOne(
				{ _id: attempt._id, emailOpened: false },
				{
					$set: {
						emailOpened: true,
						emailOpenedAt: new Date(),
					},
				}
			);

			if (updateResult.modifiedCount > 0) {
				const employee = await User.findById(attempt.userId).select("firstName lastName").lean();
				const campaign = await PhishingAttempt.populate(attempt, "campaignId");
				await Promise.all([
					createAdminPhishingNotification({
						employee,
						campaign: campaign.campaignId,
						event: "opened",
					}),
					createUserNotification({
						userId: attempt.userId,
						title: "Phishing simulation opened",
						message: `You opened the ${campaign.campaignId.title} simulation email.`,
						type: "info",
					}),
					refreshEmployeeRisk(attempt.userId),
				]);
			}
		}

		const pixel = Buffer.from(
			"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAF" +
			"c1hAAAAAXNSR0IArs4c6QAAAA1JREFUGFdjYAAA" +
			"AIAAeIhvAAAAABJRU5ErkJggg==",
			"base64"
		);
		res.setHeader("Content-Type", "image/png");
		res.setHeader("Content-Length", pixel.length);
		res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
		return res.send(pixel);
	} catch (err) {
		next(err);
	}
};
