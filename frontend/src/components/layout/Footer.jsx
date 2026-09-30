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
        { to: "/equipment?mode=rent", label: "Rent equipment" },
        { to: "/equipment?mode=buy", label: "Buy equipment" },
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
        { to: "/orders", label: "My orders" },
      ],
    },
  ];

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-8 md:grid-cols-5">
        <div className="md:col-span-1">
          <p className="font-display text-xl font-bold text-ink">MachineHub</p>
          <p className="mt-3 text-sm text-steel">
            Intelligent construction equipment allocation and utilization.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink">
              {col.title}
            </p>
            <ul className="flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-steel hover:text-signal">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-steel-light sm:px-8">
          <span>© {new Date().getFullYear()} MachineHub</span>
          <span>MCA capstone project, PES University</span>
        </div>
      </div>
    </footer>
  );
}