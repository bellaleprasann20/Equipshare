import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const columns = [
    {
      title: "Fleet",
      links: [
        { to: "/equipment", label: "Equipment Catalog" },
        { to: "/locations", label: "Site Locations" },
      ],
    },
    {
      title: "Allocation",
      links: [
        { to: "/allocation/history" },
        {  label: "Allocation History & Order History" },
      ],
    },
    {
      title: "Workspace",
      links: [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/orders", label: "My Orders" },
        { to: "/analytics", label: "Analytics" },
      ],
    },
  ];

  return (
    <footer className="border-t border-[#2a2a2d] bg-[#1c1c1f]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-8 md:grid-cols-4">
        {/* Brand */}
        <div>
          <Link
            to="/dashboard"
            className="mb-3 flex items-center gap-2"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#8b5cf6] font-display text-sm font-bold text-white">
              E
            </span>

            <span className="font-display text-xl font-bold tracking-tight text-white">
              EquipShare
            </span>
          </Link>

          <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-400">
            Intelligent construction equipment allocation
            and utilization platform.
          </p>
        </div>

        {/* Navigation */}
        {columns.map((column) => (
          <div key={column.title}>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white">
              {column.title}
            </p>

            <ul className="flex flex-col gap-3">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm font-medium text-gray-400 transition-colors hover:text-[#8b5cf6]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="border-t border-[#2a2a2d]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs font-medium text-gray-500 sm:px-8">
          <span>
            © {new Date().getFullYear()} EquipShare
          </span>

          <span>
            MCA Capstone Project, PES University
          </span>
        </div>
      </div>
    </footer>
  );
}