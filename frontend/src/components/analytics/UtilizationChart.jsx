import React from "react";
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

// Matches the current --theme tokens in index.css. Recharts can't
// read CSS custom properties directly, so these are kept as plain
// hex and must be updated by hand if index.css colors change again.
const UTILIZATION_COLOR = "#7c5cfc"; // signal
const IDLE_COLOR = "#333338"; // line
const AXIS_TEXT_COLOR = "#9a9aa1"; // steel
const TOOLTIP_BG = "#232327"; // surface
const TOOLTIP_BORDER = "#333338"; // line
const TOOLTIP_TEXT = "#e8e8ea"; // ink

export default function UtilizationChart({
  data = [],
  title = "Utilization Overview",
  height = 320,
}) {
  if (data.length === 0) {
    return (
      <div className="panel flex items-center justify-center p-8 text-sm text-steel">
        No utilization data yet.
      </div>
    );
  }

  return (
    <div className="panel p-5">
      <h3 className="mb-4 font-display text-base font-semibold text-ink">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="2 4" stroke={IDLE_COLOR} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: AXIS_TEXT_COLOR, fontFamily: "IBM Plex Mono" }}
            axisLine={{ stroke: IDLE_COLOR }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: AXIS_TEXT_COLOR, fontFamily: "IBM Plex Mono" }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            cursor={{ fill: "rgba(124,92,252,0.08)" }}
            formatter={(value, name) => [
              `${value}%`,
              name === "utilization" ? "Utilization" : "Idle",
            ]}
            contentStyle={{
              borderRadius: 2,
              fontSize: 12,
              backgroundColor: TOOLTIP_BG,
              border: `1px solid ${TOOLTIP_BORDER}`,
              color: TOOLTIP_TEXT,
              boxShadow: "none",
            }}
            labelStyle={{ color: TOOLTIP_TEXT }}
            itemStyle={{ color: TOOLTIP_TEXT }}
          />
          <Legend
            formatter={(value) => (value === "utilization" ? "Utilization" : "Idle")}
            wrapperStyle={{ fontSize: 12, color: AXIS_TEXT_COLOR }}
          />
          <Bar dataKey="utilization" stackId="a" fill={UTILIZATION_COLOR} />
          <Bar dataKey="idle" stackId="a" fill={IDLE_COLOR} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}