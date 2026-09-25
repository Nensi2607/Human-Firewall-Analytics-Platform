"""HFAP employee risk prediction API.

This service only serves a model produced by ml/train_risk_model.py. It does
not train models, create fake predictions, access MongoDB, or save predictions
back to AIPrediction.
"""

from __future__ import annotations

import math
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib
import pandas as pd
from flask import Flask, jsonify, request
from pymongo import MongoClient


ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = Path(
    os.getenv("HFAP_MODEL_PATH", ROOT / "ml" / "models" / "risk_model.joblib")
)
MODEL_VERSION = "baseline-logistic-regression-v1"
RISK_CLASSES = ["Low", "Medium", "High"]
ALLOWED_EXTRA_FIELDS = {"userId"}

# This order matches the feature DataFrame used by train_risk_model.py.
MODEL_FEATURES = [
    "quiz_attempt_count",
    "quiz_valid_percentage_count",
    "quiz_avg_percentage",
    "quiz_best_percentage",
    "quiz_latest_percentage",
    "quiz_avg_time_taken",
    "training_record_count",
    "training_completed_count",
    "training_completion_rate",
    "training_avg_progress",
    "phishing_data_available",
    "phishing_attempt_count",
    "phishing_click_count",
    "phishing_click_rate",
    "phishing_credentials_entered_count",
    "phishing_reported_count",
]

COUNT_FEATURES = {
    "quiz_attempt_count",
    "quiz_valid_percentage_count",
    "training_record_count",
    "training_completed_count",
    "phishing_attempt_count",
    "phishing_click_count",
    "phishing_credentials_entered_count",
    "phishing_reported_count",
}
PERCENTAGE_FEATURES = {
    "quiz_avg_percentage",
    "quiz_best_percentage",
    "quiz_latest_percentage",
    "training_avg_progress",
}
RATE_FEATURES = {"training_completion_rate", "phishing_click_rate"}
BOOLEAN_FEATURES = {"phishing_data_available"}

app = Flask(__name__)


def model_available() -> bool:
    return MODEL_PATH.is_file()


def load_mongodb_uri() -> str:
    """Read the existing MongoDB URI, falling back to the server env file."""
    uri = os.getenv("MONGODB_URI")
    if uri:
        return uri

    env_path = ROOT / "server" / ".env"
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            if line.startswith("MONGODB_URI="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")

    raise RuntimeError("MONGODB_URI was not found in the environment or server/.env")


def save_prediction_record(prediction: dict[str, Any]) -> dict[str, Any]:
    """Persist a prediction to the existing AIPrediction collection with audit metadata."""
    uri = load_mongodb_uri()
    client = MongoClient(uri, serverSelectionTimeoutMS=10_000)
    try:
        database = client.get_default_database()
        if database is None:
            database = client["hfap"]
        collection = database["aipredictions"]
        record = {
            "userId": prediction.get("userId"),
            "predictedRisk": prediction["predicted_risk"],
            "confidence": float(prediction["confidence"]),
            "modelVersion": prediction["model_version"],
            "generatedAt": datetime.now(timezone.utc),
        }
        result = collection.insert_one(record)
        return {"inserted_id": str(result.inserted_id), "record": record}
    finally:
        client.close()


def validate_features(payload: Any) -> tuple[dict[str, Any] | None, list[str]]:
    if not isinstance(payload, dict):
        return None, ["Request body must be a JSON object."]

    missing = [feature for feature in MODEL_FEATURES if feature not in payload]
    unknown = sorted(set(payload) - set(MODEL_FEATURES) - ALLOWED_EXTRA_FIELDS)
    errors: list[str] = []
    if missing:
        errors.append(f"Missing feature fields: {', '.join(missing)}.")
    if unknown:
        errors.append(f"Unknown feature fields: {', '.join(unknown)}.")

    cleaned: dict[str, Any] = {}
    if "userId" in payload:
        cleaned["userId"] = payload["userId"]

    for feature in MODEL_FEATURES:
        value = payload.get(feature)
        if value is None:
            cleaned[feature] = None
            continue
        if feature in BOOLEAN_FEATURES:
            if not isinstance(value, bool):
                errors.append(f"{feature} must be a boolean or null.")
            else:
                cleaned[feature] = value
            continue
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            errors.append(f"{feature} must be a number or null.")
            continue
        numeric_value = float(value)
        if not math.isfinite(numeric_value):
            errors.append(f"{feature} must be finite.")
            continue
        if feature in COUNT_FEATURES and (numeric_value < 0 or not numeric_value.is_integer()):
            errors.append(f"{feature} must be a non-negative integer.")
        elif feature in PERCENTAGE_FEATURES and not 0 <= numeric_value <= 100:
            errors.append(f"{feature} must be between 0 and 100.")
        elif feature in RATE_FEATURES and not 0 <= numeric_value <= 1:
            errors.append(f"{feature} must be between 0 and 1.")
        else:
            cleaned[feature] = numeric_value

    return (cleaned if not errors else None), errors


def load_model() -> Any:
    return joblib.load(MODEL_PATH)


@app.get("/health")
def health() -> Any:
    """Return service readiness and whether the trained model file is present.

    Response example:
    {
      "status": "ok",
      "service": "hfap-risk-prediction",
      "model_available": true,
      "model_version": "baseline-logistic-regression-v1"
    }
    """
    available = model_available()
    return jsonify(
        {
            "status": "ok",
            "service": "hfap-risk-prediction",
            "model_available": available,
            "model_version": MODEL_VERSION if available else None,
        }
    )


@app.post("/predict")
def predict() -> Any:
    """Predict an employee risk category from the cleaned feature vector.

    Request body example:
    {
      "quiz_attempt_count": 5,
      "quiz_valid_percentage_count": 5,
      "quiz_avg_percentage": 82.5,
      "quiz_best_percentage": 93,
      "quiz_latest_percentage": 88,
      "quiz_avg_time_taken": 212.5,
      "training_record_count": 3,
      "training_completed_count": 2,
      "training_completion_rate": 0.67,
      "training_avg_progress": 74,
      "phishing_data_available": false,
      "phishing_attempt_count": 0,
      "phishing_click_count": 0,
      "phishing_click_rate": 0,
      "phishing_credentials_entered_count": 0,
      "phishing_reported_count": 0
    }

    Success response example:
    {
      "predicted_risk": "Low",
      "confidence": 0.81,
      "model_version": "baseline-logistic-regression-v1"
    }
    """
    features, errors = validate_features(request.get_json(silent=True))
    if errors:
        return jsonify({"error": "invalid_features", "details": errors}), 400

    if not model_available():
        return (
            jsonify(
                {
                    "error": "model_unavailable",
                    "message": (
                        "Risk prediction is unavailable because the baseline model has not "
                        "been trained. Sufficient independently labeled employee data is unavailable."
                    ),
                    "model_available": False,
                    "model_path": str(MODEL_PATH),
                }
            ),
            503,
        )

    try:
        model = load_model()
        frame = pd.DataFrame([features], columns=MODEL_FEATURES)
        predicted_risk = str(model.predict(frame)[0])
        probabilities = model.predict_proba(frame)[0]
        confidence = float(max(probabilities))
    except Exception as error:
        app.logger.exception("Risk prediction failed")
        return jsonify({"error": "prediction_failed", "message": str(error)}), 500

    if predicted_risk not in RISK_CLASSES:
        return jsonify({"error": "prediction_failed", "message": "Model returned an invalid risk category."}), 500

    try:
        save_prediction_record(
            {
                "userId": features.get("userId"),
                "predicted_risk": predicted_risk,
                "confidence": confidence,
                "model_version": MODEL_VERSION,
            }
        )
    except Exception as error:
        app.logger.exception("Prediction persistence failed")
        return jsonify({"error": "prediction_persistence_failed", "message": str(error)}), 500

    return jsonify(
        {
            "predicted_risk": predicted_risk,
            "confidence": confidence,
            "model_version": MODEL_VERSION,
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("AI_SERVICE_PORT", "8000")))
