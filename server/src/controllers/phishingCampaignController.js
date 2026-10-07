const crypto = require("crypto");
const mongoose = require("mongoose");
const PhishingCampaign = require("../models/PhishingCampaign");
const PhishingAttempt = require("../models/PhishingAttempt");
const User = require("../models/User");
const Department = require("../models/Department");
const { sendPhishingEmail } = require("../services/emailService");
const {
	createUserNotification,
	createNotificationsForUsers,
} = require("../services/notificationService");

const getTrackingBaseUrl = () =>
	process.env.PHISHING_TRACKING_URL ||
	`http://localhost:${process.env.PORT || 5000}/api/phishing/track`;

const validateObjectIds = (values) =>
	Array.isArray(values) &&
	values.every((value) => mongoose.Types.ObjectId.isValid(value));

const getTargets = async (campaign) => {
	const filters = [{ _id: { $in: campaign.targetUsers || [] } }];

	if (campaign.targetDepartments?.length) {
		filters.push({ departmentId: { $in: campaign.targetDepartments } });
	}

	if (campaign.targetAll) {
		filters.push({});
	}

	return User.find({
		role: "employee",
		status: "active",
		$or: filters,
	})
		.select("_id firstName lastName email")
		.lean();
};


const escapeHtml = (value) =>
	value.replace(/[&<>"']/g, (character) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#39;",
	})[character]);

const renderEmailTemplate = (template, trackingUrl) => {
	const link = `
		<a href="${trackingUrl}" style="color:#1a73e8; font-weight:600; text-decoration:underline;">
			Verify your account
		</a>
	`;
	const pixelUrl = trackingUrl.replace(/\/track\//, "/pixel/");
	const templateBody = (template || "").trim();
	const hasTrackingLink = templateBody.includes("{{TRACKING_LINK}}");
	const body = hasTrackingLink
		? templateBody
				.split("{{TRACKING_LINK}}")
				.map((part) => escapeHtml(part).replace(/\r?\n/g, "<br>"))
				.join(link)
		: `This is a phishing awareness simulation. ${link}`;
	return `<p>${body}</p><img src="${pixelUrl}" width="1" height="1" style="display:none;" alt="" />`;
};

exports.renderEmailTemplate = renderEmailTemplate;

exports.createCampaign = async (req, res, next) => {
	try {
		const {
			title,
			emailSubject,
			emailTemplate,
			senderName,
			targetUsers = [],
			targetDepartments = [],
			targetAll = false,
		} = req.body;

		if (
			typeof title !== "string" ||
			!title.trim() ||
			typeof emailSubject !== "string" ||
			!emailSubject.trim() ||
			typeof emailTemplate !== "string" ||
			!emailTemplate.trim() ||
			typeof senderName !== "string" ||
			!senderName.trim() ||
			/[@<>\r\n]/.test(senderName) ||
			!validateObjectIds(targetUsers) ||
			!validateObjectIds(targetDepartments) ||
			typeof targetAll !== "boolean" ||
			(!targetAll && targetUsers.length === 0 && targetDepartments.length === 0)
		) {
			return res.status(400).json({
				success: false,
				message: "Campaign content and at least one valid target are required.",
			});
		}

		const [users, departments] = await Promise.all([
			User.countDocuments({ _id: { $in: targetUsers }, role: "employee" }),
			Department.countDocuments({ _id: { $in: targetDepartments } }),
		]);

		if (users !== targetUsers.length || departments !== targetDepartments.length) {
			return res.status(400).json({
				success: false,
				message: "One or more campaign targets were not found.",
			});
		}

		const campaign = await PhishingCampaign.create({
			title: title.trim(),
			emailSubject: emailSubject.trim(),
			emailTemplate,
			senderName: senderName.trim(),
			targetUsers,
			targetDepartments,
			targetAll,
			status: "draft",
		});

		return res.status(201).json({ success: true, data: campaign });
	} catch (err) {
		next(err);
	}
};

exports.getCampaigns = async (req, res, next) => {
	try {
		const campaigns = await PhishingCampaign.find()
			.select("title emailSubject status launchDate createdAt")
			.sort({ createdAt: -1 })
			.lean();

		const campaignIds = campaigns.map((campaign) => campaign._id);
		const stats = await PhishingAttempt.aggregate([
			{ $match: { campaignId: { $in: campaignIds } } },
			{
				$group: {
					_id: "$campaignId",
					targetedCount: { $sum: 1 },
					clickedCount: { $sum: { $cond: ["$clicked", 1, 0] } },
					reportedCount: { $sum: { $cond: ["$reported", 1, 0] } },
					ignoredCount: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $lt: ["$expiresAt", new Date()] },
										{ $ne: ["$clicked", true] },
										{ $ne: ["$reported", true] },
									],
								},
								1,
								0,
							],
						},
					},
				},
			},
		]);
		const statsByCampaign = new Map(stats.map((stat) => [String(stat._id), stat]));

		res.status(200).json({
			success: true,
			data: campaigns.map((campaign) => {
				const stat = statsByCampaign.get(String(campaign._id));
				const targetedCount = stat?.targetedCount || 0;
				const clickedCount = stat?.clickedCount || 0;
				const reportedCount = stat?.reportedCount || 0;
				const noResponseCount = Math.max(targetedCount - clickedCount - reportedCount, 0);
				return {
					...campaign,
					targetedCount,
					clickedCount,
					reportedCount,
					ignoredCount: noResponseCount,
					clickRate: targetedCount ? Math.round((clickedCount / targetedCount) * 100) : 0,
				};
			})
		});
	} catch (err) {
		next(err);
	}
};

exports.launchCampaign = async (req, res, next) => {
	try {
		const campaign = await PhishingCampaign.findById(req.params.id);

		if (!campaign) {
			return res.status(404).json({ success: false, message: "Campaign not found." });
		}

		if (campaign.status === "completed" || campaign.status === "running") {
			return res.status(400).json({
				success: false,
				message: "This campaign has already been launched.",
			});
		}

		const targets = await getTargets(campaign);

		if (targets.length === 0) {
			return res.status(400).json({
				success: false,
				message: "No active employee targets were found.",
			});
		}

		campaign.status = "running";
		campaign.launchedBy = req.user._id;
		campaign.launchDate = new Date();
		await campaign.save();

		let sentCount = 0;
		let previewCount = 0;
		const previewMode = !process.env.SMTP_HOST;
		for (const employee of targets) {
			const token = crypto.randomBytes(32).toString("hex");
			const trackingUrl = `${getTrackingBaseUrl()}/${token}`;
			if (previewMode) {
				await sendPhishingEmail({
					to: employee.email,
					subject: campaign.emailSubject,
					html: renderEmailTemplate(campaign.emailTemplate, trackingUrl),
					senderName: campaign.senderName,
				});
				previewCount += 1;
				continue;
			}

			const expiresAt = new Date(
				Date.now() + Number(process.env.PHISHING_TOKEN_TTL_HOURS || 720) * 60 * 60 * 1000
			);
			const attempt = await PhishingAttempt.create({
				campaignId: campaign._id,
				userId: employee._id,
				employeeId: employee._id,
				token,
				sentAt: new Date(),
				expiresAt,
			});

			try {
				await sendPhishingEmail({
					to: employee.email,
					subject: campaign.emailSubject,
					html: renderEmailTemplate(campaign.emailTemplate, trackingUrl),
					senderName: campaign.senderName,
				});
				sentCount += 1;
			} catch (err) {
				await PhishingAttempt.deleteOne({ _id: attempt._id });
				throw err;
			}
		}

		campaign.status = "completed";
		if (previewMode) {
			campaign.status = "draft";
			campaign.launchDate = undefined;
			campaign.launchedBy = undefined;
			await campaign.save();
			return res.status(200).json({
				success: true,
				message: "Preview generated. No simulation emails were sent; configure SMTP to launch this campaign.",
				data: {
					campaignId: campaign._id,
					targetedCount: targets.length,
					sentCount: 0,
					previewCount,
					previewMode: true,
				},
			});
		}

		await campaign.save();
		await createNotificationsForUsers(
			targets.map((employee) => employee._id),
			{
				title: "Phishing campaign launched",
				message: `A phishing simulation, ${campaign.title}, is now active for you.`,
				type: "warning",
			}
		);
		await createUserNotification({
			userId: req.user._id,
			title: "Phishing campaign launched",
			message: `${campaign.title} was sent to ${sentCount} employee${sentCount === 1 ? "" : "s"}.`,
			type: "success",
		});

		return res.status(200).json({
			success: true,
			message: "Phishing campaign launched.",
			data: { campaignId: campaign._id, targetedCount: targets.length, sentCount },
		});
	} catch (err) {
		next(err);
	}
};

exports.getCampaignStats = async (req, res, next) => {
	try {
		const campaign = await PhishingCampaign.findById(req.params.id).select("title status");

		if (!campaign) {
			return res.status(404).json({ success: false, message: "Campaign not found." });
		}

		const attempts = await PhishingAttempt.find({ campaignId: campaign._id })
			.select("employeeId sentAt expiresAt clicked clickedAt reported reportedAt")
			.populate("employeeId", "firstName lastName email")
			.sort({ sentAt: 1 })
			.lean();
		const clickedCount = attempts.filter((attempt) => attempt.clicked).length;
		const reportedCount = attempts.filter((attempt) => attempt.reported).length;
		const noResponseCount = Math.max(attempts.length - clickedCount - reportedCount, 0);

		return res.status(200).json({
			success: true,
			data: {
				campaign,
				targetedCount: attempts.length,
				clickedCount,
				reportedCount,
				ignoredCount: noResponseCount,
				clickRate: attempts.length ? Math.round((clickedCount / attempts.length) * 100) : 0,
				employees: attempts.map((attempt) => ({
					employee: attempt.employeeId,
					clicked: attempt.clicked,
					clickedAt: attempt.clickedAt,
					reported: attempt.reported,
					reportedAt: attempt.reportedAt,
					expiresAt: attempt.expiresAt,
					sentAt: attempt.sentAt,
				})),
			},
		});
	} catch (err) {
		next(err);
	}
};
