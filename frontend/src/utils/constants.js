/**
 * Shared constants — equipment types, roles, statuses. Kept in
 * one place so EquipmentFilters, AddEquipment, EditEquipment,
 * RequirementForm, etc. all stay in sync instead of each
 * hardcoding their own copy of the options list.
 */

export const EQUIPMENT_TYPES = [
  { value: "excavator", label: "Excavator" },
  { value: "crane", label: "Crane" },
  { value: "bulldozer", label: "Bulldozer" },
  { value: "loader", label: "Loader" },
  { value: "concrete_mixer", label: "Concrete Mixer" },
  { value: "dump_truck", label: "Dump Truck" },
];

export const AVAILABILITY_STATUSES = [
  { value: "available", label: "Available" },
  { value: "in_use", label: "In Use" },
];

export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
};

export const ALLOCATION_STATUSES = {
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const EEI_BANDS = {
  EXCELLENT: { min: 80, label: "Excellent" },
  GOOD: { min: 60, label: "Good" },
  FAIR: { min: 40, label: "Fair" },
  POOR: { min: 0, label: "Poor" },
};

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_MAINTENANCE_INTERVAL_DAYS = 90;
