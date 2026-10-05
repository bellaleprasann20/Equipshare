import React, { useState } from "react";
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
  type: "",
  // Location now matches the Mongoose Schema structure we defined earlier
  siteName: "",
  lat: "",
  lng: "",
  
  operatingCostPerDay: "",
  maintenanceIntervalDays: 90,
  lastServiceDate: "",
  purchaseDate: "",
};

/**
 * Form to add a new piece of equipment to the fleet. These raw
 * fields (age via purchaseDate, operatingCostPerDay, maintenance
 * interval) are exactly what the Random Forest AI needs as inputs.
 * Admin-only page (route is role-guarded in AppRoutes).
 */
export default function AddEquipment() {
  const navigate = useNavigate();
  const { createEquipment } = useEquipment();

  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = "Enter equipment name";
    if (!form.type) errs.type = "Select equipment type";
    if (!form.siteName) errs.siteName = "Enter current site name";
    if (!form.lat || isNaN(form.lat)) errs.lat = "Enter valid latitude";
    if (!form.lng || isNaN(form.lng)) errs.lng = "Enter valid longitude";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError("");
    setLoading(true);

    try {
      // Format the payload to match the backend Mongoose Schema requirements
      const payload = {
        name: form.name,
        category: form.type,
        currentLocation: {
          siteName: form.siteName,
          lat: Number(form.lat),
          lng: Number(form.lng),
        },
        totalMaintenanceCost: Number(form.operatingCostPerDay) || 0, // Mapping to schema
        machineAgeYears: calculateAgeInYears(form.purchaseDate),
        // Other default fields needed by the schema/AI can be initialized here
      };

      const created = await createEquipment(payload);
      navigate(`/equipment/manage`); // Route back to the Table View on success
    } catch (err) {
      setApiError(err?.response?.data?.message || "Failed to add equipment.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate age in years from purchase date
  const calculateAgeInYears = (purchaseDate) => {
    if (!purchaseDate) return 0;
    const diff = new Date() - new Date(purchaseDate);
    return Math.max(0, diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Register Fleet Asset</h1>
        <p className="text-sm text-steel mt-1">
          Add new machinery to the central database. Exact GPS coordinates are required for the AI routing engine.
        </p>
      </div>

      {apiError && (
        <div className="mb-4">
          <ErrorMessage message={apiError} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="panel flex flex-col gap-6 p-6 bg-surface border border-line rounded-lg">
        
        {/* Basic Info Section */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink mb-3 border-b border-line pb-2">Basic Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Equipment Name"
              name="name"
              placeholder="e.g. Cat 320 Excavator"
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
        </div>

        {/* Location Section */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink mb-3 border-b border-line pb-2">Geographic Location</h2>
          <Input
            label="Current Site Name"
            name="siteName"
            placeholder="e.g. Central Yard, Bengaluru"
            value={form.siteName}
            onChange={(e) => update("siteName", e.target.value)}
            error={errors.siteName}
            className="mb-4"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude"
              name="lat"
              type="number"
              step="any"
              placeholder="12.9716"
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
              placeholder="77.5946"
              value={form.lng}
              onChange={(e) => update("lng", e.target.value)}
              error={errors.lng}
              required
            />
          </div>
        </div>

        {/* Financial & Maintenance Section (AI Features) */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink mb-3 border-b border-line pb-2">AI Training Metrics</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              label="Operating Cost / Day (₹)"
              name="operatingCostPerDay"
              type="number"
              value={form.operatingCostPerDay}
              onChange={(e) => update("operatingCostPerDay", e.target.value)}
            />
            <Input
              label="Maintenance Interval (days)"
              name="maintenanceIntervalDays"
              type="number"
              value={form.maintenanceIntervalDays}
              onChange={(e) => update("maintenanceIntervalDays", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Purchase Date (For Age Calculation)"
              name="purchaseDate"
              type="date"
              value={form.purchaseDate}
              onChange={(e) => update("purchaseDate", e.target.value)}
            />
            <Input
              label="Last Service Date"
              name="lastServiceDate"
              type="date"
              value={form.lastServiceDate}
              onChange={(e) => update("lastServiceDate", e.target.value)}
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-line">
          <Button variant="outline" type="button" onClick={() => navigate("/equipment/manage")}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading} className="bg-signal text-white">
            Register Asset
          </Button>
        </div>
      </form>
    </div>
  );
}