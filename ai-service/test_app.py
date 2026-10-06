import unittest
import unittest
from pathlib import Path
from unittest.mock import patch

import app


class PredictionPersistenceTests(unittest.TestCase):
    def test_health_reports_missing_model_as_unavailable(self):
        missing_model = Path(__file__).with_name("missing-risk-model.joblib")
        with patch.object(app, "MODEL_PATH", missing_model):
            response = app.app.test_client().get("/health")

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.get_json()["model_available"])
        self.assertIsNone(response.get_json()["model_version"])

    def test_validate_features_rejects_user_id_from_client(self):
        payload = {
            "userId": "64e1d7a5c9d3b1a41a2b3c4d",
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
            "phishing_data_available": False,
            "phishing_attempt_count": 0,
            "phishing_click_count": 0,
            "phishing_click_rate": 0,
            "phishing_credentials_entered_count": 0,
            "phishing_reported_count": 0,
        }
        cleaned, errors = app.validate_features(payload)
        self.assertIsNone(cleaned)
        self.assertIn("Unknown feature fields: userId.", errors)


if __name__ == "__main__":
    unittest.main()
