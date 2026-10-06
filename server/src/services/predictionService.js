const AIPrediction = require("../models/AIPrediction");
const { buildFeaturesForUser } = require("./aiService");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const RISK_CATEGORIES = new Set(["Low", "Medium", "High"]);

const generatePredictionForUser = async (userId) => {
  const features = await buildFeaturesForUser(userId);
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
    const error = new Error(
      predictionBody.message || "The ML service did not return a valid prediction."
    );
    error.statusCode = predictionResponse.status;
    error.code = predictionBody.error || "ml_prediction_failed";
    throw error;
  }

  const { predicted_risk: predictedRisk, confidence, model_version: modelVersion } = predictionBody;
  if (
    !RISK_CATEGORIES.has(predictedRisk) ||
    typeof confidence !== "number" ||
    !Number.isFinite(confidence) ||
    confidence < 0 ||
    confidence > 1 ||
    typeof modelVersion !== "string" ||
    !modelVersion.trim()
  ) {
    const error = new Error("The ML service returned an invalid prediction payload.");
    error.statusCode = 502;
    error.code = "invalid_prediction_payload";
    throw error;
  }

  return AIPrediction.create({
    userId,
    predictedRisk,
    confidence,
    modelVersion,
    generatedAt: new Date(),
  });
};

module.exports = { generatePredictionForUser };
