 /**
  * Equipment Efficiency Index (EEI) Calculator
  * ============================================
  *
  * EEI =
  *
  *   Utilization
  *   Reliability
  *   Maintenance
  *   Age
  *   Cost Efficiency
  *
  * Each factor is normalized to 0-100 before applying
  * the configured weights.
  *
  * The current default weights are the learned weights
  * supplied by the project methodology.
  */

export const DEFAULT_WEIGHTS = Object.freeze({
  utilization: 0.2663,
  reliability: 0.3513,
  maintenance: 0.2008,
  age: 0.0666,
  cost: 0.1149,
});

/**
 * Utilization factor.
 *
 * Uses the last 30 days:
 *
 * operating / (operating + idle) × 100
 */
function computeUtilizationScore(
  equipment
) {
  const operatingHours = nonNegativeNumber(
    equipment?.operatingHoursLast30Days
  );

  const idleHours = nonNegativeNumber(
    equipment?.idleHoursLast30Days
  );

  const totalHours =
    operatingHours + idleHours;

  /*
   * No utilization history.
   *
   * Neutral value rather than automatically treating
   * missing data as failure.
   */
  if (totalHours === 0) {
    return 50;
  }

  return clamp(
    (operatingHours / totalHours) *
      100,
    0,
    100
  );
}

/**
 * Reliability factor.
 *
 * Breakdown rate:
 *
 * breakdownCount / totalJobsAssigned
 *
 * 0 breakdowns = 100
 * 50% breakdown rate = 0
 */
function computeReliabilityScore(
  equipment
) {
  const breakdownCount =
    nonNegativeNumber(
      equipment?.breakdownCount
    );

  const totalJobs =
    nonNegativeNumber(
      equipment?.totalJobsAssigned
    );

  /*
   * No job history.
   *
   * Use a neutral/mildly positive default.
   */
  if (totalJobs === 0) {
    return 70;
  }

  const breakdownRate =
    breakdownCount / totalJobs;

  return clamp(
    100 -
      breakdownRate * 200,
    0,
    100
  );
}

/**
 * Maintenance factor.
 *
 * Compares days since last service against
 * the equipment's maintenance interval.
 */
function computeMaintenanceScore(
  equipment
) {
  const maintenanceInterval =
    nonNegativeNumber(
      equipment?.maintenanceIntervalDays
    );

  if (
    maintenanceInterval <= 0
  ) {
    return 40;
  }

  if (!equipment?.lastServiceDate) {
    return 40;
  }

  const serviceDate =
    new Date(
      equipment.lastServiceDate
    );

  if (
    Number.isNaN(
      serviceDate.getTime()
    )
  ) {
    return 40;
  }

  const now = Date.now();

  /*
   * Future service dates should not produce
   * a score above 100.
   */
  const millisecondsSince =
    Math.max(
      0,
      now - serviceDate.getTime()
    );

  const daysSince =
    millisecondsSince /
    (1000 * 60 * 60 * 24);

  const ratio =
    daysSince /
    maintenanceInterval;

  return clamp(
    100 - ratio * 100,
    0,
    100
  );
}

/**
 * Age factor.
 *
 * Uses a 10-year reference curve.
 */
function computeAgeScore(
  equipment,
  maxAgeYears = 10
) {
  if (!equipment?.purchaseDate) {
    return 60;
  }

  const purchaseDate =
    new Date(
      equipment.purchaseDate
    );

  if (
    Number.isNaN(
      purchaseDate.getTime()
    )
  ) {
    return 60;
  }

  const millisecondsSince =
    Math.max(
      0,
      Date.now() -
        purchaseDate.getTime()
    );

  const ageYears =
    millisecondsSince /
    (1000 * 60 * 60 * 24 * 365);

  return clamp(
    100 -
      (ageYears /
        maxAgeYears) *
        100,
    0,
    100
  );
}

/**
 * Cost efficiency.
 *
 * Lower operating cost = higher score.
 */
function computeCostScore(
  equipment,
  fleetCostRange
) {
  const cost =
    nonNegativeNumber(
      equipment?.operatingCostPerDay
    );

  const min =
    Number(fleetCostRange?.min);

  const max =
    Number(fleetCostRange?.max);

  /*
   * If fleet cost data is unavailable or has
   * no variation, use neutral score.
   */
  if (
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    max <= min
  ) {
    return 70;
  }

  const normalized =
    (cost - min) /
    (max - min);

  return clamp(
    100 -
      normalized * 100,
    0,
    100
  );
}

/**
 * Main EEI calculation.
 *
 * @param {Object} equipment
 * @param {{min:number,max:number}|null} fleetCostRange
 * @param {Object} weights
 *
 * @returns {{
 *   score:number,
 *   breakdown:Object
 * }}
 */
export function calculateEEI(
  equipment,
  fleetCostRange = null,
  weights = DEFAULT_WEIGHTS
) {
  const safeWeights =
    normalizeWeights(weights);

  const breakdown = {
    utilization:
      computeUtilizationScore(
        equipment
      ),

    reliability:
      computeReliabilityScore(
        equipment
      ),

    maintenance:
      computeMaintenanceScore(
        equipment
      ),

    age:
      computeAgeScore(
        equipment
      ),

    cost:
      computeCostScore(
        equipment,
        fleetCostRange
      ),
  };

  const score =
    breakdown.utilization *
      safeWeights.utilization +

    breakdown.reliability *
      safeWeights.reliability +

    breakdown.maintenance *
      safeWeights.maintenance +

    breakdown.age *
      safeWeights.age +

    breakdown.cost *
      safeWeights.cost;

  return {
    score: roundToOneDecimal(
      clamp(score, 0, 100)
    ),

    breakdown: {
      utilization:
        roundToOneDecimal(
          breakdown.utilization
        ),

      reliability:
        roundToOneDecimal(
          breakdown.reliability
        ),

      maintenance:
        roundToOneDecimal(
          breakdown.maintenance
        ),

      age:
        roundToOneDecimal(
          breakdown.age
        ),

      cost:
        roundToOneDecimal(
          breakdown.cost
        ),
    },
  };
}

/**
 * Calculate the fleet-wide cost range once.
 *
 * This prevents calculating min/max for every equipment
 * candidate separately.
 */
export function computeFleetCostRange(
  equipmentList
) {
  if (
    !Array.isArray(equipmentList) ||
    equipmentList.length === 0
  ) {
    return {
      min: 0,
      max: 0,
    };
  }

  const costs = equipmentList
    .map((equipment) =>
      Number(
        equipment?.operatingCostPerDay
      )
    )
    .filter(
      (cost) =>
        Number.isFinite(cost) &&
        cost >= 0
    );

  if (costs.length === 0) {
    return {
      min: 0,
      max: 0,
    };
  }

  return {
    min: Math.min(...costs),
    max: Math.max(...costs),
  };
}

/**
 * Normalize custom weights.
 *
 * This allows future experiments with AHP,
 * learned weights, or alternative models.
 */
function normalizeWeights(weights) {
  const raw = {
    utilization: Number(
      weights?.utilization
    ),

    reliability: Number(
      weights?.reliability
    ),

    maintenance: Number(
      weights?.maintenance
    ),

    age: Number(
      weights?.age
    ),

    cost: Number(
      weights?.cost
    ),
  };

  const values = Object.values(raw);

  const valid =
    values.every(
      (value) =>
        Number.isFinite(value) &&
        value >= 0
    );

  if (!valid) {
    return DEFAULT_WEIGHTS;
  }

  const total = values.reduce(
    (sum, value) =>
      sum + value,
    0
  );

  if (total <= 0) {
    return DEFAULT_WEIGHTS;
  }

  /*
   * Normalize so the weights always sum to 1.
   */
  return {
    utilization:
      raw.utilization / total,

    reliability:
      raw.reliability / total,

    maintenance:
      raw.maintenance / total,

    age:
      raw.age / total,

    cost:
      raw.cost / total,
  };
}

/**
 * Convert invalid/negative numbers to 0.
 */
function nonNegativeNumber(value) {
  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    number < 0
  ) {
    return 0;
  }

  return number;
}

/**
 * Clamp number to range.
 */
function clamp(
  value,
  min,
  max
) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return min;
  }

  return Math.min(
    max,
    Math.max(min, number)
  );
}

/**
 * Round to one decimal place.
 */
function roundToOneDecimal(
  value
) {
  return (
    Math.round(value * 10) /
    10
  );
}