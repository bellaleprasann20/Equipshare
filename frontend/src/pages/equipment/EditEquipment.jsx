import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import ErrorMessage from "../../components/common/ErrorMessage";
import Loader from "../../components/common/Loader";
import { useEquipment } from "../../hooks/useEquipment";

const TYPE_OPTIONS = [
  { value: "excavator", label: "Excavator" },
  { value: "crane", label: "Crane" },
  { value: "bulldozer", label: "Bulldozer" },
  { value: "loader", label: "Loader" },
  { value: "concrete_mixer", label: "Concrete Mixer" },
  { value: "dump_truck", label: "Dump Truck" },
];

const EMPTY_FORM = {
  name: "",
  type: "",
  siteName: "",
  lat: "",
  lng: "",
  operatingCostPerDay: "",
  maintenanceIntervalDays: "90",
  lastServiceDate: "",
  purchaseDate: "",
};

export default function EditEquipment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { getById, updateEquipment } = useEquipment();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadEquipment = async () => {
      setLoading(true);
      setApiError("");

      try {
        const eq = await getById(id);

        if (cancelled) return;

        setForm({
          name: eq?.name || "",
          type: eq?.category || eq?.type || "",
          siteName:
            eq?.currentLocation?.siteName ||
            eq?.location ||
            "",
          lat: eq?.currentLocation?.lat ?? "",
          lng: eq?.currentLocation?.lng ?? "",
          operatingCostPerDay:
            eq?.totalMaintenanceCost ??
            eq?.operatingCostPerDay ??
            "",
          maintenanceIntervalDays:
            eq?.maintenanceIntervalDays ?? 90,
          lastServiceDate: eq?.lastServiceDate
            ? String(eq.lastServiceDate).slice(0, 10)
            : "",
          purchaseDate: eq?.purchaseDate
            ? String(eq.purchaseDate).slice(0, 10)
            : "",
        });
      } catch (err) {
        if (!cancelled) {
          setApiError(
            err?.response?.data?.message ||
              "Failed to load equipment record."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadEquipment();

    return () => {
      cancelled = true;
    };
  }, [id, getById]);

  const update = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setErrors((prev) => {
      if (!prev[key]) return prev;

      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = () => {
    const nextErrors = {};

    const lat = Number(form.lat);
    const lng = Number(form.lng);
    const operatingCost = Number(form.operatingCostPerDay);
    const maintenanceInterval = Number(form.maintenanceIntervalDays);

    if (!form.name.trim()) {
      nextErrors.name = "Enter equipment name";
    }

    if (!form.type) {
      nextErrors.type = "Select equipment category";
    }

    if (!form.siteName.trim()) {
      nextErrors.siteName = "Enter current site name";
    }

    if (
      form.lat === "" ||
      !Number.isFinite(lat) ||
      lat < -90 ||
      lat > 90
    ) {
      nextErrors.lat = "Latitude must be between -90 and 90";
    }

    if (
      form.lng === "" ||
      !Number.isFinite(lng) ||
      lng < -180 ||
      lng > 180
    ) {
      nextErrors.lng = "Longitude must be between -180 and 180";
    }

    if (
      form.operatingCostPerDay !== "" &&
      (!Number.isFinite(operatingCost) || operatingCost < 0)
    ) {
      nextErrors.operatingCostPerDay =
        "Enter a valid non-negative operating cost";
    }

    if (
      form.maintenanceIntervalDays === "" ||
      !Number.isFinite(maintenanceInterval) ||
      maintenanceInterval <= 0
    ) {
      nextErrors.maintenanceIntervalDays =
        "Maintenance interval must be greater than 0";
    }

    if (form.purchaseDate) {
      const purchaseDate = new Date(form.purchaseDate);

      if (
        Number.isNaN(purchaseDate.getTime()) ||
        purchaseDate > new Date()
      ) {
        nextErrors.purchaseDate =
          "Purchase date cannot be in the future";
      }
    }

    if (form.lastServiceDate) {
      const serviceDate = new Date(form.lastServiceDate);

      if (
        Number.isNaN(serviceDate.getTime()) ||
        serviceDate > new Date()
      ) {
        nextErrors.lastServiceDate =
          "Last service date cannot be in the future";
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setApiError("");
    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        category: form.type,
        currentLocation: {
          siteName: form.siteName.trim(),
          lat: Number(form.lat),
          lng: Number(form.lng),
        },
        totalMaintenanceCost:
          Number(form.operatingCostPerDay) || 0,
        maintenanceIntervalDays:
          Number(form.maintenanceIntervalDays) || 90,
        lastServiceDate: form.lastServiceDate || null,
        purchaseDate: form.purchaseDate || null,
      };

      await updateEquipment(id, payload);

      navigate("/admin/equipment");
    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
          "Failed to update equipment."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader label="Loading equipment details..." />;
  }

  if (!form && apiError) {
    return <ErrorMessage message={apiError} />;
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 bg-[#8b5cf6]" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a78bfa]">
              Fleet Administration
            </span>
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight text-white">
            Edit Fleet Asset
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Update equipment specifications, location and maintenance
            parameters.
          </p>
        </div>

        <span className="inline-flex w-fit items-center border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400">
          Admin Control
        </span>
      </div>

      {apiError && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <ErrorMessage message={apiError} />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-lg border border-[#2a2a2d] bg-[#1c1c1f]"
        style={{ colorScheme: "dark" }}
      >
        {/* Basic information */}
        <section className="border-b border-[#2a2a2d] p-6">
          <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-white">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="Equipment Name"
              name="name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              error={errors.name}
              required
            />

            <Select
              label="Category"
              name="type"
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              options={TYPE_OPTIONS}
              placeholder="Select category"
              error={errors.type}
              required
            />
          </div>
        </section>

        {/* Location */}
        <section className="border-b border-[#2a2a2d] p-6">
          <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-white">
            Current Location
          </h2>

          <div className="space-y-5">
            <Input
              label="Current Site Name"
              name="siteName"
              value={form.siteName}
              onChange={(e) => update("siteName", e.target.value)}
              error={errors.siteName}
              required
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                label="Latitude"
                name="lat"
                type="number"
                step="any"
                min="-90"
                max="90"
                value={form.lat}
                onChange={(e) => update("lat", e.target.value)}
                error={errors.lat}
                required
              />

              <Input
                label="Longitude"
                name="lng"
                type="number"
                step="any"
                min="-180"
                max="180"
                value={form.lng}
                onChange={(e) => update("lng", e.target.value)}
                error={errors.lng}
                required
              />
            </div>
          </div>
        </section>

        {/* Maintenance */}
        <section className="border-b border-[#2a2a2d] p-6">
          <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-white">
            Maintenance & Operating Metrics
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="Operating Cost / Day (₹)"
              name="operatingCostPerDay"
              type="number"
              min="0"
              step="0.01"
              value={form.operatingCostPerDay}
              onChange={(e) =>
                update("operatingCostPerDay", e.target.value)
              }
              error={errors.operatingCostPerDay}
            />

            <Input
              label="Maintenance Interval (days)"
              name="maintenanceIntervalDays"
              type="number"
              min="1"
              value={form.maintenanceIntervalDays}
              onChange={(e) =>
                update(
                  "maintenanceIntervalDays",
                  e.target.value
                )
              }
              error={errors.maintenanceIntervalDays}
              required
            />

            <Input
              label="Purchase Date"
              name="purchaseDate"
              type="date"
              value={form.purchaseDate}
              onChange={(e) =>
                update("purchaseDate", e.target.value)
              }
              error={errors.purchaseDate}
            />

            <Input
              label="Last Service Date"
              name="lastServiceDate"
              type="date"
              value={form.lastServiceDate}
              onChange={(e) =>
                update("lastServiceDate", e.target.value)
              }
              error={errors.lastServiceDate}
            />
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 p-6 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            type="button"
            onClick={() => navigate("/admin/equipment")}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={saving}
            className="border-none bg-[#8b5cf6] text-white hover:bg-[#7c3aed]"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}