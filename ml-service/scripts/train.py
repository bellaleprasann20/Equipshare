import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = ROOT / "ml-service" / "data" / "eei_training_data.csv"
MODEL_DIR = ROOT / "ml-service" / "model"
MODEL_PATH = MODEL_DIR / "eei_random_forest.joblib"
METRICS_PATH = MODEL_DIR / "training_metrics.json"

TARGET = "eei_score"

NUMERIC_FEATURES = [
    "operating_hours",
    "idle_hours",
    "total_jobs",
    "breakdown_count",
    "days_since_service",
    "maintenance_interval_days",
    "has_service_date",
    "age_years",
    "has_purchase_date",
    "operating_cost_per_day",
    "cost_score",
]

CATEGORICAL_FEATURES = [
    "equipment_type",
]


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Training data not found: {DATA_PATH}. "
            "Run prepare_data.py first."
        )

    dataframe = pd.read_csv(DATA_PATH)

    required_columns = NUMERIC_FEATURES + CATEGORICAL_FEATURES + [TARGET]
    missing = [
        column for column in required_columns
        if column not in dataframe.columns
    ]

    if missing:
        raise ValueError(f"Missing training columns: {missing}")

    if len(dataframe) < 20:
        raise ValueError("At least 20 records are required for training.")

    dataframe = dataframe.dropna(subset=[TARGET]).copy()

    X = dataframe[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y = dataframe[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
    )

    preprocessing = ColumnTransformer(
        transformers=[
            ("numeric", "passthrough", NUMERIC_FEATURES),
            (
                "categorical",
                OneHotEncoder(handle_unknown="ignore"),
                CATEGORICAL_FEATURES,
            ),
        ]
    )

    model = Pipeline(
        steps=[
            ("preprocessing", preprocessing),
            (
                "regressor",
                RandomForestRegressor(
                    n_estimators=500,
                    max_depth=None,
                    min_samples_leaf=2,
                    random_state=42,
                    n_jobs=-1,
                ),
            ),
        ]
    )

    print("Training Random Forest model...")
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    predictions = np.clip(predictions, 0, 100)

    mae = mean_absolute_error(y_test, predictions)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))
    r2 = r2_score(y_test, predictions)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    joblib.dump(model, MODEL_PATH)

    metrics = {
        "model": "RandomForestRegressor",
        "training_records": int(len(X_train)),
        "testing_records": int(len(X_test)),
        "total_records": int(len(dataframe)),
        "mae": round(float(mae), 4),
        "rmse": round(float(rmse), 4),
        "r2": round(float(r2), 4),
        "target": TARGET,
        "features": NUMERIC_FEATURES + CATEGORICAL_FEATURES,
        "random_state": 42,
    }

    with METRICS_PATH.open("w", encoding="utf-8") as file:
        json.dump(metrics, file, indent=4)

    print("\nModel training completed.")
    print(f"Training records: {len(X_train)}")
    print(f"Testing records: {len(X_test)}")
    print(f"MAE:  {mae:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"R2:   {r2:.4f}")

    print(f"\nModel saved: {MODEL_PATH}")
    print(f"Metrics saved: {METRICS_PATH}")

    print(
        "\nNote: These metrics measure how well the model "
        "approximates the reference EEI scoring policy. "
        "They do not establish real-world predictive accuracy."
    )


if __name__ == "__main__":
    main()



