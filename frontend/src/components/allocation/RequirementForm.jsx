import React, { useState } from "react";
import Select from "../common/Select";
import Input from "../common/Input";
import Button from "../common/Button";

/**
 * Form a project manager fills in to request equipment. On
 * submit, this is POSTed to the backend (POST /api/allocate),
 * which runs the EEI + ranking engine and returns a sorted
 * list of candidate equipment — rendered by RankingTable /
 * RecommendationCard on the Recommendations page.
 *
 * Expected shape of the object passed to onSubmit:
 *   {
 *     equipmentType: "excavator",
 *     projectLocation: "Site B, Whitefield",
 *     requiredFrom: "2026-09-15",
 *     requiredTo: "2026-10-01",
 *     maxTransferDistanceKm: 50,   // optional cutoff
 *     notes: "..."
 *   }
 *
 * Usage:
 *   <RequirementForm onSubmit={handleGetRecommendations} loading={loading} />
 */
const TYPE_OPTIONS = [
  { value: "excavator", label: "Excavator" },
  { value: "crane", label: "Crane" },
  { value: "bulldozer", label: "Bulldozer" },
  { value: "loader", label: "Loader" },
  { value: "concrete_mixer", label: "Concrete Mixer" },
  { value: "dump_truck", label: "Dump Truck" },
];

const initialState = {
  equipmentType: "",
  projectLocation: "",
  requiredFrom: "",
  requiredTo: "",
  maxTransferDistanceKm: "",
  notes: "",
};

export default function RequirementForm({ onSubmit, loading = false }) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const errs = {};
    if (!form.equipmentType) errs.equipmentType = "Select an equipment type";
    if (!form.projectLocation) errs.projectLocation = "Enter the project location";
    if (!form.requiredFrom) errs.requiredFrom = "Select a start date";
    if (!form.requiredTo) errs.requiredTo = "Select an end date";
    if (form.requiredFrom && form.requiredTo && form.requiredTo < form.requiredFrom) {
      errs.requiredTo = "End date must be after start date";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      maxTransferDistanceKm: form.maxTransferDistanceKm
        ? Number(form.maxTransferDistanceKm)
        : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-900">Request Equipment</h2>

      <Select
        label="Equipment Type"
        name="equipmentType"
        value={form.equipmentType}
        onChange={(e) => update("equipmentType", e.target.value)}
        options={TYPE_OPTIONS}
        placeholder="Select equipment type"
        error={errors.equipmentType}
        required
      />

      <Input
        label="Project Location"
        name="projectLocation"
        placeholder="e.g. Site B, Whitefield, Bengaluru"
        value={form.projectLocation}
        onChange={(e) => update("projectLocation", e.target.value)}
        error={errors.projectLocation}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Required From"
          name="requiredFrom"
          type="date"
          value={form.requiredFrom}
          onChange={(e) => update("requiredFrom", e.target.value)}
          error={errors.requiredFrom}
          required
        />
        <Input
          label="Required To"
          name="requiredTo"
          type="date"
          value={form.requiredTo}
          onChange={(e) => update("requiredTo", e.target.value)}
          error={errors.requiredTo}
          required
        />
      </div>

      <Input
        label="Max Transfer Distance (km) — optional"
        name="maxTransferDistanceKm"
        type="number"
        placeholder="e.g. 50"
        value={form.maxTransferDistanceKm}
        onChange={(e) => update("maxTransferDistanceKm", e.target.value)}
      />

      <Input
        label="Notes — optional"
        name="notes"
        placeholder="Any additional requirements"
        value={form.notes}
        onChange={(e) => update("notes", e.target.value)}
      />

      <Button type="submit" loading={loading} fullWidth>
        Get Recommendations
      </Button>
    </form>
  );
}
