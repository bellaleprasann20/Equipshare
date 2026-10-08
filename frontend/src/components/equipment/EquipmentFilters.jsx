import React from "react";
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

const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "in_use", label: "In Use" },
  { value: "reserved", label: "Reserved" },
];

export default function EquipmentFilters({
  filters = {},
  onChange,
  onReset,
}) {
  const update = (key, value) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <section className="border border-zinc-800 bg-[#1c1c1f] p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-sm font-semibold text-white">
            Filter equipment
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Narrow the fleet by type, location, and availability.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
        >
          Clear filters
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Input
          label="Search"
          name="search"
          placeholder="Search equipment..."
          value={filters.search || ""}
          onChange={(e) => update("search", e.target.value)}
        />

        <Select
          label="Equipment type"
          name="type"
          value={filters.type || ""}
          onChange={(e) => update("type", e.target.value)}
          options={TYPE_OPTIONS}
          placeholder="All types"
        />

        <Input
          label="Location"
          name="location"
          placeholder="e.g. Site B, Whitefield"
          value={filters.location || ""}
          onChange={(e) => update("location", e.target.value)}
        />

        <Select
          label="Availability"
          name="availability"
          value={filters.availability || ""}
          onChange={(e) => update("availability", e.target.value)}
          options={AVAILABILITY_OPTIONS}
          placeholder="All statuses"
        />
      </div>
    </section>
  );
}