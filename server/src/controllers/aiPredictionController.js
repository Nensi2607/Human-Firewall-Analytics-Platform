const AIPrediction = require("../models/AIPrediction");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const RISK_CATEGORIES = new Set(["Low", "Medium", "High"]);

const getFeaturePayload = (body) => {

	if (!body || typeof body !== "object" || Array.isArray(body)) {
		return null;
	}

	return body;
};

exports.predictAndSave = async (req, res, next) => {
	try {
		const features = getFeaturePayload(req.body);

		if (!features) {
			return res.status(400).json({
				success: false,
				message: "Prediction features must be a JSON object.",
			});
		}

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 10000);
		let predictionResponse;

		try {
			predictionResponse = await fetch(`${AI_SERVICE_URL}/predict`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(features),
				signal: controller.signal,
			});
		} finally {
			clearTimeout(timeout);
		}

		const predictionBody = await predictionResponse.json().catch(() => ({}));

		if (!predictionResponse.ok) {
			return res.status(predictionResponse.status).json({
				success: false,
				message:
					predictionBody.message ||
					"The ML service did not return a valid prediction.",
				error: predictionBody.error || "ml_prediction_failed",
			});
		}

		const { predicted_risk, confidence, model_version } = predictionBody;
		if (
			!RISK_CATEGORIES.has(predicted_risk) ||
			typeof confidence !== "number" ||
			!Number.isFinite(confidence) ||
			confidence < 0 ||
			confidence > 1 ||
			typeof model_version !== "string" ||
			!model_version.trim()
		) {
			return res.status(502).json({
				success: false,
				message: "The ML service returned an invalid prediction payload.",
			});
		}

		const prediction = await AIPrediction.create({
			userId: req.user._id,
			predictedRisk: predicted_risk,
			confidence,
			modelVersion: model_version,
			generatedAt: new Date(),
		});

		return res.status(201).json({
			success: true,
			data: {
				id: prediction._id,
				userId: prediction.userId,
				predictedRisk: prediction.predictedRisk,
				confidence: prediction.confidence,
				modelVersion: prediction.modelVersion,
				generatedAt: prediction.generatedAt,
			},
		});
	} catch (error) {
		if (error.name === "AbortError") {
			return res.status(503).json({
				success: false,
				message: "The ML service did not respond in time; no prediction was saved.",
			});
		}
		if (error instanceof TypeError && error.message.toLowerCase().includes("fetch")) {
			return res.status(503).json({
				success: false,
				message: "The ML service is unavailable; no prediction was saved.",
			});
		}
		next(error);
	}
};