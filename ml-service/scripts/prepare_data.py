import json
from pathlib import Path
from datetime import datetime, timezone

import pandas as pd


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "backend" / "data" / "syntheticDataset.json"
OUTPUT = ROOT / "ml-service" / "data" / "eei_training_data.csv"

WEIGHTS = {
    "utilization": 0.2663,
    "reliability": 0.3513,
    "maintenance": 0.2008,
    "age": 0.0666,
    "cost": 0.1149,
}

weight_total = sum(WEIGHTS.values())
WEIGHTS = {key: value / weight_total for key, value in WEIGHTS.items()}

NOW = datetime.now(timezone.utc)


def safe_number(value):
    try:
        number = float(value)
        return max(0.0, number) if pd.notna(number) else 0.0
    except (TypeError, ValueError):
        return 0.0


def parse_date(value):
    if not value:
        return None

    date = pd.to_datetime(value, utc=True, errors="coerce")

    if pd.isna(date):
        return None

    return date.to_pydatetime()


def clamp(value, minimum=0.0, maximum=100.0):
    return max(minimum, min(maximum, value))


def calculate_reference_scores(record, fleet_min, fleet_max):
    operating = safe_number(record.get("operatingHoursLast30Days"))
    idle = safe_number(record.get("idleHoursLast30Days"))

    total_hours = operating + idle

    utilization = (
        50.0 if total_hours == 0
        else clamp((operating / total_hours) * 100)
    )

    jobs = safe_number(record.get("totalJobsAssigned"))
    breakdowns = safe_number(record.get("breakdownCount"))

    reliability = (
        70.0 if jobs == 0
        else clamp(100 - (breakdowns / jobs) * 200)
    )

    interval = safe_number(record.get("maintenanceIntervalDays"))
    service_date = parse_date(record.get("lastServiceDate"))

    if interval <= 0 or service_date is None:
        maintenance = 40.0
        days_since_service = 0.0
        has_service_date = 0
    else:
        days_since_service = max(
            0.0, (NOW - service_date).total_seconds() / 86400
        )
        maintenance = clamp(
            100 - (days_since_service / interval) * 100
        )
        has_service_date = 1

    purchase_date = parse_date(record.get("purchaseDate"))

    if purchase_date is None:
        age_years = 0.0
        age = 60.0
        has_purchase_date = 0
    else:
        age_years = max(
            0.0, (NOW - purchase_date).total_seconds() / (86400 * 365)
        )
        age = clamp(100 - (age_years / 10) * 100)
        has_purchase_date = 1

    cost = safe_number(record.get("operatingCostPerDay"))

    if fleet_max <= fleet_min:
        cost_score = 70.0
    else:
        cost_score = clamp(
            100 - ((cost - fleet_min) / (fleet_max - fleet_min)) * 100
        )

    factors = {
        "utilization": utilization,
        "reliability": reliability,
        "maintenance": maintenance,
        "age": age,
        "cost": cost_score,
    }

    eei = sum(factors[name] * WEIGHTS[name] for name in WEIGHTS)

    return {
        "equipment_type": str(record.get("type") or "unknown"),
        "operating_hours": operating,
        "idle_hours": idle,
        "total_jobs": jobs,
        "breakdown_count": breakdowns,
        "days_since_service": days_since_service,
        "maintenance_interval_days": interval,
        "has_service_date": has_service_date,
        "age_years": age_years,
        "has_purchase_date": has_purchase_date,
        "operating_cost_per_day": cost,
        "utilization_score": utilization,
        "reliability_score": reliability,
        "maintenance_score": maintenance,
        "age_score": age,
        "cost_score": cost_score,
        "eei_score": round(clamp(eei), 1),
    }


def main():
    if not SOURCE.exists():
        raise FileNotFoundError(f"Dataset not found: {SOURCE}")

    with SOURCE.open("r", encoding="utf-8") as file:
        records = json.load(file)

    if isinstance(records, dict):
        records = records.get("equipment", [])

    if not isinstance(records, list) or not records:
        raise ValueError("The source dataset is empty or has an invalid format.")

    costs = [
        safe_number(record.get("operatingCostPerDay"))
        for record in records
    ]

    fleet_min = min(costs)
    fleet_max = max(costs)

    rows = [
        calculate_reference_scores(record, fleet_min, fleet_max)
        for record in records
    ]

    dataframe = pd.DataFrame(rows)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    dataframe.to_csv(OUTPUT, index=False)

    print("\nEEI training dataset prepared successfully.")
    print(f"Source records: {len(records)}")
    print(f"Training rows: {len(dataframe)}")
    print(f"Fleet cost range: {fleet_min:.2f} - {fleet_max:.2f}")
    print(f"Average reference EEI: {dataframe['eei_score'].mean():.2f}")
    print(f"Minimum reference EEI: {dataframe['eei_score'].min():.2f}")
    print(f"Maximum reference EEI: {dataframe['eei_score'].max():.2f}")
    print(f"\nSaved to: {OUTPUT}")


if __name__ == "__main__":
    main()



