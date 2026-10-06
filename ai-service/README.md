# HFAP AI Service

This service exposes a validated employee-risk model through a small Flask API. It is stateless: the Node.js backend builds feature vectors, associates predictions with authenticated users, and persists successful predictions.

## Start the service

```powershell
cd "C:\Users\nensi\OneDrive\Desktop\SGP\Human-Firewall-Analytics-Platform\ai-service"
python app.py
```

The API listens on port 8000 by default. The default model path is the generated, git-ignored `ml/data/processed/risk_model.joblib`. The guarded trainer writes there only when it has sufficient real employee records and independent risk labels. The tracked models under `ml/models/` are not used by default because they are synthetic development artifacts.

Set `HFAP_MODEL_PATH` only when deliberately deploying a separately validated model artifact. Do not point it at the synthetic development model.

## Health check

### GET /health

Returns readiness information for the service and whether the validated model file exists. The API can be healthy while prediction is unavailable because no eligible model has been trained.

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
The service accepts only the feature fields below. Unknown fields such as user IDs are rejected; identity and persistence remain the Node.js backend's responsibility.
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

The Node.js backend stores successful predictions in the MongoDB `AIPrediction` collection with the authenticated employee ID, model version, confidence, and generation time. The Flask service itself does not access MongoDB.

If no eligible model file exists, `/predict` responds with HTTP 503. Do not use synthetic training reports or model artifacts as evidence of real employee prediction performance.
