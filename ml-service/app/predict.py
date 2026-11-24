from datetime import datetime, timezone
from pathlib import Path

import joblib
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "model" / "eei_random_forest.joblib"

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

CATEGORICAL_FEATURES = ["equipment_type"]

_model = None


def load_model():
    global _model

    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                "Trained EEI model not found. Run scripts/train.py first."
            )

        _model = joblib.load(MODEL_PATH)

    return _model


def safe_number(value):
    try:
        number = float(value)
        return max(0.0, number) if pd.notna(number) else 0.0
    except (TypeError, ValueError):
        return 0.0


def clamp(value, minimum=0.0, maximum=100.0):
    return max(minimum, min(maximum, value))


def parse_date(value):
    if value is None:
        return None

    parsed = pd.to_datetime(value, utc=True, errors="coerce")

    if pd.isna(parsed):
        return None

    return parsed.to_pydatetime()


def prepare_features(equipment):
    now = datetime.now(timezone.utc)

    purchase_date = parse_date(equipment.get("purchase_date"))
    service_date = parse_date(equipment.get("last_service_date"))

    age_years = (
        max(0.0, (now - purchase_date).total_seconds() / (86400 * 365))
        if purchase_date else 0.0
    )

    days_since_service = (
        max(0.0, (now - service_date).total_seconds() / 86400)
        if service_date else 0.0
    )

    cost = safe_number(equipment.get("operating_cost_per_day"))
    fleet_min = safe_number(equipment.get("fleet_cost_min"))
    fleet_max = safe_number(equipment.get("fleet_cost_max"))

    if fleet_max <= fleet_min:
        cost_score = 70.0
    else:
        cost_score = clamp(
            100 - ((cost - fleet_min) / (fleet_max - fleet_min)) * 100
        )

    features = {
        "operating_hours": safe_number(
            equipment.get("operating_hours")
        ),
        "idle_hours": safe_number(
            equipment.get("idle_hours")
        ),
        "total_jobs": safe_number(
            equipment.get("total_jobs")
        ),
        "breakdown_count": safe_number(
            equipment.get("breakdown_count")
        ),
        "days_since_service": days_since_service,
        "maintenance_interval_days": safe_number(
            equipment.get("maintenance_interval_days")
        ),
        "has_service_date": int(service_date is not None),
        "age_years": age_years,
        "has_purchase_date": int(purchase_date is not None),
        "operating_cost_per_day": cost,
        "cost_score": cost_score,
        "equipment_type": str(
            equipment.get("equipment_type") or "unknown"
        ).lower(),
    }

    return features


def predict_eei(equipment):
    model = load_model()

    features = prepare_features(equipment)

    dataframe = pd.DataFrame(
        [features],
        columns=NUMERIC_FEATURES + CATEGORICAL_FEATURES,
    )

    prediction = float(model.predict(dataframe)[0])
    score = round(clamp(prediction), 1)

    if score >= 80:
        condition = "Excellent"
    elif score >= 65:
        condition = "Good"
    elif score >= 45:
        condition = "Moderate"
    elif score >= 25:
        condition = "Poor"
    else:
        condition = "Critical"

    return {
        "eei_score": score,
        "condition": condition,
        "model": "RandomForestRegressor",
        "features_used": features,
    }
