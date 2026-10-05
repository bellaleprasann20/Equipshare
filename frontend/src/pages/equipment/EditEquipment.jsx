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
 * Edit an existing equipment record — matching the AddEquipment schema structure
 * with exact GPS coordinates for the AI proximity engine. Admin-only.
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
          type: eq.category || eq.type || "",
          siteName: eq.currentLocation?.siteName || eq.location || "",
          lat: eq.currentLocation?.lat ?? "",
          lng: eq.currentLocation?.lng ?? "",
          operatingCostPerDay: eq.totalMaintenanceCost || eq.operatingCostPerDay || "",
          maintenanceIntervalDays: eq.maintenanceIntervalDays || 90,
          lastServiceDate: eq.lastServiceDate ? eq.lastServiceDate.slice(0, 10) : "",
          purchaseDate: eq.purchaseDate ? eq.purchaseDate.slice(0, 10) : "",
        })
      )
      .catch((err) => setApiError(err?.response?.data?.message || "Failed to load equipment record."))
      .finally(() => setLoading(false));
  }, [id, getById]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = "Enter equipment name";
    if (!form.type) errs.type = "Select equipment category";
    if (!form.siteName) errs.siteName = "Enter current site name";
    if (form.lat === "" || isNaN(form.lat)) errs.lat = "Enter valid latitude";
    if (form.lng === "" || isNaN(form.lng)) errs.lng = "Enter valid longitude";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError("");
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        category: form.type,
        currentLocation: {
          siteName: form.siteName,
          lat: Number(form.lat),
          lng: Number(form.lng),
        },
        totalMaintenanceCost: Number(form.operatingCostPerDay) || 0,
        maintenanceIntervalDays: Number(form.maintenanceIntervalDays) || 90,
        lastServiceDate: form.lastServiceDate || null,
        purchaseDate: form.purchaseDate || null,
      };

      await updateEquipment(id, payload);
      navigate(`/equipment/manage`);
    } catch (err) {
      setApiError(err?.response?.data?.message || "Failed to update equipment.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading equipment details..." />;
  if (!form) return apiError ? <ErrorMessage message={apiError} /> : null;

  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Edit Fleet Asset</h1>
          <p className="text-sm text-gray-400 mt-1">
            Modify equipment specifications, tracking coordinates, and maintenance parameters.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400 border border-purple-500/20">
          Admin Control
        </span>
      </div>

      {apiError && (
        <div className="mb-6 rounded-md border-l-4 border-red-500 bg-red-950/50 p-4 shadow-sm">
          <ErrorMessage message={apiError} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 bg-[#1c1c1f] border border-[#2a2a2d] rounded-lg shadow-md" style={{ colorScheme: 'dark' }}>
        
        {/* Basic Info Section */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#a78bfa] mb-4 border-b border-[#2a2a2d] pb-2">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              error={errors.type}
              required
            />
          </div>
        </div>

        {/* Geographic Location Section */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#a78bfa] mb-4 border-b border-[#2a2a2d] pb-2">
            Geographic Coordinates (AI Proximity Engine)
          </h2>
          <div className="mb-4">
            <Input
              label="Current Site Name"
              name="siteName"
              value={form.siteName}
              onChange={(e) => update("siteName", e.target.value)}
              error={errors.siteName}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude"
              name="lat"
              type="number"
              step="any"
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
              value={form.lng}
              onChange={(e) => update("lng", e.target.value)}
              error={errors.lng}
              required
            />
          </div>
        </div>

        {/* AI & Financial Metrics Section */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#a78bfa] mb-4 border-b border-[#2a2a2d] pb-2">
            AI Training Parameters
          </h2>
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
              label="Purchase Date"
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

        {/* Form Actions */}
        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[#2a2a2d]">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => navigate("/equipment/manage")}
            className="border-[#2a2a2d] text-gray-300 hover:bg-[#2a2a2d]"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            loading={saving}
            className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white border-none"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}