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

const UTILIZATION_COLOR = "#1b3a5c"; // blueprint
const IDLE_COLOR = "#dcd8cf"; // line

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
          <CartesianGrid strokeDasharray="2 4" stroke="#dcd8cf" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#5b6470", fontFamily: "IBM Plex Mono" }}
            axisLine={{ stroke: "#dcd8cf" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#5b6470", fontFamily: "IBM Plex Mono" }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            cursor={{ fill: "rgba(16,21,27,0.04)" }}
            formatter={(value, name) => [
              `${value}%`,
              name === "utilization" ? "Utilization" : "Idle",
            ]}
            contentStyle={{
              borderRadius: 2,
              fontSize: 12,
              border: "1px solid #dcd8cf",
              boxShadow: "none",
            }}
          />
          <Legend
            formatter={(value) => (value === "utilization" ? "Utilization" : "Idle")}
            wrapperStyle={{ fontSize: 12, color: "#5b6470" }}
          />
          <Bar dataKey="utilization" stackId="a" fill={UTILIZATION_COLOR} />
          <Bar dataKey="idle" stackId="a" fill={IDLE_COLOR} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}