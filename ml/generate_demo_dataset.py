"""
DEMO DATA GENERATOR - simulated employees, NOT real people.

Reads the column layout and the three class profiles (Low/Medium/High) from
ml/data/processed/synthetic_employee_features.csv, then generates many varied
employees around those profiles. Some features are borrowed from a neighbouring
class and a few labels are flipped, so classes overlap like real data would.

Output: ml/data/processed/employee_features.csv (the default input of
train_risk_model.py). Labels come from the simulated class, NOT from real
incidents. Anything trained on this is a demo baseline.
"""
import argparse
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent
SEED_CSV = ROOT / "data" / "processed" / "synthetic_employee_features.csv"
OUT_CSV = ROOT / "data" / "processed" / "employee_features.csv"

LABELS = ["Low", "Medium", "High"]
NEIGHBOURS = {"Low": ["Medium"], "Medium": ["Low", "High"], "High": ["Medium"]}
PERCENT_WORDS = ("average", "score", "progress", "percent", "completion")
COUNT_WORDS = ("count", "attempt", "click", "report", "open", "credential", "total")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--rows", type=int, default=300)
    ap.add_argument("--mix", type=float, default=0.25,
                    help="chance a feature is borrowed from a neighbouring class")
    ap.add_argument("--noise", type=float, default=0.15,
                    help="gaussian noise as a fraction of each column's range")
    ap.add_argument("--label-flip", type=float, default=0.05)
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()
    rng = np.random.default_rng(args.seed)

    seed = pd.read_csv(SEED_CSV)
    if "risk_label" not in seed.columns:
        raise SystemExit("risk_label column not found in the seed CSV")

    numeric = list(seed.select_dtypes(include="number").columns)
    profiles = seed.groupby("risk_label")[numeric].mean()
    missing = [l for l in LABELS if l not in profiles.index]
    if missing:
        raise SystemExit(f"Seed CSV has no rows for: {missing}")

    col_max = seed[numeric].max()
    col_range = (seed[numeric].max() - seed[numeric].min()).replace(0, 1.0)
    is_int = {
        c: bool((seed[c] == seed[c].round()).all()) and any(w in c.lower() for w in COUNT_WORDS)
        for c in numeric
    }

    def finalize(col, value):
        value = max(0.0, value)
        if col_max[col] <= 1.0:
            value = min(value, 1.0)
        elif any(w in col.lower() for w in PERCENT_WORDS):
            value = min(value, 100.0)
        if is_int[col]:
            return int(round(value))
        return round(float(value), 4)

    classes = rng.choice(LABELS, size=args.rows, p=[0.40, 0.35, 0.25])
    rows = []
    for i, true_class in enumerate(classes):
        row = {}
        for col in seed.columns:
            if col in numeric:
                src = true_class
                if rng.random() < args.mix:
                    src = rng.choice(NEIGHBOURS[true_class])
                mu = profiles.loc[src, col]
                sigma = max(abs(mu) * args.noise, col_range[col] * args.noise)
                row[col] = finalize(col, rng.normal(mu, sigma))
            elif col == "employee_id":
                row[col] = f"demo_{i + 1:04d}"
            elif col == "risk_label":
                label = true_class
                if rng.random() < args.label_flip:
                    label = rng.choice([l for l in LABELS if l != true_class])
                row[col] = label
            elif seed[col].dtype == bool:
                row[col] = False
            else:
                row[col] = ""
        rows.append(row)

    out = pd.DataFrame(rows, columns=seed.columns)
    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    out.to_csv(OUT_CSV, index=False)
    print(f"Wrote {len(out)} simulated employees to {OUT_CSV}")
    print(out["risk_label"].value_counts().to_string())


if __name__ == "__main__":
    main()