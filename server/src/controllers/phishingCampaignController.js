const crypto = require("crypto");
const mongoose = require("mongoose");
const PhishingCampaign = require("../models/PhishingCampaign");
const PhishingAttempt = require("../models/PhishingAttempt");
const User = require("../models/User");
const Department = require("../models/Department");
const { sendPhishingEmail } = require("../services/emailService");

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

const renderEmailTemplate = (template, trackingUrl) => {
	const link = `<a href="${trackingUrl}">Review the security message</a>`;
	return template.includes("{{TRACKING_LINK}}")
		? template.replaceAll("{{TRACKING_LINK}}", link)
		: `${template}<p>${link}</p>`;
};

exports.createCampaign = async (req, res, next) => {
	try {
		const {
			title,
			emailSubject,
			emailTemplate,
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
				return {
					...campaign,
					targetedCount,
					clickedCount,
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
		for (const employee of targets) {
			const token = crypto.randomBytes(32).toString("hex");
			const trackingUrl = `${getTrackingBaseUrl()}/${token}`;
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
				});
				sentCount += 1;
			} catch (err) {
				await PhishingAttempt.deleteOne({ _id: attempt._id });
				throw err;
			}
		}

		campaign.status = "completed";
		await campaign.save();

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
			.populate("employeeId", "firstName lastName email")
			.sort({ sentAt: 1 })
			.lean();
		const clickedCount = attempts.filter((attempt) => attempt.clicked).length;

		return res.status(200).json({
			success: true,
			data: {
				campaign,
				targetedCount: attempts.length,
				clickedCount,
				clickRate: attempts.length ? Math.round((clickedCount / attempts.length) * 100) : 0,
				employees: attempts.map((attempt) => ({
					employee: attempt.employeeId,
					clicked: attempt.clicked,
					clickedAt: attempt.clickedAt,
					sentAt: attempt.sentAt,
				})),
			},
		});
	} catch (err) {
		next(err);
	}
};
