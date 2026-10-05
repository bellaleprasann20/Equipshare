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
        { to: "/equipment", label: "Equipment Catalog" },
        { to: "/equipment/manage", label: "Table View" },
        ...(isAdmin ? [{ to: "/equipment/add", label: "Add Equipment" }] : []),
      ],
    },
    {
      title: "Allocation",
      links: [
        { to: "/allocation", label: "New Requirement" },
        { to: "/allocation/history", label: "Allocation History" },
        ...(isAdmin ? [{ to: "/admin/approvals", label: "Approval Queue" }] : []),
      ],
    },
    {
      title: "Insights",
      links: [
        { to: "/analytics", label: "Analytics" },
        ...(isAdmin ? [{ to: "/admin", label: "Fleet Overview" }] : []),
      ],
    },
    {
      title: "Workspace",
      links: [
        { to: isAdmin ? "/admin" : "/dashboard", label: "Dashboard" },
        ...(!isAdmin ? [{ to: "/orders", label: "My Orders" }] : []),
      ],
    },
  ];

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-8 md:grid-cols-5">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-6 w-6 items-center justify-center bg-signal font-display text-xs font-bold text-white rounded-sm shadow-sm">
              E
            </span>
            <p className="font-display text-xl font-bold text-ink tracking-tight">EquipShare</p>
          </div>
          <p className="mt-3 text-sm text-steel leading-relaxed">
            Intelligent construction equipment allocation and utilization platform.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-ink">
              {col.title}
            </p>
            <ul className="flex flex-col gap-3">
              {col.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm font-medium text-steel hover:text-signal transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs font-medium text-steel-light sm:px-8">
          <span>© {new Date().getFullYear()} EquipShare</span>
          <span>MCA Capstone Project, PES University</span>
        </div>
      </div>
    </footer>
  );
}