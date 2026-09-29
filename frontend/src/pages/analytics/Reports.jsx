import React, { useState } from "react";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useAnalytics } from "../../hooks/useAnalytics";

const REPORT_OPTIONS = [
  { value: "utilization", label: "Utilization Summary" },
  { value: "maintenance", label: "Maintenance Summary" },
  { value: "allocation", label: "Allocation Performance" },
  { value: "cost", label: "Cost Summary" },
];

const RANGE_OPTIONS = [
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last 12 months" },
];

/**
 * Lets an admin generate and download a report (CSV/PDF) for a
 * given period — useful for the guide/panel demo and as raw
 * evidence for the research paper's results tables.
 *
 * Expects useAnalytics() to expose:
 *   generateReport({ type, rangeDays }) -> Promise<{ downloadUrl }>
 */
export default function Reports() {
  const { generateReport } = useAnalytics();

  const [reportType, setReportType] = useState("utilization");
  const [rangeDays, setRangeDays] = useState("30");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setError("");
    setLoading(true);
    try {
      const { downloadUrl } = await generateReport({ type: reportType, rangeDays: Number(rangeDays) });
      window.open(downloadUrl, "_blank");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Reports</h1>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5">
        <Select
          label="Report Type"
          name="reportType"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          options={REPORT_OPTIONS}
        />
        <Select
          label="Date Range"
          name="rangeDays"
          value={rangeDays}
          onChange={(e) => setRangeDays(e.target.value)}
          options={RANGE_OPTIONS}
        />
        <Button onClick={handleGenerate} loading={loading} fullWidth>
          Generate Report
        </Button>
      </div>
    </div>
  );
}
