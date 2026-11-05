import React, { useState } from "react";
import Select from "../common/Select";
import Input from "../common/Input";
import Button from "../common/Button";

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
  minEeiScore: "",
  notes: "",
};

export default function RequirementForm({
  onSubmit,
  loading = false,
}) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});

  const update = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setErrors((current) => ({
      ...current,
      [key]: "",
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.equipmentType) {
      nextErrors.equipmentType = "Select an equipment type";
    }

    if (!form.projectLocation.trim()) {
      nextErrors.projectLocation = "Enter the project location";
    }

    if (!form.requiredFrom) {
      nextErrors.requiredFrom = "Select a start date";
    }

    if (!form.requiredTo) {
      nextErrors.requiredTo = "Select an end date";
    }

    if (
      form.requiredFrom &&
      form.requiredTo &&
      form.requiredTo < form.requiredFrom
    ) {
      nextErrors.requiredTo =
        "End date must be after the start date";
    }

    if (form.maxTransferDistanceKm !== "") {
      const distance = Number(form.maxTransferDistanceKm);

      if (!Number.isFinite(distance) || distance <= 0) {
        nextErrors.maxTransferDistanceKm =
          "Enter a valid distance greater than 0";
      }
    }

    // Optional EEI filter: zero is a valid score.
    if (form.minEeiScore !== "") {
      const score = Number(form.minEeiScore);

      if (
        !Number.isFinite(score) ||
        score < 0 ||
        score > 100
      ) {
        nextErrors.minEeiScore =
          "Enter an EEI score between 0 and 100";
      }
    }

    if (form.notes.length > 1000) {
      nextErrors.notes = "Notes cannot exceed 1000 characters";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (loading || !validate()) return;

    onSubmit({
      equipmentType: form.equipmentType,
      projectLocation: form.projectLocation.trim(),
      requiredFrom: form.requiredFrom,
      requiredTo: form.requiredTo,
      maxTransferDistanceKm:
        form.maxTransferDistanceKm === ""
          ? null
          : Number(form.maxTransferDistanceKm),
      minEeiScore:
        form.minEeiScore === ""
          ? null
          : Number(form.minEeiScore),
      notes: form.notes.trim(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="panel flex flex-col gap-5 p-5"
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-signal">
          Smart Allocation
        </p>

        <h2 className="mt-1 font-display text-lg font-semibold text-ink">
          Define Project Requirement
        </h2>

        <p className="mt-1 text-xs leading-5 text-steel">
          Tell EquipShare what your project needs. The allocation
          engine evaluates suitable equipment using EEI, distance,
          cost and allocation duration.
        </p>
      </div>

      <Select
        label="Equipment Type"
        name="equipmentType"
        value={form.equipmentType}
        onChange={(event) =>
          update("equipmentType", event.target.value)
        }
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
        onChange={(event) =>
          update("projectLocation", event.target.value)
        }
        error={errors.projectLocation}
        required
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Required From"
          name="requiredFrom"
          type="date"
          value={form.requiredFrom}
          onChange={(event) =>
            update("requiredFrom", event.target.value)
          }
          error={errors.requiredFrom}
          required
        />

        <Input
          label="Required To"
          name="requiredTo"
          type="date"
          value={form.requiredTo}
          onChange={(event) =>
            update("requiredTo", event.target.value)
          }
          error={errors.requiredTo}
          required
        />
      </div>

      <Input
        label="Maximum Transfer Distance (km)"
        name="maxTransferDistanceKm"
        type="number"
        min="0.1"
        step="0.1"
        placeholder="e.g. 50"
        value={form.maxTransferDistanceKm}
        onChange={(event) =>
          update("maxTransferDistanceKm", event.target.value)
        }
        error={errors.maxTransferDistanceKm}
      />

      <p className="-mt-3 text-[11px] text-steel-light">
        Optional. Limits recommendations to equipment within
        this transfer distance.
      </p>

      {/* Optional EEI filter */}
      <div className="rounded-lg border border-[#2a2a2d] bg-[#161618] p-4">
        <Input
          label="Minimum EEI Score (0–100)"
          name="minEeiScore"
          type="number"
          min="0"
          max="100"
          step="0.1"
          placeholder="Leave empty to include all scores"
          value={form.minEeiScore}
          onChange={(event) =>
            update("minEeiScore", event.target.value)
          }
          error={errors.minEeiScore}
        />

        <p className="mt-2 text-[11px] leading-5 text-gray-500">
          Optional filter. For example, entering 70 includes
          equipment with an EEI score of 70 or higher.
          Leaving it empty applies no minimum EEI restriction.
        </p>
      </div>

      <div>
        <Input
          label="Notes"
          name="notes"
          placeholder="Any additional project requirements"
          value={form.notes}
          onChange={(event) =>
            update("notes", event.target.value)
          }
          error={errors.notes}
        />

        <p className="mt-1 text-right text-[10px] text-steel-light">
          {form.notes.length}/1000
        </p>
      </div>

      <Button
        type="submit"
        loading={loading}
        fullWidth
      >
        Run Smart Allocation
      </Button>
    </form>
  );
}