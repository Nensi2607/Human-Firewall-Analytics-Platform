# HFAP Employee Feature Pipeline

Run from the repository root:

```powershell
python ml/build_employee_dataset.py
```

The script reads `MONGODB_URI` from the environment, or falls back to the existing `server/.env` file. It reads the existing MongoDB database through PyMongo; it does not create employee records, labels, predictions, or synthetic phishing events.

Outputs are written to the ignored directory `ml/data/processed/`:

- `employee_features.csv`: one row per employee represented by at least one primary telemetry collection.
- `pipeline_report.json`: source counts, feature columns, data-availability warnings, and the training-sufficiency decision.

## Feature calculations

All joins use `QuizResult.userId`, `TrainingProgress.userId`, and `PhishingAttempt.employeeId` (falling back to `PhishingAttempt.userId`). Invalid or missing IDs are excluded. Duplicate source documents are removed by Mongo `_id`.

- `quiz_attempt_count`: number of valid quiz documents for the employee.
- `quiz_valid_percentage_count`: quiz documents with a usable stored percentage or derivable percentage.
- `quiz_avg_percentage`: mean of usable percentages, clamped to 0-100.
- `quiz_best_percentage`: maximum usable percentage.
- `quiz_latest_percentage`: percentage from the latest quiz by completion/submission time.
- `quiz_avg_time_taken`: mean of non-negative numeric `timeTaken` values.
- `training_record_count`: number of training-progress documents.
- `training_completed_count`: count where `completed` is exactly true.
- `training_completion_rate`: completed count divided by training record count.
- `training_avg_progress`: mean of numeric progress values, clamped to 0-100.
- `phishing_data_available`: whether any real phishing attempt exists for the employee.
- `phishing_attempt_count`: number of real phishing attempts.
- `phishing_click_count`: count where `clicked` is exactly true.
- `phishing_click_rate`: click count divided by phishing attempt count.
- `phishing_credentials_entered_count`: count where `credentialsEntered` is exactly true.
- `phishing_reported_count`: count where `reported` is exactly true.
- `heuristic_risk_assessment_available`: whether a stored `RiskAssessment` can enrich the employee row.
- `heuristic_final_risk_score`: latest stored `finalRiskScore`; audit-only, not an ML label.
- `heuristic_risk_level`: latest stored `riskLevel`; audit-only, not an ML label.

Missing numeric values remain empty in the CSV. Phishing features remain empty/zero because the current collection has no real records; the pipeline reports this instead of failing.

The Kaggle files under `ml/data/raw/` are not read or mixed into employee rows. They have no HFAP employee IDs or employee outcomes. Use them separately for email-level phishing classification or feature-engineering experiments, then keep those experiments separate from this employee-risk dataset unless a validated mapping and target definition becomes available.

The pipeline does not train a model. Current real employee data is insufficient because the dataset is very small, phishing telemetry is absent, and current `RiskAssessment` values are outputs of the heuristic scoring formula rather than independent ground truth.

## Baseline training

Run the guarded classifier after building the dataset:

```powershell
python ml/train_risk_model.py
```

The trainer requires a real `risk_label` column containing `Low`, `Medium`, or `High`. It never uses `heuristic_risk_level` as a target. It requires at least 30 valid labeled employees and at least 5 employees in every present class before using a stratified 80/20 train/test split. The baseline algorithm is isolated in `choose_classifier()` and marked `baseline — subject to change`.

Every run writes `ml/data/processed/training_report.json`. A model is written to `ml/data/processed/risk_model.joblib` only after a valid training run; otherwise the report contains the skip reason and no accuracy is reported.
