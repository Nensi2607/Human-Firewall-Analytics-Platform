import importlib.util
import inspect
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "ml" / "train_risk_model.py"

spec = importlib.util.spec_from_file_location("train_risk_model", MODULE_PATH)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class TrainRiskModelBaselineTests(unittest.TestCase):
    def test_model_path_uses_ml_models_directory(self):
        self.assertEqual(module.DEFAULT_MODEL, ROOT / "ml" / "models" / "risk_model.joblib")

    def test_choose_classifier_is_marked_as_baseline_subject_to_change(self):
        source = inspect.getsource(module.choose_classifier)
        self.assertIn("baseline — subject to change", source)

    def test_build_preprocessor_accepts_boolean_features(self):
        frame = module.pd.DataFrame({
            'quiz_avg_percentage': [80, 50, 25],
            'phishing_data_available': [True, False, True],
            'risk_label': ['Low', 'Medium', 'High'],
        })
        preprocessor = module.build_preprocessor(frame.drop(columns=['risk_label']))
        self.assertIsNotNone(preprocessor)


if __name__ == "__main__":
    unittest.main()
