import React, { useState } from "react";

import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import ErrorMessage from "../../components/common/ErrorMessage";

import { useAnalytics } from "../../hooks/useAnalytics";

const REPORT_OPTIONS = [
  {
    value: "utilization",
    label: "Utilization Summary",
  },
  {
    value: "maintenance",
    label: "Maintenance Summary",
  },
  {
    value: "allocation",
    label: "Allocation Performance",
  },
  {
    value: "cost",
    label: "Cost Summary",
  },
];

const RANGE_OPTIONS = [
  {
    value: "30",
    label: "Last 30 days",
  },
  {
    value: "90",
    label: "Last 90 days",
  },
  {
    value: "365",
    label: "Last 12 months",
  },
];

export default function Reports() {
  const { generateReport } = useAnalytics();

  const [reportType, setReportType] =
    useState("utilization");

  const [rangeDays, setRangeDays] =
    useState("30");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleGenerate = async () => {
    setError("");
    setSuccess("");

    if (!reportType || !rangeDays) {
      setError("Please select a report type and date range.");
      return;
    }

    setLoading(true);

    try {
      const response = await generateReport({
        type: reportType,
        rangeDays: Number(rangeDays),
      });

      const downloadUrl =
        response?.downloadUrl ||
        response?.url ||
        response?.data?.downloadUrl;

      if (!downloadUrl) {
        throw new Error(
          "Report was generated, but no download link was returned."
        );
      }

      setSuccess("Report generated successfully.");

      window.open(
        downloadUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to generate report."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* PAGE HEADER */}
      <section className="mb-8 border-b border-[#2a2a2d] pb-7">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 bg-[#8b5cf6]" />

          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a78bfa]">
            Fleet Intelligence
          </span>
        </div>

        <h1 className="font-display text-3xl font-bold tracking-tight text-white">
          Reports
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
          Generate fleet performance reports for utilization,
          maintenance, allocation and cost analysis.
        </p>
      </section>

      {/* ERROR */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div className="mb-5 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {success}
        </div>
      )}

      {/* REPORT FORM */}
      <div className="rounded-lg border border-[#2a2a2d] bg-[#1c1c1f] p-6 sm:p-7">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a78bfa]">
            Report Generator
          </p>

          <h2 className="mt-1 font-display text-xl font-bold text-white">
            Generate Fleet Report
          </h2>

          <p className="mt-1 text-sm leading-6 text-gray-500">
            Select the report category and reporting period.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <Select
            label="Report Type"
            name="reportType"
            value={reportType}
            onChange={(event) =>
              setReportType(event.target.value)
            }
            options={REPORT_OPTIONS}
          />

          <Select
            label="Date Range"
            name="rangeDays"
            value={rangeDays}
            onChange={(event) =>
              setRangeDays(event.target.value)
            }
            options={RANGE_OPTIONS}
          />

          <div className="border-t border-[#2a2a2d] pt-5">
            <Button
              onClick={handleGenerate}
              loading={loading}
              disabled={loading}
              fullWidth
              className="border-none bg-[#8b5cf6] text-white hover:bg-[#7c3aed]"
            >
              {loading
                ? "Generating Report..."
                : "Generate Report"}
            </Button>
          </div>
        </div>
      </div>

      {/* REPORT TYPES */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <ReportInfo
          title="Utilization"
          description="Fleet usage and idle-time performance."
        />

        <ReportInfo
          title="Maintenance"
          description="Maintenance activity and equipment condition."
        />

        <ReportInfo
          title="Allocation"
          description="Smart allocation performance and results."
        />

        <ReportInfo
          title="Cost"
          description="Equipment and fleet cost information."
        />
      </div>
    </div>
  );
}

function ReportInfo({ title, description }) {
  return (
    <div className="rounded-lg border border-[#2a2a2d] bg-[#1c1c1f] p-4">
      <h3 className="text-sm font-semibold text-white">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-gray-500">
        {description}
      </p>
    </div>
  );
}