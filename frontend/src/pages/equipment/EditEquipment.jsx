import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

/**
 * Edit an existing equipment record — same fields as
 * AddEquipment, pre-filled from the current record. Admin-only.
 */
export default function EditEquipment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, updateEquipment } = useEquipment();

  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getById(id)
      .then((eq) =>
        setForm({
          name: eq.name || "",
          type: eq.type || "",
          location: eq.location || "",
          operatingCostPerDay: eq.operatingCostPerDay || "",
          maintenanceIntervalDays: eq.maintenanceIntervalDays || 90,
          lastServiceDate: eq.lastServiceDate ? eq.lastServiceDate.slice(0, 10) : "",
          purchaseDate: eq.purchaseDate ? eq.purchaseDate.slice(0, 10) : "",
        })
      )
      .catch((err) => setApiError(err?.response?.data?.message || "Failed to load equipment."))
      .finally(() => setLoading(false));
  }, [id, getById]);

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
    setSaving(true);
    try {
      await updateEquipment(id, form);
      navigate(`/equipment/${id}`);
    } catch (err) {
      setApiError(err?.response?.data?.message || "Failed to update equipment.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading equipment..." />;
  if (!form) return apiError ? <ErrorMessage message={apiError} /> : null;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 font-display text-xl font-semibold text-ink">Edit Equipment</h1>

      {apiError && (
        <div className="mb-4">
          <ErrorMessage message={apiError} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="panel flex flex-col gap-4 p-5">
        <Input
          label="Equipment Name"
          name="name"
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
          error={errors.type}
          required
        />

        <Input
          label="Current Location"
          name="location"
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
          <Button variant="secondary" type="button" onClick={() => navigate(`/equipment/${id}`)}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}