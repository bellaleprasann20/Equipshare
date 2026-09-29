import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEquipment } from "../../hooks/useEquipment";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

const DEFAULT_CENTER = [12.98, 77.62];

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 13, { duration: 0.8 });
  }, [target, map]);
  return null;
}

export default function Locations() {
  const navigate = useNavigate();
  const { fetchEquipment } = useEquipment();

  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [selectedName, setSelectedName] = useState(null);

  useEffect(() => {
    fetchEquipment({ filters: {}, page: 1, pageSize: 500 })
      .then((res) => setMachines(res.items))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load locations."))
      .finally(() => setLoading(false));
  }, [fetchEquipment]);

  const sites = useMemo(() => {
    const groups = {};
    machines.forEach((m) => {
      if (!groups[m.location]) {
        groups[m.location] = {
          name: m.location,
          latSum: 0,
          lngSum: 0,
          coordCount: 0,
          total: 0,
          available: 0,
          eeiSum: 0,
          eeiCount: 0,
        };
      }
      const g = groups[m.location];
      g.total += 1;
      if (m.availability === "available") g.available += 1;
      if (typeof m.eeiScore === "number") {
        g.eeiSum += m.eeiScore;
        g.eeiCount += 1;
      }
      if (m.coordinates?.lat != null && m.coordinates?.lng != null) {
        g.latSum += m.coordinates.lat;
        g.lngSum += m.coordinates.lng;
        g.coordCount += 1;
      }
    });

    return Object.values(groups)
      .filter((g) => g.coordCount > 0)
      .map((g) => ({
        name: g.name,
        lat: g.latSum / g.coordCount,
        lng: g.lngSum / g.coordCount,
        total: g.total,
        available: g.available,
        avgEEI: g.eeiCount ? Math.round((g.eeiSum / g.eeiCount) * 10) / 10 : null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [machines]);

  const visibleSites = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q ? sites.filter((s) => s.name.toLowerCase().includes(q)) : sites;
  }, [sites, filter]);

  const selected = sites.find((s) => s.name === selectedName) || null;

  const openDirections = (site) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${site.lat},${site.lng}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (loading) return <Loader label="Loading locations..." />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Locations</h1>
        <p className="mt-1 text-steel">
          {sites.length} sites where your machines are currently based. Pick one to see what is there.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Map */}
        <div className="relative isolate border border-line bg-white">
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={10}
            scrollWheelZoom={false}
            className="h-[460px] w-full"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FlyTo target={selected} />
            {sites.map((site) => {
              const isSelected = site.name === selectedName;
              return (
                <CircleMarker
                  key={site.name}
                  center={[site.lat, site.lng]}
                  radius={isSelected ? 14 : 9}
                  pathOptions={{
                    color: isSelected ? "#10151b" : "#e8602c",
                    fillColor: "#e8602c",
                    fillOpacity: 0.8,
                    weight: 2,
                  }}
                  eventHandlers={{ click: () => setSelectedName(site.name) }}
                >
                  <Popup>
                    <strong>{site.name}</strong>
                    <br />
                    {site.total} machines, {site.available} available
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        {/* Directory */}
        <div className="flex flex-col border border-line bg-white">
          <div className="border-b border-line p-3">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search sites"
              className="w-full border border-line px-3 py-2 text-sm placeholder:text-steel-light focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
            />
          </div>

          <div className="max-h-[404px] flex-1 overflow-y-auto">
            {visibleSites.length === 0 && (
              <p className="p-4 text-sm text-steel">No sites match "{filter}".</p>
            )}

            {visibleSites.map((site) => {
              const isSelected = site.name === selectedName;
              return (
                <div
                  key={site.name}
                  className={[
                    "border-b border-line border-l-2 p-4",
                    isSelected ? "border-l-signal bg-paper" : "border-l-transparent",
                  ].join(" ")}
                >
                  <button
                    onClick={() => setSelectedName(site.name)}
                    className="block w-full text-left"
                  >
                    <p className="font-display font-semibold text-ink">{site.name}</p>
                    <p className="mt-1 text-sm text-steel">
                      <span className="font-mono">{site.total}</span> machines,{" "}
                      <span className="font-mono">{site.available}</span> available
                      {site.avgEEI !== null && (
                        <>
                          , average EEI <span className="font-mono">{site.avgEEI}</span>
                        </>
                      )}
                    </p>
                  </button>
                  <div className="mt-3 flex gap-4 text-sm">
                    <button
                      onClick={() =>
                        navigate(`/equipment?mode=rent&q=${encodeURIComponent(site.name)}`)
                      }
                      className="font-medium text-signal hover:text-signal-dark"
                    >
                      See equipment
                    </button>
                    <button
                      onClick={() => openDirections(site)}
                      className="text-steel hover:text-ink"
                    >
                      Directions
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}