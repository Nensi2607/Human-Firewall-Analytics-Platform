import unittest
from unittest.mock import MagicMock, patch

import app


class PredictionPersistenceTests(unittest.TestCase):
    def test_validate_features_allows_optional_user_id(self):
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
        self.assertEqual(errors, [])
        self.assertEqual(cleaned["userId"], payload["userId"])

    def test_save_prediction_record_includes_model_version_and_timestamp(self):
        mock_client = MagicMock()
        mock_db = MagicMock()
        mock_collection = MagicMock()
        mock_collection.insert_one.return_value.inserted_id = "abc123"
        mock_db.__getitem__.return_value = mock_collection
        mock_client.get_default_database.return_value = mock_db

        with patch("app.MongoClient", return_value=mock_client):
            result = app.save_prediction_record(
                {
                    "userId": "64e1d7a5c9d3b1a41a2b3c4d",
                    "predicted_risk": "Low",
                    "confidence": 0.96,
                    "model_version": "baseline-logistic-regression-v1",
                }
            )

        self.assertEqual(result["inserted_id"], "abc123")
        document = mock_collection.insert_one.call_args[0][0]
        self.assertEqual(document["predictedRisk"], "Low")
        self.assertEqual(document["modelVersion"], "baseline-logistic-regression-v1")
        self.assertIn("generatedAt", document)


if __name__ == "__main__":
    unittest.main()
