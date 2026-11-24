from datetime import date
from typing import Optional, Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from app.predict import predict_eei, load_model


app = FastAPI(
    title="EquipShare AI Service",
    description="Machine learning service for Equipment Efficiency Index prediction.",
    version="1.0.0",
)


class EquipmentInput(BaseModel):
    equipment_type: Literal[
        "excavator",
        "crane",
        "bulldozer",
        "loader",
        "concrete_mixer",
        "dump_truck",
    ]

    operating_hours: float = Field(default=0, ge=0)
    idle_hours: float = Field(default=0, ge=0)
    total_jobs: float = Field(default=0, ge=0)
    breakdown_count: float = Field(default=0, ge=0)

    purchase_date: Optional[date] = None
    last_service_date: Optional[date] = None

    maintenance_interval_days: float = Field(default=90, ge=0)
    operating_cost_per_day: float = Field(default=0, ge=0)
    fleet_cost_min: float = Field(default=0, ge=0)
    fleet_cost_max: float = Field(default=0, ge=0)


@app.get("/")
def root():
    return {
        "service": "EquipShare AI Service",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/health")
def health():
    try:
        load_model()

        return {
            "status": "healthy",
            "model_loaded": True,
        }
    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail=str(error),
        )


@app.post("/predict")
def predict(equipment: EquipmentInput):
    try:
        result = predict_eei(equipment.model_dump(mode="json"))

        return {
            "success": True,
            "prediction": result,
        }

    except FileNotFoundError as error:
        raise HTTPException(status_code=503, detail=str(error))

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"EEI prediction failed: {str(error)}",
        )

