import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// EquipShare theme tokens.
// Recharts cannot reliably consume Tailwind/CSS variables directly.
const COLORS = {
  utilization: "#7c5cfc",
  idle: "#333338",
  axis: "#9a9aa1",
  grid: "#333338",
  tooltipBackground: "#232327",
  tooltipBorder: "#333338",
  tooltipText: "#e8e8ea",
};

function clampPercentage(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.min(100, Math.max(0, number));
}

function normalizeData(data) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item, index) => ({
      ...item,

      // Keep the existing backend contract:
      // label, utilization, idle
      label: item?.label || `Item ${index + 1}`,

      utilization: clampPercentage(item?.utilization),

      idle:
        item?.idle !== undefined && item?.idle !== null
          ? clampPercentage(item.idle)
          : clampPercentage(100 - Number(item?.utilization || 0)),
    }))
    .filter((item) => item.label);
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className="min-w-[160px] border border-line bg-surface px-3 py-2 shadow-xl"
      style={{
        color: COLORS.tooltipText,
      }}
    >
      <p className="mb-2 text-xs font-semibold text-ink">
        {label}
      </p>

      <div className="space-y-1.5">
        {payload.map((entry) => {
          const name =
            entry.dataKey === "utilization"
              ? "Utilization"
              : "Idle";

          return (
            <div
              key={entry.dataKey}
              className="flex items-center justify-between gap-4 text-xs"
            >
              <span className="text-steel">
                {name}
              </span>

              <span className="font-mono font-semibold text-ink">
                {Number(entry.value).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function UtilizationChart({
  data = [],
  title = "Utilization Overview",
  height = 320,
}) {
  const chartData = useMemo(
    () => normalizeData(data),
    [data]
  );

  if (chartData.length === 0) {
    return (
      <div
        className="panel flex min-h-[220px] items-center justify-center p-8"
        aria-label="Utilization chart has no data"
      >
        <div className="text-center">
          <p className="font-display text-sm font-semibold text-ink">
            {title}
          </p>

          <p className="mt-1 text-xs text-steel">
            No utilization data available yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section
      className="panel p-5"
      aria-label={title}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-signal">
            Fleet Analytics
          </p>

          <h3 className="mt-1 font-display text-base font-semibold text-ink">
            {title}
          </h3>
        </div>

        <span className="font-mono text-[10px] text-steel-light">
          0–100%
        </span>
      </div>

      <ResponsiveContainer
        width="100%"
        height={height}
      >
        <BarChart
          data={chartData}
          margin={{
            top: 8,
            right: 12,
            left: 0,
            bottom: 8,
          }}
          barCategoryGap="24%"
        >
          <CartesianGrid
            strokeDasharray="2 4"
            stroke={COLORS.grid}
            vertical={false}
          />

          <XAxis
            dataKey="label"
            tick={{
              fontSize: 11,
              fill: COLORS.axis,
              fontFamily: "IBM Plex Mono",
            }}
            axisLine={{
              stroke: COLORS.grid,
            }}
            tickLine={false}
            tickMargin={8}
          />

          <YAxis
            domain={[0, 100]}
            tickCount={6}
            tick={{
              fontSize: 11,
              fill: COLORS.axis,
              fontFamily: "IBM Plex Mono",
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
            width={42}
          />

          <Tooltip
            cursor={{
              fill: "rgba(124, 92, 252, 0.08)",
            }}
            content={<CustomTooltip />}
          />

          <Legend
            verticalAlign="bottom"
            height={28}
            iconType="square"
            iconSize={8}
            formatter={(value) =>
              value === "utilization"
                ? "Utilization"
                : "Idle"
            }
            wrapperStyle={{
              fontSize: 11,
              color: COLORS.axis,
              fontFamily: "IBM Plex Mono",
            }}
          />

          <Bar
            dataKey="utilization"
            name="utilization"
            stackId="utilization"
            fill={COLORS.utilization}
            radius={[2, 2, 0, 0]}
            maxBarSize={48}
          />

          <Bar
            dataKey="idle"
            name="idle"
            stackId="utilization"
            fill={COLORS.idle}
            radius={[0, 0, 2, 2]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}