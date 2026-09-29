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
  location: "",
  operatingCostPerDay: "",
  maintenanceIntervalDays: 90,
  lastServiceDate: "",
  purchaseDate: "",
};

/**
 * Form to add a new piece of equipment to the fleet. These raw
 * fields (age via purchaseDate, operatingCostPerDay, maintenance
 * interval) are exactly what eeiCalculator.js needs as inputs —
 * so this form is effectively where EEI's raw data enters the
 * system. Admin-only page (route should be role-guarded).
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
    if (!form.location) errs.location = "Enter current location";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError("");
    setLoading(true);
    try {
      const created = await createEquipment(form);
      navigate(`/equipment/${created._id}`);
    } catch (err) {
      setApiError(err?.response?.data?.message || "Failed to add equipment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Add Equipment</h1>

      {apiError && (
        <div className="mb-4">
          <ErrorMessage message={apiError} />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5"
      >
        <Input
          label="Equipment Name"
          name="name"
          placeholder="e.g. Excavator EX-12"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          error={errors.name}
          required
        />

        <Select
          label="Type"
          name="type"
          value={form.type}
          onChange={(e) => update("type", e.target.value)}
          options={TYPE_OPTIONS}
          placeholder="Select type"
          error={errors.type}
          required
        />

        <Input
          label="Current Location"
          name="location"
          placeholder="e.g. Site B, Whitefield"
          value={form.location}
          onChange={(e) => update("location", e.target.value)}
          error={errors.location}
          required
        />

        <div className="grid grid-cols-2 gap-4">
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
            label="Last Service Date"
            name="lastServiceDate"
            type="date"
            value={form.lastServiceDate}
            onChange={(e) => update("lastServiceDate", e.target.value)}
          />
          <Input
            label="Purchase Date"
            name="purchaseDate"
            type="date"
            value={form.purchaseDate}
            onChange={(e) => update("purchaseDate", e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={() => navigate("/equipment")}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Add Equipment
          </Button>
        </div>
      </form>
    </div>
  );
}
