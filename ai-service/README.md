# HFAP AI Service

This service exposes the trained employee risk model through a small Flask API.

## Start the service

```powershell
cd "C:\Users\nensi\OneDrive\Desktop\SGP\Human-Firewall-Analytics-Platform\ai-service"
python app.py
```

The API listens on port 8000 by default.

## Health check

### GET /health

Returns readiness information for the service and whether the model file exists.

Example response:

```json
{
  "status": "ok",
  "service": "hfap-risk-prediction",
  "model_available": true,
  "model_version": "baseline-logistic-regression-v1"
}
```

## Predict employee risk

### POST /predict

Accepts a JSON object containing the employee feature vector used by the model.
Optional field:

```json
{
  "userId": "64e1d7a5c9d3b1a41a2b3c4d"
}
```

When a valid prediction is generated, the API also writes a record to the MongoDB `AIPrediction` collection with:
- `userId` (when supplied)
- `predictedRisk`
- `confidence`
- `modelVersion`
- `generatedAt`
Required fields:

```json
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
```

Valid output:

```json
{
  "predicted_risk": "Low",
  "confidence": 0.81,
  "model_version": "baseline-logistic-regression-v1"
}
```

### Validation rules

- `phishing_data_available` must be a boolean.
- Count fields must be non-negative integers.
- Percentage fields must be between 0 and 100.
- Rate fields must be between 0 and 1.
- Unknown fields are rejected.

### Error example

```json
{
  "error": "invalid_features",
  "details": [
    "Missing feature fields: quiz_attempt_count."
  ]
}
```

When the API stores a prediction, the MongoDB record is shaped like:

```json
{
  "userId": "64e1d7a5c9d3b1a41a2b3c4d",
  "predictedRisk": "Low",
  "confidence": 0.9634677116038652,
  "modelVersion": "baseline-logistic-regression-v1",
  "generatedAt": "2026-09-25T13:25:19.000Z"
}
```
