import React from "react";
import Select from "../common/Select";
import Input from "../common/Input";
import Button from "../common/Button";

/**
 * Filter bar above the equipment list/table. Kept as a
 * controlled component — parent page owns the filter state
 * and re-fetches/re-filters when it changes.
 *
 * Usage:
 *   const [filters, setFilters] = useState({ type: "", location: "", availability: "", search: "" });
 *   <EquipmentFilters filters={filters} onChange={setFilters} onReset={() => setFilters(initial)} />
 */
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
];

export default function EquipmentFilters({ filters, onChange, onReset }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="min-w-[180px] flex-1">
        <Input
          label="Search"
          name="search"
          placeholder="Search by name..."
          value={filters.search || ""}
          onChange={(e) => update("search", e.target.value)}
        />
      </div>

      <div className="w-40">
        <Select
          label="Type"
          name="type"
          value={filters.type || ""}
          onChange={(e) => update("type", e.target.value)}
          options={TYPE_OPTIONS}
          placeholder="All types"
        />
      </div>

      <div className="w-44">
        <Input
          label="Location"
          name="location"
          placeholder="e.g. Site B, Whitefield"
          value={filters.location || ""}
          onChange={(e) => update("location", e.target.value)}
        />
      </div>

      <div className="w-40">
        <Select
          label="Availability"
          name="availability"
          value={filters.availability || ""}
          onChange={(e) => update("availability", e.target.value)}
          options={AVAILABILITY_OPTIONS}
          placeholder="All statuses"
        />
      </div>

      <Button variant="outline" onClick={onReset}>
        Clear filters
      </Button>
    </div>
  );
}
