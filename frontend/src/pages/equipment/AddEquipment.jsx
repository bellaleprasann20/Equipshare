
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useEquipment } from "../../hooks/useEquipment";

const TYPE_OPTIONS = [
  { value: "excavator", label: "Excavator" },
  { value: "crane", label: "Crane" },
  { value: "bulldozer", label: "Bulldozer" },
  { value: "loader", label: "Loader" },
  { value: "concrete_mixer", label: "Concrete Mixer" },
  { value: "dump_truck", label: "Dump Truck" },
];

const initialState = {
  name: "",
  imageUrl: "",
  type: "",
  siteName: "",
  operatingCostPerDay: "",
  operatingHoursLast30Days: "0",
  idleHoursLast30Days: "0",
  totalJobsAssigned: "0",
  breakdownCount: "0",
  maintenanceIntervalDays: "90",
  purchaseDate: "",
  lastServiceDate: "",
};

function calculateAgeInYears(date) {
  if (!date) return 0;
  const purchased = new Date(date);
  if (Number.isNaN(purchased.getTime())) return 0;
  return Math.max(0, Number(
    ((Date.now() - purchased.getTime()) /
      (1000 * 60 * 60 * 24 * 365.25)).toFixed(2)
  ));
}

export default function AddEquipment() {
  const navigate = useNavigate();
  const { createEquipment } = useEquipment();

  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const machineAge = useMemo(
    () => calculateAgeInYears(form.purchaseDate),
    [form.purchaseDate]
  );

  const operatingHours = Number(form.operatingHoursLast30Days) || 0;
  const idleHours = Number(form.idleHoursLast30Days) || 0;
  const totalHours = operatingHours + idleHours;

  const recordedUtilization = totalHours > 0
    ? ((operatingHours / totalHours) * 100).toFixed(1)
    : null;

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = () => {
    const next = {};
    const numberFields = [
      "operatingHoursLast30Days",
      "idleHoursLast30Days",
      "totalJobsAssigned",
      "breakdownCount",
    ];

    if (!form.name.trim()) next.name = "Enter equipment name";
    if (!form.type) next.type = "Select equipment category";
    if (!form.siteName.trim()) next.siteName = "Enter current site name";

    if (
      form.imageUrl.trim() &&
      !/^https:\/\/\S+$/i.test(form.imageUrl.trim())
    ) {
      next.imageUrl = "Enter a valid public HTTPS image URL";
    }

    if (
      form.operatingCostPerDay === "" ||
      !Number.isFinite(Number(form.operatingCostPerDay)) ||
      Number(form.operatingCostPerDay) < 0
    ) {
      next.operatingCostPerDay = "Enter a valid non-negative operating cost";
    }

    numberFields.forEach((field) => {
      const value = Number(form[field]);
      if (form[field] === "" || !Number.isFinite(value) || value < 0) {
        next[field] = "Enter a valid non-negative value";
      }
    });

    ["totalJobsAssigned", "breakdownCount"].forEach((field) => {
      if (!Number.isInteger(Number(form[field]))) {
        next[field] = "Enter a whole number";
      }
    });

    if (Number(form.breakdownCount) > Number(form.totalJobsAssigned)) {
      next.breakdownCount = "Breakdowns cannot exceed total jobs assigned";
    }

    if (totalHours > 720) {
      next.operatingHoursLast30Days =
        "Operating and idle hours cannot exceed 720 hours in 30 days";
    }

    const interval = Number(form.maintenanceIntervalDays);
    if (!form.maintenanceIntervalDays || !Number.isFinite(interval) ||
        interval <= 0 || interval > 3650) {
      next.maintenanceIntervalDays =
        "Enter a maintenance interval between 1 and 3650 days";
    }

    if (!form.purchaseDate || new Date(form.purchaseDate) > new Date()) {
      next.purchaseDate = "Enter a valid purchase date that is not in the future";
    }

    if (form.lastServiceDate) {
      const service = new Date(form.lastServiceDate);
      if (service > new Date() || service < new Date(form.purchaseDate)) {
        next.lastServiceDate =
          "Service date must be between purchase date and today";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setApiError("");
    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        imageUrl: form.imageUrl.trim(),
        type: form.type,
        location: form.siteName.trim(),
        operatingCostPerDay: Number(form.operatingCostPerDay),
        operatingHoursLast30Days: operatingHours,
        idleHoursLast30Days: idleHours,
        totalJobsAssigned: Number(form.totalJobsAssigned),
        breakdownCount: Number(form.breakdownCount),
        maintenanceIntervalDays: Number(form.maintenanceIntervalDays),
        purchaseDate: form.purchaseDate,
        lastServiceDate: form.lastServiceDate || null,
      };

      await createEquipment(payload);
      navigate("/admin/equipment");
    } catch (err) {
      setApiError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to register equipment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 bg-[#8b5cf6]" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a78bfa]">
            Fleet Administration
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-white">
          Register Fleet Asset
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
          Register machinery and provide its operational, maintenance and cost
          information for EEI calculation and intelligent allocation.
        </p>
      </div>

      {apiError && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <ErrorMessage message={apiError} />
        </div>
      )}

      <form onSubmit={handleSubmit}
        className="overflow-hidden rounded-lg border border-[#2a2a2d] bg-[#1c1c1f]"
        style={{ colorScheme: "dark" }}>
        <section className="border-b border-[#2a2a2d] p-6">
          <div className="mb-5">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">
              Basic Information
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Identify the equipment and its category.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input label="Equipment Name" name="name"
              placeholder="e.g. CAT 320 Excavator" value={form.name}
              onChange={(e) => update("name", e.target.value)}
              error={errors.name} required />

            <Select label="Category" name="type" value={form.type}
              onChange={(e) => update("type", e.target.value)}
              options={TYPE_OPTIONS} placeholder="Select category"
              error={errors.type} required />

            <div className="sm:col-span-2">
              <Input label="Equipment Image URL (optional)" name="imageUrl"
                type="url" placeholder="https://example.com/equipment.jpg"
                value={form.imageUrl}
                onChange={(e) => update("imageUrl", e.target.value)}
                error={errors.imageUrl} />
            </div>
          </div>
        </section>

        <section className="border-b border-[#2a2a2d] p-6">
          <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-white">
            Current Location
          </h2>
          <Input label="Current Site Name" name="siteName"
            placeholder="e.g. Central Yard, Bengaluru" value={form.siteName}
            onChange={(e) => update("siteName", e.target.value)}
            error={errors.siteName} required />
        </section>

        <section className="border-b border-[#2a2a2d] p-6">
          <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-white">
            Utilization & Reliability
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {[
              ["Operating Hours (last 30 days)", "operatingHoursLast30Days"],
              ["Idle Hours (last 30 days)", "idleHoursLast30Days"],
              ["Total Jobs Assigned", "totalJobsAssigned"],
              ["Breakdown Count", "breakdownCount"],
            ].map(([label, field]) => (
              <Input key={field} label={label} name={field} type="number"
                min="0" step={field.includes("Hours") ? "0.1" : "1"}
                value={form[field]}
                onChange={(e) => update(field, e.target.value)}
                error={errors[field]} required />
            ))}
          </div>
          <div className="mt-5 border border-[#2a2a2d] bg-[#161618] px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-gray-500">
              Recorded Utilization
            </p>
            <p className="mt-1 font-mono text-lg font-semibold text-[#a78bfa]">
              {recordedUtilization !== null
                ? `${recordedUtilization}%` : "No operating history"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Operating hours divided by total recorded hours.
            </p>
          </div>
        </section>

        <section className="border-b border-[#2a2a2d] p-6">
          <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-white">
            Maintenance & Operating Metrics
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input label="Operating Cost / Day (₹)" name="operatingCostPerDay"
              type="number" min="0" step="0.01" placeholder="2500"
              value={form.operatingCostPerDay}
              onChange={(e) => update("operatingCostPerDay", e.target.value)}
              error={errors.operatingCostPerDay} required />

            <Input label="Maintenance Interval (days)"
              name="maintenanceIntervalDays" type="number" min="1" max="3650"
              value={form.maintenanceIntervalDays}
              onChange={(e) => update("maintenanceIntervalDays", e.target.value)}
              error={errors.maintenanceIntervalDays} required />

            <Input label="Purchase Date" name="purchaseDate" type="date"
              value={form.purchaseDate}
              onChange={(e) => update("purchaseDate", e.target.value)}
              error={errors.purchaseDate} required />

            <Input label="Last Service Date" name="lastServiceDate" type="date"
              value={form.lastServiceDate}
              onChange={(e) => update("lastServiceDate", e.target.value)}
              error={errors.lastServiceDate} />
          </div>
          {form.purchaseDate && (
            <div className="mt-5 border border-[#2a2a2d] bg-[#161618] px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-gray-500">
                Calculated Machine Age
              </p>
              <p className="mt-1 font-mono text-lg font-semibold text-[#a78bfa]">
                {machineAge.toFixed(2)} years
              </p>
            </div>
          )}
        </section>

        <section className="border-b border-[#2a2a2d] bg-[#161618] p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">
            How EEI is calculated
          </h2>
          <p className="mt-2 text-xs leading-6 text-gray-400">
            The system uses recorded utilization, reliability, maintenance,
            age and cost information to calculate an Equipment Efficiency
            Index between 0 and 100. The weighting methodology will be
            documented and validated as part of the project research.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Enter actual recorded values. Do not invent operating history.
          </p>
        </section>

        <div className="flex flex-col-reverse gap-3 p-6 sm:flex-row sm:justify-end">
          <Button variant="outline" type="button"
            onClick={() => navigate("/admin/equipment")}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}
            className="border-none bg-[#8b5cf6] text-white hover:bg-[#7c3aed]">
            Register Asset
          </Button>
        </div>
      </form>
    </div>
  );
}
