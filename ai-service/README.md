# HFAP Risk Prediction API

This Flask service serves the model produced by `ml/train_risk_model.py`. It does not train a model, create fake predictions, access MongoDB, or save anything to the `AIPrediction` collection.

## Start

From the repository root:

```powershell
python -m pip install -r ai-service/requirements.txt
python ai-service/app.py
```

The default base URL is `http://localhost:8000`. Set `AI_SERVICE_PORT` to use another port. Set `HFAP_MODEL_PATH` only when the model is stored somewhere other than the Step 2 default path:

```text
ml/data/processed/risk_model.joblib
```

## Health check

Request:

```http
GET http://localhost:8000/health
```

When the model is unavailable:

```json
{
  "status": "ok",
  "service": "hfap-risk-prediction",
  "model_available": false,
  "model_version": null
}
```

## Prediction

Request:

```http
POST http://localhost:8000/predict
Content-Type: application/json
```

The JSON body must contain all 16 model feature fields below. Numeric values may be `null` because the trained pipeline can impute missing values. Counts must be non-negative integers, percentages must be between 0 and 100, rates must be between 0 and 1, and `phishing_data_available` must be boolean or `null`.

```json
{
  "quiz_attempt_count": 2,
  "quiz_valid_percentage_count": 2,
  "quiz_avg_percentage": 50.0,
  "quiz_best_percentage": 67.0,
  "quiz_latest_percentage": 33.0,
  "quiz_avg_time_taken": null,
  "training_record_count": 4,
  "training_completed_count": 4,
  "training_completion_rate": 1.0,
  "training_avg_progress": 100.0,
  "phishing_data_available": false,
  "phishing_attempt_count": 0,
  "phishing_click_count": 0,
  "phishing_click_rate": null,
  "phishing_credentials_entered_count": 0,
  "phishing_reported_count": 0
}
```

When the model is unavailable, the endpoint returns HTTP `503` and does not return a fake category or confidence:

```json
{
  "error": "model_unavailable",
  "message": "Risk prediction is unavailable because the baseline model has not been trained. Sufficient independently labeled employee data is unavailable.",
  "model_available": false,
  "model_path": ".../ml/data/processed/risk_model.joblib"
}
```

With a trained model, a successful response is HTTP `200`:

```json
{
  "predicted_risk": "Medium",
  "confidence": 0.78,
  "model_version": "baseline-logistic-regression-v1"
}
```

Invalid input returns HTTP `400` with `error: "invalid_features"` and a `details` array. The current API intentionally does not persist prediction results.

## Node persistence flow

The authenticated MERN endpoint is the persistence boundary:

```http
POST http://localhost:5000/api/ai-predictions/predict
Authorization: Bearer <HFAP JWT>
Content-Type: application/json
```

Send the same feature JSON shown above, without an employee ID. The Node API takes the employee/user reference from the authenticated JWT, calls Flask `/predict`, validates the returned category, confidence, and model version, and then saves through the existing `AIPrediction` Mongoose model.

If Flask returns invalid input, an unavailable model, a timeout, or an invalid prediction payload, Node returns an error and does not insert an `AIPrediction` document. No test or synthetic prediction is generated.

Successful response, HTTP `201`:

```json
{
  "success": true,
  "data": {
    "id": "...",
    "userId": "...",
    "predictedRisk": "Medium",
    "confidence": 0.78,
    "modelVersion": "baseline-logistic-regression-v1",
    "generatedAt": "2026-09-21T12:00:00.000Z"
  }
}
```

Set `AI_SERVICE_URL` in the Node server environment when Flask is not running at `http://localhost:8000`. The Node server already uses `MONGODB_URI` through its existing database connection; this feature does not create another MongoDB connection.
