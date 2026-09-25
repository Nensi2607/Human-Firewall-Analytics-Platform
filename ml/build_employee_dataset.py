"""Build employee-level ML features from the HFAP MongoDB collections.

This script extracts real application telemetry only. It does not create
employee records, labels, predictions, or synthetic phishing events.

The MongoDB URI is read from MONGODB_URI, or from server/.env when the
variable is not already present. The script uses its own short-lived PyMongo
client because Python cannot reuse the Node/Mongoose process connection; it
still reuses the existing database and URI rather than defining a second
configuration.
"""

from __future__ import annotations

import argparse
import json
import math
import os
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import pandas as pd
from bson import ObjectId
from pymongo import MongoClient


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "ml" / "data" / "processed" / "employee_features.csv"
DEFAULT_REPORT = ROOT / "ml" / "data" / "processed" / "pipeline_report.json"


def load_mongodb_uri() -> str:
    """Read the existing connection setting without adding another config."""
    uri = os.getenv("MONGODB_URI")
    if uri:
        return uri

    env_path = ROOT / "server" / ".env"
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            if line.startswith("MONGODB_URI="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")

    raise RuntimeError("MONGODB_URI was not found in the environment or server/.env")


def finite_number(value: Any) -> float | None:
    """Return a finite float, treating null, booleans, and bad values as missing."""
    if isinstance(value, bool) or value is None:
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) else None


def valid_employee_id(value: Any) -> str | None:
    """Accept only valid Mongo ObjectIds for employee-level joins."""
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, str) and ObjectId.is_valid(value):
        return str(ObjectId(value))
    return None


def percentage(result: dict[str, Any]) -> float | None:
    """Use stored percentage, otherwise derive it from correct/total answers."""
    stored = finite_number(result.get("percentage"))
    if stored is not None:
        return max(0.0, min(100.0, stored))

    correct = finite_number(result.get("correctAnswers"))
    total = finite_number(result.get("totalQuestions"))
    if correct is None or total is None or total <= 0:
        return None
    return max(0.0, min(100.0, correct / total * 100.0))


def deduplicate(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Drop repeated Mongo documents by _id while preserving source order."""
    unique: dict[str, dict[str, Any]] = {}
    for record in records:
        record_id = record.get("_id")
        key = str(record_id) if record_id is not None else f"missing-{len(unique)}"
        unique.setdefault(key, record)
    return list(unique.values())


def mean_or_none(values: list[float]) -> float | None:
    return round(sum(values) / len(values), 4) if values else None


def build_features(
    quiz_results: list[dict[str, Any]],
    training_progress: list[dict[str, Any]],
    phishing_attempts: list[dict[str, Any]],
    risk_assessments: list[dict[str, Any]],
) -> pd.DataFrame:
    """Aggregate source records into one row per employee with usable IDs."""
    employees: dict[str, dict[str, Any]] = defaultdict(
        lambda: {"quiz": [], "training": [], "phishing": [], "risk": []}
    )

    for result in quiz_results:
        employee_id = valid_employee_id(result.get("userId"))
        if employee_id:
            employees[employee_id]["quiz"].append(result)

    for progress in training_progress:
        employee_id = valid_employee_id(progress.get("userId"))
        if employee_id:
            employees[employee_id]["training"].append(progress)

    for attempt in phishing_attempts:
        employee_id = valid_employee_id(attempt.get("employeeId")) or valid_employee_id(
            attempt.get("userId")
        )
        if employee_id:
            employees[employee_id]["phishing"].append(attempt)

    for assessment in risk_assessments:
        employee_id = valid_employee_id(assessment.get("userId"))
        if employee_id:
            employees[employee_id]["risk"].append(assessment)

    rows: list[dict[str, Any]] = []
    for employee_id, sources in sorted(employees.items()):
        if not sources["quiz"] and not sources["training"] and not sources["phishing"]:
            continue
        quiz_percentages = [
            value
            for result in sources["quiz"]
            if (value := percentage(result)) is not None
        ]
        quiz_times = [
            value
            for result in sources["quiz"]
            if (value := finite_number(result.get("timeTaken"))) is not None
            and value >= 0
        ]
        training_progress_values = [
            max(0.0, min(100.0, value))
            for progress in sources["training"]
            if (value := finite_number(progress.get("progress"))) is not None
        ]
        completed_values = [
            progress.get("completed") is True for progress in sources["training"]
        ]
        phishing = sources["phishing"]
        latest_quiz = max(
            sources["quiz"],
            key=lambda item: item.get("completedAt") or item.get("submittedAt") or datetime.min,
            default=None,
        )
        latest_quiz_percentage = percentage(latest_quiz) if latest_quiz else None
        latest_risk = max(
            sources["risk"],
            key=lambda item: item.get("assessedAt") or item.get("updatedAt") or datetime.min,
            default=None,
        )

        row = {
            "employee_id": employee_id,
            "quiz_attempt_count": len(sources["quiz"]),
            "quiz_valid_percentage_count": len(quiz_percentages),
            "quiz_avg_percentage": mean_or_none(quiz_percentages),
            "quiz_best_percentage": max(quiz_percentages) if quiz_percentages else None,
            "quiz_latest_percentage": latest_quiz_percentage,
            "quiz_avg_time_taken": mean_or_none(quiz_times),
            "training_record_count": len(sources["training"]),
            "training_completed_count": sum(completed_values),
            "training_completion_rate": round(
                sum(completed_values) / len(completed_values), 4
            )
            if completed_values
            else None,
            "training_avg_progress": mean_or_none(training_progress_values),
            "phishing_data_available": bool(phishing),
            "phishing_attempt_count": len(phishing),
            "phishing_click_count": sum(item.get("clicked") is True for item in phishing),
            "phishing_click_rate": round(
                sum(item.get("clicked") is True for item in phishing) / len(phishing), 4
            )
            if phishing
            else None,
            "phishing_credentials_entered_count": sum(
                item.get("credentialsEntered") is True for item in phishing
            ),
            "phishing_reported_count": sum(item.get("reported") is True for item in phishing),
            "heuristic_risk_assessment_available": latest_risk is not None,
            "heuristic_final_risk_score": finite_number(
                latest_risk.get("finalRiskScore") if latest_risk else None
            ),
            "heuristic_risk_level": latest_risk.get("riskLevel") if latest_risk else None,
        }
        rows.append(row)

    return pd.DataFrame(rows)


def clean_dataframe(dataframe: pd.DataFrame) -> pd.DataFrame:
    """Normalize output types, remove invalid rows, and keep one row per employee."""
    if dataframe.empty:
        return dataframe
    dataframe = dataframe.drop_duplicates(subset=["employee_id"], keep="last")
    dataframe = dataframe[dataframe["employee_id"].map(valid_employee_id).notna()].copy()
    dataframe = dataframe.replace([math.inf, -math.inf], pd.NA)
    return dataframe.sort_values("employee_id").reset_index(drop=True)


def serialize_records(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Make Mongo values safe for the JSON verification report."""
    return [{key: str(value) if isinstance(value, ObjectId) else value for key, value in record.items()} for record in records]


def run(output_path: Path, report_path: Path) -> dict[str, Any]:
    uri = load_mongodb_uri()
    client = MongoClient(uri, serverSelectionTimeoutMS=10_000)
    try:
        database = client.get_default_database()
        if database is None:
            raise RuntimeError("MONGODB_URI does not specify a default database")
        collections = {
            "QuizResult": database["quizresults"],
            "TrainingProgress": database["trainingprogresses"],
            "PhishingAttempt": database["phishingattempts"],
            "RiskAssessment": database["riskassessments"],
        }
        raw = {
            "QuizResult": deduplicate(list(collections["QuizResult"].find({}))),
            "TrainingProgress": deduplicate(list(collections["TrainingProgress"].find({}))),
            "PhishingAttempt": deduplicate(list(collections["PhishingAttempt"].find({}))),
            "RiskAssessment": deduplicate(list(collections["RiskAssessment"].find({}))),
        }
        dataframe = clean_dataframe(
            build_features(
                raw["QuizResult"],
                raw["TrainingProgress"],
                raw["PhishingAttempt"],
                raw["RiskAssessment"],
            )
        )
    finally:
        client.close()

    output_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    dataframe.to_csv(output_path, index=False)

    report = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "records_pulled": {name: len(records) for name, records in raw.items()},
        "usable_employees": len(dataframe),
        "final_dataframe_columns": list(dataframe.columns),
        "phishing_data_available": bool(raw["PhishingAttempt"]),
        "phishing_message": (
            "Real phishing data is currently unavailable; phishing features are empty."
            if not raw["PhishingAttempt"]
            else "Real phishing records were included by employee ID."
        ),
        "kaggle_bridge_data_used": False,
        "kaggle_message": (
            "Files under ml/data/raw are bridge/development data only and were not mixed "
            "into employee records. Use them separately to prototype email-level classifiers "
            "or feature engineering; they lack HFAP employee IDs and outcomes."
        ),
        "risk_label_message": (
            "RiskAssessment fields are retained as audit-only heuristic outputs, not "
            "independent ML ground truth labels."
        ),
        "ml_training_sufficient": False,
        "ml_training_message": (
            "Do not train yet: this pipeline has too few real employee histories and no "
            "independent target labels; collect more longitudinal quiz, training, and phishing data."
        ),
    }
    report_path.write_text(json.dumps(report, indent=2, default=str), encoding="utf-8")
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--report", type=Path, default=DEFAULT_REPORT)
    args = parser.parse_args()
    report = run(args.output, args.report)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
