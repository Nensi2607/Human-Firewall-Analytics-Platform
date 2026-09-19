const PhishingAttempt = require("../models/PhishingAttempt");

exports.getMyPhishingAttempts = async (req, res, next) => {
	try {
		const attempts = await PhishingAttempt.find({ userId: req.user._id })
			.select("campaignId sentAt clicked clickedAt linkClicked linkClickedAt reported reportedAt")
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

const getAwarenessUrl = () =>
	process.env.PHISHING_AWARENESS_URL ||
	`${process.env.CLIENT_URL || "http://localhost:5173"}/phishing-awareness`;

exports.trackPhishingAttempt = async (req, res, next) => {
	try {
		const attempt = await PhishingAttempt.findOne({ token: req.params.token });

		if (!attempt || (attempt.expiresAt && attempt.expiresAt <= new Date())) {
			return res.redirect(getAwarenessUrl());
		}

		if (!attempt.clicked) {
			const clickedAt = new Date();
			await PhishingAttempt.updateOne(
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
		}

		return res.redirect(getAwarenessUrl());
	} catch (err) {
		next(err);
	}
};
