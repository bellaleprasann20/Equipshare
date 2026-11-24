import { env } from "../config/environment.js";

const REQUEST_TIMEOUT_MS = 5000;

/**
 * Convert MongoDB equipment data into FastAPI model input.
 */
function toAIInput(equipment, fleetCostRange) {
  const data =
    typeof equipment.toObject === "function"
      ? equipment.toObject()
      : equipment;

  return {
    equipment_type: data.type,
    operating_hours: Number(data.operatingHoursLast30Days || 0),
    idle_hours: Number(data.idleHoursLast30Days || 0),
    total_jobs: Number(data.totalJobsAssigned || 0),
    breakdown_count: Number(data.breakdownCount || 0),

    purchase_date: data.purchaseDate
      ? new Date(data.purchaseDate).toISOString().slice(0, 10)
      : null,

    last_service_date: data.lastServiceDate
      ? new Date(data.lastServiceDate).toISOString().slice(0, 10)
      : null,

    maintenance_interval_days: Number(
      data.maintenanceIntervalDays || 90
    ),

    operating_cost_per_day: Number(
      data.operatingCostPerDay || 0
    ),

    fleet_cost_min: Number(fleetCostRange?.min || 0),
    fleet_cost_max: Number(fleetCostRange?.max || 0),
  };
}

/**
 * Get AI-generated EEI score from FastAPI.
 * Returns null if the AI service is unavailable or invalid.
 */
export async function predictEEIWithAI(
  equipment,
  fleetCostRange
) {
  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS
  );

  try {
    const response = await fetch(
      `${env.ML_SERVICE_URL}/predict`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          toAIInput(equipment, fleetCostRange)
        ),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      throw new Error(
        `AI service returned HTTP ${response.status}`
      );
    }

    const result = await response.json();
    const score = Number(result?.prediction?.eei_score);

    if (
      result?.success !== true ||
      !Number.isFinite(score) ||
      score < 0 ||
      score > 100
    ) {
      throw new Error("AI service returned an invalid EEI prediction.");
    }

    return {
      score: Math.round(score * 10) / 10,
      condition: result.prediction.condition,
      model: result.prediction.model,
      featuresUsed: result.prediction.features_used,
      source: "AI",
    };
  } catch (error) {
    console.error(
      "[EEI AI] Prediction unavailable; using formula fallback:",
      error.message
    );

    return null;
  } finally {
    clearTimeout(timeout);
  }
}
