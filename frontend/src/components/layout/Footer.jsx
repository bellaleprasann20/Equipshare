import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Footer() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const columns = [
    {
      title: "Fleet",
      links: [
        { to: "/equipment", label: "Equipment catalog" },
        { to: "/equipment/manage", label: "Table view" },
        ...(isAdmin ? [{ to: "/equipment/add", label: "Add equipment" }] : []),
      ],
    },
    {
      title: "Allocation",
      links: [
        { to: "/allocation", label: "New requirement" },
        { to: "/allocation/history", label: "Allocation history" },
      ],
    },
    {
      title: "Insights",
      links: [
        { to: "/analytics", label: "Analytics" },
        ...(isAdmin ? [{ to: "/admin", label: "Fleet overview" }] : []),
      ],
    },
    {
      title: "Account",
      links: [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/login", label: "Switch account" },
      ],
    },
  ];

  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-8 md:grid-cols-5">
        <div className="md:col-span-1">
          <p className="font-display text-xl font-bold">EquipShare</p>
          <p className="mt-3 text-sm text-white/55">
            Intelligent construction equipment allocation and utilization.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white">
              {col.title}
            </p>
            <ul className="flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-white/60 hover:text-signal">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-white/45 sm:px-8">
          <span>© {new Date().getFullYear()} EquipShare</span>
          <span>MCA capstone project, PES University</span>
        </div>
      </div>
    </footer>
  );
}