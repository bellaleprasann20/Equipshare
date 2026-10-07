import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  // Strictly Project Manager / User Links
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
        { to: "/allocation", label: "New Requirement" },
        { to: "/allocation/history", label: "Allocation History" },
      ],
    },
    {
      title: "Workspace",
      links: [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/orders", label: "My Active Orders" },
        { to: "/analytics", label: "Analytics" },
      ],
    },
  ];

  return (
    <footer className="border-t border-[#2a2a2d] bg-[#1c1c1f]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-8 md:grid-cols-4">
        {/* Brand Column */}
        <div className="md:col-span-1">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#8b5cf6] font-display text-xs font-bold text-white shadow-sm">
              E
            </span>
            <p className="font-display text-xl font-bold tracking-tight text-white">EquipShare</p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            Intelligent construction equipment allocation and utilization platform.
          </p>
        </div>

        {/* Navigation Columns */}
        {columns.map((col) => (
          <div key={col.title}>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white">
              {col.title}
            </p>
            <ul className="flex flex-col gap-3">
              {col.links.map((link) => (
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

      {/* Copyright Strip */}
      <div className="border-t border-[#2a2a2d]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs font-medium text-gray-500 sm:px-8">
          <span>© {new Date().getFullYear()} EquipShare</span>
          <span>MCA Capstone Project, PES University</span>
        </div>
      </div>
    </footer>
  );
}