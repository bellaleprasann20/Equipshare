import React from "react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    end: true,
  },
  {
    to: "/equipment",
    label: "Equipment",
    end: true,
  },
  {
    to: "/allocation",
    label: "New Requirement",
    end: true,
  },
  {
    to: "/allocation/history",
    label: "Allocation & Order History",
    end: true,
  },
  {
    to: "/locations",
    label: "Site Locations",
    end: true,
  },
  {
    to: "/analytics",
    label: "Analytics",
    end: true,
  },
  {
    to: "/orders",
    label: "My Orders",
    end: true,
  },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-[#2a2a2d] bg-[#1c1c1f] md:block">
      <nav
        className="flex flex-col py-4"
        aria-label="Project Manager navigation"
      >
        {/* Workspace */}
        <div className="px-5 pb-2 pt-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
            Workspace
          </p>
        </div>

        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                "relative border-l-2 px-5 py-3 text-sm transition-colors",
                isActive
                  ? "border-[#8b5cf6] bg-[#8b5cf6]/10 font-semibold text-white"
                  : "border-transparent text-gray-400 hover:bg-white/[0.03] hover:text-white",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}

        {/* Account */}
        <div className="mt-6 border-t border-[#2a2a2d] pt-4">
          <div className="px-5 pb-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              Account
            </p>
          </div>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              [
                "border-l-2 px-5 py-3 text-sm transition-colors",
                isActive
                  ? "border-[#8b5cf6] bg-[#8b5cf6]/10 font-semibold text-white"
                  : "border-transparent text-gray-400 hover:bg-white/[0.03] hover:text-white",
              ].join(" ")
            }
          >
            Profile
          </NavLink>
        </div>
      </nav>
    </aside>
  );
}