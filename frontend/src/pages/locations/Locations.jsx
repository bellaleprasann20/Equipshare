
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useEquipment } from "../../hooks/useEquipment";
import {
  fetchMyProjects,
  completeProject,
} from "../../services/projectService";
import { fetchAllocationHistory } from "../../services/allocationService";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

import {
  MapPin,
  Building2,
  Truck,
  Search,
  Package,
  CheckCircle2,
  Navigation,
} from "lucide-react";

function normalizeLocation(location) {
  return String(location || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function getId(value) {
  if (!value) return "";
  return String(value._id || value);
}

function getEquipmentType(type) {
  const labels = {
    excavator: "Excavator",
    crane: "Crane",
    bulldozer: "Bulldozer",
    loader: "Loader",
    concrete_mixer: "Concrete Mixer",
    dump_truck: "Dump Truck",
  };

  return labels[type] || type || "Unknown";
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-steel">
          {label}
        </p>

        <Icon className="h-5 w-5 text-signal" />
      </div>

      <p className="mt-3 font-display text-3xl font-bold text-ink">
        {value}
      </p>
    </div>
  );
}

export default function Locations() {
  const navigate = useNavigate();
  const { fetchEquipment } = useEquipment();

  const [projects, setProjects] = useState([]);
  const [machines, setMachines] = useState([]);
  const [allocations, setAllocations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [completingProjectId, setCompletingProjectId] =
    useState(null);

  const [filter, setFilter] = useState("");

  // Load projects, equipment and allocation history.
  useEffect(() => {
    let mounted = true;

    async function loadLocations() {
      try {
        setLoading(true);
        setError("");

        const [
          projectResponse,
          equipmentResponse,
          allocationResponse,
        ] = await Promise.all([
          fetchMyProjects(),

          fetchEquipment({
            filters: {},
            page: 1,
            pageSize: 500,
          }),

          fetchAllocationHistory({
            page: 1,
            pageSize: 50,
          }),
        ]);

        if (!mounted) return;

        setProjects(
          Array.isArray(projectResponse)
            ? projectResponse
            : []
        );

        setMachines(
          Array.isArray(equipmentResponse?.items)
            ? equipmentResponse.items
            : []
        );

        setAllocations(
          Array.isArray(allocationResponse?.items)
            ? allocationResponse.items
            : []
        );
      } catch (err) {
        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load project locations."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadLocations();

    return () => {
      mounted = false;
    };
  }, [fetchEquipment]);

  // Complete project and refresh related information.
  async function handleCompleteProject(project) {
    if (!project?._id || project.status === "completed") {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to complete "${project.name}"?\n\n` +
        "Its active allocations will be marked as completed, " +
        "pending requests will be cancelled, and eligible allocated equipment will be released."
    );

    if (!confirmed) return;

    try {
      setCompletingProjectId(project._id);
      setError("");
      setSuccess("");

      const result = await completeProject(project._id);

      const [
        projectResponse,
        equipmentResponse,
        allocationResponse,
      ] = await Promise.all([
        fetchMyProjects(),

        fetchEquipment({
          filters: {},
          page: 1,
          pageSize: 500,
        }),

        fetchAllocationHistory({
          page: 1,
          pageSize: 50,
        }),
      ]);

      setProjects(
        Array.isArray(projectResponse)
          ? projectResponse
          : []
      );

      setMachines(
        Array.isArray(equipmentResponse?.items)
          ? equipmentResponse.items
          : []
      );

      setAllocations(
        Array.isArray(allocationResponse?.items)
          ? allocationResponse.items
          : []
      );

      setSuccess(
        result?.message ||
          `"${project.name}" has been completed successfully.`
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "The project may have been completed, but refreshing the data failed."
      );
    } finally {
      setCompletingProjectId(null);
    }
  }

  // Match allocation history to its project.
  function getProjectAllocations(projectId) {
    return allocations.filter(
      (allocation) =>
        getId(allocation.projectId) === getId(projectId)
    );
  }

  // Group projects by their recorded location.
  const sites = useMemo(() => {
    const groups = new Map();

    projects.forEach((project) => {
      const locationKey = normalizeLocation(project.location);

      if (!locationKey) return;

      if (!groups.has(locationKey)) {
        groups.set(locationKey, {
          key: locationKey,
          name: String(project.location).trim(),
          projects: [],
          machines: [],
        });
      }

      groups.get(locationKey).projects.push(project);
    });

    // Match equipment using its recorded location.
    machines.forEach((machine) => {
      const machineLocation =
        machine.location ||
        machine.currentLocation?.siteName ||
        "";

      const locationKey = normalizeLocation(machineLocation);
      const group = groups.get(locationKey);

      if (group) {
        group.machines.push(machine);
      }
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,

        total: group.machines.length,

        available: group.machines.filter(
          (machine) =>
            machine.availability === "available"
        ).length,
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name)
      );
  }, [projects, machines]);

  // Search project name or location.
  const visibleSites = useMemo(() => {
    const query = filter.trim().toLowerCase();

    if (!query) return sites;

    return sites.filter((site) => {
      const projectMatch = site.projects.some(
        (project) =>
          project.name?.toLowerCase().includes(query)
      );

      return (
        site.name.toLowerCase().includes(query) ||
        projectMatch
      );
    });
  }, [sites, filter]);

  function openDirections(site) {
    const project = site.projects.find(
      (item) =>
        Number.isFinite(Number(item.coordinates?.lat)) &&
        Number.isFinite(Number(item.coordinates?.lng))
    );

    if (!project) {
      window.alert("Coordinates are not available for this project.");
      return;
    }

    const lat = Number(project.coordinates.lat);
    const lng = Number(project.coordinates.lng);

    const url =
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (loading) {
    return <Loader label="Loading project locations..." />;
  }

  return (
    <div className="flex flex-col gap-6">

      {/* HEADER */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-signal">
          Project Site Management
        </p>

        <h1 className="mt-2 font-display text-3xl font-bold text-ink">
          Project Locations
        </h1>

        <p className="mt-2 text-sm text-steel">
          Explore your registered construction projects,
          their locations, and the equipment present at each site.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {success && (
        <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* SUMMARY */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={Building2}
          label="Total Projects"
          value={projects.length}
        />

        <SummaryCard
          icon={MapPin}
          label="Project Locations"
          value={sites.length}
        />

        <SummaryCard
          icon={Truck}
          label="Registered Equipment"
          value={machines.length}
        />
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />

        <input
          value={filter}
          onChange={(event) =>
            setFilter(event.target.value)
          }
          placeholder="Search project name or location..."
          className="w-full border border-line bg-surface py-3 pl-10 pr-4 text-sm text-ink outline-none focus:border-signal"
        />
      </div>

      {/* FULL-WIDTH PROJECT DIRECTORY */}
      <div className="flex w-full flex-col border border-line bg-surface">

        <div className="border-b border-line p-4">
          <h2 className="font-display font-semibold text-ink">
            Project directory
          </h2>

          <p className="mt-1 text-xs text-steel">
            {visibleSites.length} matching site(s)
          </p>
        </div>

        <div className="divide-y divide-line">

          {visibleSites.length === 0 && (
            <p className="p-5 text-sm text-steel">
              No projects or locations found.
            </p>
          )}

          {visibleSites.map((site) => (
            <div
              key={site.key}
              className="p-5"
            >

              {/* SITE INFORMATION */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-signal" />

                  <div>
                    <p className="font-display font-semibold text-ink">
                      {site.name}
                    </p>

                    <p className="mt-1 text-xs text-steel">
                      {site.projects.length} project(s)
                      {" · "}
                      {site.total} machine(s)
                      {" · "}
                      {site.available} available
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => openDirections(site)}
                  className="flex items-center gap-1 text-xs font-medium text-steel hover:text-ink"
                >
                  <Navigation className="h-3 w-3" />
                  Directions
                </button>
              </div>

              {/* PROJECTS AND ALLOCATIONS */}
              <div className="mt-5 grid gap-4 md:grid-cols-2">

                {site.projects.map((project) => {
                  const projectAllocations =
                    getProjectAllocations(project._id);

                  const isCompleting =
                    completingProjectId === project._id;

                  return (
                    <div
                      key={project._id}
                      className="border border-line bg-paper p-4"
                    >

                      <p className="text-sm font-semibold text-ink">
                        {project.name}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <p className="text-xs text-steel">
                          Project status: {project.status}
                        </p>

                        {project.status !== "completed" ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleCompleteProject(project)
                            }
                            disabled={completingProjectId !== null}
                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isCompleting
                              ? "Completing..."
                              : "Complete Project"}
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-600">
                            <CheckCircle2 className="mr-1 inline h-3 w-3" />
                            Completed
                          </span>
                        )}
                      </div>

                      {/* SMART ALLOCATION REQUESTS */}
                      <div className="mt-4 space-y-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-steel">
                          Smart Allocation Requests
                        </p>

                        {projectAllocations.length === 0 ? (
                          <p className="text-xs text-steel">
                            No Smart Allocation requests recorded for this project.
                          </p>
                        ) : (
                          projectAllocations.map((allocation) => {
                            const assignedMachine =
                              allocation.allocatedEquipment ||
                              (
                                allocation.allocatedEquipmentId &&
                                typeof allocation.allocatedEquipmentId === "object"
                                  ? allocation.allocatedEquipmentId
                                  : null
                              );

                            const assignedMachineName =
                              assignedMachine?.name ||
                              allocation.allocatedEquipmentName;

                            return (
                              <div
                                key={allocation._id}
                                className="rounded-lg border border-line bg-surface p-3"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-semibold text-ink">
                                    {getEquipmentType(
                                      allocation.equipmentType
                                    )}
                                  </p>

                                  <span
                                    className={[
                                      "text-[10px] font-semibold uppercase",
                                      allocation.status === "active"
                                        ? "text-emerald-500"
                                        : allocation.status === "pending"
                                        ? "text-amber-500"
                                        : allocation.status === "rejected"
                                        ? "text-red-500"
                                        : "text-steel",
                                    ].join(" ")}
                                  >
                                    {allocation.status}
                                  </span>
                                </div>

                                <p className="mt-1 text-[11px] text-steel">
                                  {allocation.requiredFrom
                                    ? new Date(
                                        allocation.requiredFrom
                                      ).toLocaleDateString()
                                    : "Start date unavailable"}
                                  {" – "}
                                  {allocation.requiredTo
                                    ? new Date(
                                        allocation.requiredTo
                                      ).toLocaleDateString()
                                    : "End date unavailable"}
                                </p>

                                {(allocation.status === "active" ||
                                  allocation.status === "completed") &&
                                assignedMachineName ? (
                                  <div className="mt-2 border-t border-line pt-2">
                                    <p className="text-[11px] font-semibold text-emerald-500">
                                      {allocation.status === "completed"
                                        ? "Previously Assigned Equipment"
                                        : "Assigned Equipment"}
                                    </p>

                                    <p className="mt-1 text-xs font-medium text-ink">
                                      {assignedMachineName}
                                    </p>

                                    {assignedMachine?.type && (
                                      <p className="text-[11px] text-steel">
                                        {getEquipmentType(
                                          assignedMachine.type
                                        )}
                                      </p>
                                    )}
                                  </div>
                                ) : allocation.status === "pending" ? (
                                  <p className="mt-2 text-[11px] text-amber-500">
                                    Waiting for administrator approval.
                                  </p>
                                ) : allocation.status === "active" ? (
                                  <p className="mt-2 text-[11px] text-steel">
                                    Allocation is active, but equipment details are unavailable.
                                  </p>
                                ) : null}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}

              </div>

              {/* REGISTERED EQUIPMENT */}
              <div className="mt-5 border-t border-line pt-4">
                <div className="mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-signal" />

                  <p className="text-xs font-semibold text-ink">
                    Equipment at this location
                  </p>
                </div>

                {site.machines.length === 0 ? (
                  <p className="text-xs text-steel">
                    No equipment recorded at this location.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {site.machines.map((machine) => (
                      <div
                        key={machine._id}
                        className="flex items-center justify-between gap-3 border border-line bg-paper p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-ink">
                            {machine.name}
                          </p>

                          <p className="text-[11px] text-steel">
                            {getEquipmentType(machine.type)}
                          </p>
                        </div>

                        <span
                          className={[
                            "shrink-0 text-[10px] font-semibold",
                            machine.availability === "available"
                              ? "text-emerald-500"
                              : machine.availability === "in_use"
                              ? "text-amber-500"
                              : "text-steel",
                          ].join(" ")}
                        >
                          {machine.availability?.replace("_", " ") || "Unknown"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ACTION */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <button
                  onClick={() =>
                    navigate(
                      `/equipment?mode=rent&q=${encodeURIComponent(site.name)}`
                    )
                  }
                  className="font-medium text-signal hover:text-signal-dark"
                >
                  See equipment
                </button>
              </div>

            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
